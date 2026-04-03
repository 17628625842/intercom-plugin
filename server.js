require("dotenv").config()
const express = require("express")
const cors = require("cors")

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.post("/intercom/initialize", (req, res) => {
    const conversation = req.body.conversation || {}
    const conversationId = extractConversationId(req) || conversation.id || "unknown"

    console.log(`🔍 客服端 - 对话 ID: ${conversationId}`)

    // ⚠️ 注意：每个按钮都必须包含 action 字段！
    const response = {
        canvas: {
            content: {
                components: [
                    {
                        type: "text",
                        text: "💰 打赏插件",
                        style: "header",
                    },
                    {
                        type: "text",
                        text: "点击下方按钮，向用户发送打赏卡片",
                    },
                    {
                        type: "button",
                        id: "send_tip_card",
                        label: "📤 发送打赏卡片",
                        style: "primary",
                        action: {
                            type: "submit", // ✅ 必须包含
                        },
                    },
                ],
            },
            metadata: { conversationId, currentView: "main" },
        },
    }

    console.log("[Configure] Response:", JSON.stringify(response, null, 2))
    res.json(response)
})

app.post("/intercom/submit", (req, res) => {
    const { component_id, canvas } = req.body
    const conversationId = extractConversationId(req) || canvas?.metadata?.conversationId || "unknown"
    const adminId = req.body.admin?.id || "unknown"
    const adminName = req.body.admin?.name || "客服"

    console.log(`🔍 客服操作: ${component_id}, 对话 ID: ${conversationId}`)

    // 关键：返回 card_creation_options 而不是 results
    // 这样 Intercom 才会调用 initialize_url 来渲染用户端卡片
    res.json({
        canvas: {
            content: {
                components: [
                    { type: "text", text: "✅ 已发送", style: "header" },
                    { type: "divider" },
                    {
                        type: "text",
                        text: "💰 打赏插件",
                        style: "header",
                    },
                    {
                        type: "text",
                        text: "点击下方按钮，向用户发送打赏卡片",
                    },
                    {
                        type: "button",
                        id: "send_tip_card",
                        label: "📤 发送打赏卡片",
                        style: "primary",
                        action: {
                            type: "submit",
                        },
                    },
                ],
            },
            metadata: { conversationId, currentView: "success" },
        },
        card_creation_options: {
            admin_id: adminId,
            admin_name: adminName,
            conversationId: conversationId,
        },
    })
})

// ==================== 用户端卡片初始化 (Initialize) ====================
app.post("/canvas/user/initialize", (req, res) => {
    const conversationId = extractConversationId(req)
    console.log(`🎯 Canvas 用户端 - 对话 ID: ${conversationId}`)

    res.json({
        canvas: {
            content: {
                components: [
                    { type: "text", text: `💝 Thank `, style: "header" },
                    { type: "text", text: "Your support means a lot ✨", style: "muted" },
                    { type: "button", label: "💵 $1", style: "primary", id: "tip_1", action: { type: "submit" } },
                    { type: "button", label: "💵 $5", style: "primary", id: "tip_5", action: { type: "submit" } },
                    { type: "button", label: "💵 $10", style: "primary", id: "tip_10", action: { type: "submit" } },
                    { type: "button", label: "💵 $20", style: "primary", id: "tip_20", action: { type: "submit" } },
                    { type: "button", label: "✨ Custom Amount", style: "secondary", id: "tip_custom", action: { type: "submit" } },
                ],
            },
            metadata: { conversationId },
        },
    })
})

// 用户点击按钮后的处理
app.post("/canvas/user/submit", (req, res) => {
    const { component_id, card_creation_options, context } = req.body
    const adminId = card_creation_options?.admin_id || "unknown"
    const amount = component_id === "tip_5" ? 5 : 10
    const conversationId = context?.conversation_id || "unknown"

    console.log(`🎯 用户操作: ${component_id}, 对话: ${conversationId}`)

    if (component_id == "back_to_amounts") {
        res.json({
            canvas: {
                content: {
                    components: [
                        { type: "text", text: `💝 Thank `, style: "header" },
                        { type: "text", text: "Your support means a lot ✨", style: "muted" },
                        { type: "button", label: "💵 $1", style: "primary", id: "tip_1", action: { type: "submit" } },
                        { type: "button", label: "💵 $5", style: "primary", id: "tip_5", action: { type: "submit" } },
                        { type: "button", label: "💵 $10", style: "primary", id: "tip_10", action: { type: "submit" } },
                        { type: "button", label: "💵 $20", style: "primary", id: "tip_20", action: { type: "submit" } },
                        { type: "button", label: "✨ Custom Amount", style: "secondary", id: "tip_custom", action: { type: "submit" } },
                    ],
                },
                metadata: { conversationId },
            },
        })
        return
    }

    res.json({
        canvas: {
            content: {
                components: [
                    { type: "button", label: "去支付", style: "primary", id: "TO", action: { type: "url", url: `https://mulebuy.com?id=${adminId}&money=${amount}` } },
                    { type: "button", label: "APP 去支付", style: "primary", id: "TO", action: { type: "url", url: `mulebuy://?id=${adminId}&money=${amount}` } },
                    { type: "button", label: "← Back", style: "secondary", id: "back_to_amounts", action: { type: "submit" } },
                ],
            },
        },
    })
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

/**
 * 从请求中提取对话 ID
 * @param {object} req - 请求对象
 * @returns {string|null} 对话 ID
 */
function extractConversationId(req) {
    console.log("🔍 开始提取对话 ID...")
    console.log("完整请求体:", JSON.stringify(req.body, null, 2))

    const possibleIds = [req.body.context?.conversation_id, req.body.conversation?.id, req.body.canvas?.metadata?.conversationId, req.body.conversationId, req.body.id]

    console.log("🔍 可能的 ID 来源:", possibleIds)

    for (const id of possibleIds) {
        if (id && id !== "unknown" && typeof id === "string" && id.length > 0) {
            console.log(`✅ 找到有效对话 ID: ${id}`)
            return id
        }
    }

    console.log("❌ 未找到有效对话 ID")
    return null
}
