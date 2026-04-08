const { logWithPrefix } = require("../utils/helpers")
const crypto = require("crypto")

// 存储所有的 SSE 连接
// 格式: { conversationId: res }
const connections = new Map()

// 这里的密钥应该在环境变量中
const SSE_SECRET = process.env.SSE_SECRET || "Scwc9Y5o8ln0Yai6"

/**
 * 验证 SSE 签名
 * @param {string} conversationId 对话 ID
 * @param {string} signature 签名
 * @returns {boolean}
 */
const verifySignature = (conversationId, signature) => {
    if (!signature) return false
    const expectedSignature = crypto.createHmac("sha256", SSE_SECRET).update(conversationId).digest("hex")
    return signature === expectedSignature
}

/**
 * 建立 SSE 连接
 */
const connect = (req, res) => {
    const { conversationId, signature } = req.query

    if (!conversationId) {
        return res.status(400).json({ error: "Missing conversationId" })
    }

    // 签名校验
    if (!verifySignature(conversationId, signature)) {
        logWithPrefix("❌", `SSE 签名验证失败: ${conversationId}`)
        return res.status(401).json({ error: "Invalid signature" })
    }

    // 设置 SSE 响应头
    res.setHeader("Content-Type", "text/event-stream")
    res.setHeader("Cache-Control", "no-cache")
    res.setHeader("Connection", "keep-alive")

    // 存储连接
    connections.set(conversationId, res)
    logWithPrefix("📡", `SSE 连接已建立: ${conversationId}`)

    // 发送初始消息
    res.write(`data: ${JSON.stringify({ status: "connected", conversationId })}\n\n`)

    // 定期发送心跳，防止连接超时
    const heartbeat = setInterval(() => {
        res.write(": heartbeat\n\n")
    }, 30000)

    // 连接断开处理
    req.on("close", () => {
        clearInterval(heartbeat)
        connections.delete(conversationId)
        logWithPrefix("🔌", `SSE 连接已断开: ${conversationId}`)
    })
}

/**
 * 向特定对话发送消息
 * @param {string} conversationId
 * @param {object} data
 */
const sendMessage = (conversationId, data) => {
    const res = connections.get(conversationId)
    if (res) {
        logWithPrefix("📤", `发送 SSE 消息到 ${conversationId}`, data)
        res.write(`data: ${JSON.stringify(data)}\n\n`)
        return true
    }
    logWithPrefix("⚠️", `未找到 SSE 连接: ${conversationId}`)
    return false
}

module.exports = {
    connect,
    sendMessage,
    verifySignature,
    SSE_SECRET,
}
