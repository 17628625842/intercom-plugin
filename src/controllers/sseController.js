const { logWithPrefix } = require("../utils/helpers")
const crypto = require("crypto")

// 存储所有的 SSE 连接
// 格式: { id: res } (id 可以是 userId 或 conversationId)
const connections = new Map()

// 存储 ID 映射
// 格式: { conversationId: userId }
const idMapping = new Map()

// 这里的密钥应该在环境变量中
const SSE_SECRET = process.env.SSE_SECRET || "Scwc9Y5o8ln0Yai6"

/**
 * 注册 ID 映射
 * @param {string} conversationId 
 * @param {string} userId 
 */
const registerMapping = (conversationId, userId) => {
    if (conversationId && userId) {
        idMapping.set(String(conversationId), String(userId))
        logWithPrefix("🔗", `已关联对话 ${conversationId} 与用户 ${userId}`)
    }
}

/**
 * 验证 SSE 签名
 * @param {string|number} id 用户 ID 或对话 ID
 * @param {string} signature 签名
 * @returns {boolean}
 */
const verifySignature = (id, signature) => {
    if (!signature) return false
    // 确保 id 是字符串，避免 TypeError [ERR_INVALID_ARG_TYPE]
    const idStr = String(id)
    const expectedSignature = crypto.createHmac("sha256", SSE_SECRET).update(idStr).digest("hex")
    return signature === expectedSignature
}

/**
 * 建立 SSE 连接
 */
const connect = (req, res) => {
    const { userId, conversationId, signature } = req.query
    
    // 优先使用 userId, 如果没有则使用 conversationId (用于向下兼容)
    const targetId = userId || conversationId

    if (!targetId) {
        return res.status(400).json({ error: "Missing userId or conversationId" })
    }

    // 签名校验
    if (!verifySignature(targetId, signature)) {
        logWithPrefix("❌", `SSE 签名验证失败: ${targetId}`)
        return res.status(401).json({ error: "Invalid signature" })
    }

    // 如果同时提供了两个 ID，则建立映射关系
    if (conversationId && userId) {
        registerMapping(conversationId, userId)
    }

    // 设置 SSE 响应头
    res.setHeader("Content-Type", "text/event-stream")
    res.setHeader("Cache-Control", "no-cache")
    res.setHeader("Connection", "keep-alive")
    res.setHeader("Access-Control-Allow-Origin", "*") // 允许跨域

    const idStr = String(targetId)

    // 存储连接
    connections.set(idStr, res)
    logWithPrefix("📡", `SSE 连接已建立: ${idStr}`)

    // 发送初始消息
    res.write(`data: ${JSON.stringify({ status: "connected", id: idStr })}\n\n`)

    // 定期发送心跳，防止连接超时
    const heartbeat = setInterval(() => {
        if (res.writableEnded) {
            clearInterval(heartbeat)
            return
        }
        res.write(": heartbeat\n\n")
    }, 30000)

    // 连接断开处理
    req.on("close", () => {
        clearInterval(heartbeat)
        connections.delete(idStr)
        logWithPrefix("🔌", `SSE 连接已断开: ${idStr}`)
    })
}

/**
 * 向特定 ID 发送消息 (会自动尝试查找映射关系)
 * @param {string|number} id 
 * @param {object} data
 */
const sendMessage = (id, data) => {
    const idStr = String(id)
    
    // 1. 直接尝试查找连接
    let res = connections.get(idStr)
    
    // 2. 如果没找到，且该 ID 可能是 conversationId，则尝试查找对应的 userId
    if (!res && idMapping.has(idStr)) {
        const mappedUserId = idMapping.get(idStr)
        logWithPrefix("🔗", `查找映射: ${idStr} -> ${mappedUserId}`)
        res = connections.get(mappedUserId)
    }
    
    // 3. 再次如果没找到，且该 ID 可能是 userId，则尝试反向查找 conversationId
    if (!res) {
        for (const [convId, uId] of idMapping.entries()) {
            if (uId === idStr) {
                logWithPrefix("🔗", `反向查找映射: ${idStr} -> ${convId}`)
                res = connections.get(convId)
                if (res) break
            }
        }
    }

    if (res) {
        logWithPrefix("📤", `发送 SSE 消息到 ${idStr}`, data)
        res.write(`data: ${JSON.stringify(data)}\n\n`)
        return true
    }
    
    logWithPrefix("⚠️", `未找到 SSE 连接: ${idStr}`)
    return false
}

module.exports = {
    connect,
    sendMessage,
    registerMapping,
    verifySignature,
    SSE_SECRET,
}
