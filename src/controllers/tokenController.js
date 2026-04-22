const { logWithPrefix } = require("../utils/helpers");
const crypto = require("crypto");

// 存储用户原始 Token (userId -> {token, timestamp})
const userTokenMap = new Map();
// 存储临时票据 (ticketId -> {token, userId, timestamp})
const ticketMap = new Map();

// Token 有效期：10 分钟
const TOKEN_TTL = 10 * 60 * 1000;
// 票据有效期：5 分钟
const TICKET_TTL = 5 * 60 * 1000;

/**
 * 存储 Token (由 App 调用)
 * 需要简单的签名校验或 SecretKey
 */
const saveToken = (req, res) => {
    const { userId, token } = req.body;
    if (!userId || !token) return res.status(400).json({ error: "Required fields missing" });

    userTokenMap.set(String(userId), {
        token,
        timestamp: Date.now()
    });
    
    logWithPrefix("💾", `Token 预存成功: userId=${userId}`);
    res.json({ success: true });
};

/**
 * 交换临时票据 (由插件内部调用)
 */
const exchangeTicket = (userId) => {
    const userData = userTokenMap.get(String(userId));
    if (!userData || (Date.now() - userData.timestamp > TOKEN_TTL)) {
        userTokenMap.delete(String(userId));
        return null;
    }

    const ticketId = crypto.randomBytes(16).toString("hex");
    ticketMap.set(ticketId, {
        token: userData.token,
        userId: userId,
        timestamp: Date.now()
    });

    return ticketId;
};

/**
 * 使用票据获取 Token (由 H5 调用)
 * 获取后立即销毁
 */
const getTokenByTicket = (req, res) => {
    const { ticketId } = req.params;
    const ticketData = ticketMap.get(ticketId);

    if (!ticketData) {
        return res.status(404).json({ error: "Invalid or expired ticket" });
    }

    // 检查是否过期
    if (Date.now() - ticketData.timestamp > TICKET_TTL) {
        ticketMap.delete(ticketId);
        return res.status(403).json({ error: "Ticket expired" });
    }

    // 阅后即焚
    ticketMap.delete(ticketId);
    
    logWithPrefix("📤", `票据已兑换: userId=${ticketData.userId}`);
    res.json({ token: ticketData.token });
};

// 定期清理过期数据
setInterval(() => {
    const now = Date.now();
    for (const [id, data] of userTokenMap) {
        if (now - data.timestamp > TOKEN_TTL) userTokenMap.delete(id);
    }
    for (const [id, data] of ticketMap) {
        if (now - data.timestamp > TICKET_TTL) ticketMap.delete(id);
    }
}, 60000);

module.exports = {
    saveToken,
    exchangeTicket,
    getTokenByTicket
};
