require("dotenv").config()
const express = require("express")
const cors = require("cors")

const app = express()
const PORT = process.env.PORT || 3000

// 中间件
app.use(cors())
app.use(express.json())

// 存储客服ID与会话的映射（生产环境应使用数据库）
const conversationTips = new Map()

// ==================== 打赏卡片组件定义 ====================
// 用户端看到的打赏卡片（Canvas 卡片）
const createTipCardCanvas = (adminId, adminName = "客服") => ({
    canvas: {
        content: {
            components: [
                {
                    type: "text",
                    style: "header",
                    text: `🎁 支持一下 ${adminName}`,
                },
                {
                    type: "text",
                    text: "感谢您的支持！请选择打赏金额：",
                },
                {
                    type: "row",
                    components: [
                        {
                            type: "button",
                            id: "tip_5_usd",
                            label: "$5",
                            style: "primary",
                            action: {
                                type: "url",
                                url: `https://mulebuy.com?id=${adminId}&money=5`,
                            },
                        },
                        {
                            type: "button",
                            id: "tip_10_usd",
                            label: "$10",
                            style: "primary",
                            action: {
                                type: "url",
                                url: `https://mulebuy.com?id=${adminId}&money=10`,
                            },
                        },
                    ],
                },
                {
                    type: "text",
                    text: "点击按钮后将跳转到支付页面完成打赏 🙏",
                    style: "muted",
                },
            ],
        },
    },
})

// 客服主界面（带发送按钮）
const createAdminHomeCanvas = () => ({
    canvas: {
        content: {
            components: [
                {
                    type: "text",
                    style: "header",
                    text: "💰 打赏插件",
                },
                {
                    type: "text",
                    text: "点击下方按钮，向用户发送打赏卡片。用户点击后可以给您打赏。",
                },
                {
                    type: "button",
                    id: "send_tip_card",
                    label: "📤 发送打赏卡片给用户",
                    style: "primary",
                    action: {
                        type: "submit",
                    },
                },
                {
                    type: "divider",
                },
                {
                    type: "text",
                    text: "💡 提示：打赏金额将通过 mulebuy.com 处理",
                    style: "muted",
                },
            ],
        },
        stored_data: {
            last_action: new Date().toISOString(),
        },
    },
})

// ==================== 客服 Inbox 主界面 (Initialize) ====================
// 当客服在 Inbox 中打开这个插件时调用
app.post("/api/intercom/initialize/inbox", (req, res) => {
    const { admin, conversation, contact } = req.body

    console.log("[Initialize] 客服打开插件:", {
        adminId: admin?.id,
        adminName: admin?.name,
        conversationId: conversation?.id,
        contactId: contact?.id,
    })

    // 返回客服主界面
    res.json(createAdminHomeCanvas())
})

// ==================== 客服点击发送按钮 (Submit) ====================
// 当客服点击"发送打赏卡片"按钮时调用
app.post("/api/intercom/submit/inbox", (req, res) => {
    const { admin, conversation, component_id, current_canvas } = req.body

    console.log("[Submit] 客服点击按钮:", {
        componentId: component_id,
        adminId: admin?.id,
        conversationId: conversation?.id,
    })

    // 记录这次发送，用于关联客服ID
    const tipKey = `${conversation?.id}_${Date.now()}`
    conversationTips.set(tipKey, {
        adminId: admin?.id,
        adminName: admin?.name,
        conversationId: conversation?.id,
        sentAt: new Date().toISOString(),
    })

    // 返回 card_creation_options，让 Intercom 插入卡片到回复区域
    // 这会触发 Messenger 的 initialize 请求来创建用户端卡片
    res.json({
        card_creation_options: {
            admin_id: admin?.id,
            admin_name: admin?.name,
            conversation_id: conversation?.id,
            tip_key: tipKey,
        },
    })
})

// ==================== 用户端卡片渲染 (Initialize - Messenger) ====================
// 当卡片要显示给用户时调用，返回打赏卡片界面
app.post("/api/intercom/initialize/messenger", (req, res) => {
    const { card_creation_options, user, conversation } = req.body

    console.log("[Initialize Messenger] 为用户渲染打赏卡片:", {
        userId: user?.id,
        userEmail: user?.email,
        adminId: card_creation_options?.admin_id,
        adminName: card_creation_options?.admin_name,
    })

    const adminId = card_creation_options?.admin_id || "unknown"
    const adminName = card_creation_options?.admin_name || "客服"

    // 返回打赏卡片界面
    res.json(createTipCardCanvas(adminId, adminName))
})

// ==================== 用户点击打赏按钮 (Submit - Messenger) ====================
// 当用户点击 $5 或 $10 按钮时，按钮的 url 动作会直接跳转
// 这个端点用于记录打赏行为（可选）
app.post("/api/intercom/submit/messenger", (req, res) => {
    const { user, component_id, input_values, current_canvas } = req.body

    console.log("[Submit Messenger] 用户点击打赏按钮:", {
        userId: user?.id,
        componentId: component_id,
        inputValues: input_values,
    })

    // 可以在这里记录打赏行为到数据库
    // 然后返回更新后的卡片（比如显示"感谢支持"）
    res.json({
        canvas: {
            content: {
                components: [
                    {
                        type: "text",
                        text: "🎉 感谢您的支持！我们会继续努力！",
                    },
                    {
                        type: "button",
                        id: "close_card",
                        label: "关闭",
                        style: "secondary",
                        action: {
                            type: "submit",
                        },
                    },
                ],
            },
        },
        event: {
            type: "completed",
        },
    })
})

// ==================== 健康检查 ====================
app.get("/health", (req, res) => {
    res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        endpoints: {
            inbox_initialize: "/api/intercom/initialize/inbox",
            inbox_submit: "/api/intercom/submit/inbox",
            messenger_initialize: "/api/intercom/initialize/messenger",
            messenger_submit: "/api/intercom/submit/messenger",
        },
    })
})

// 启动服务器
app.listen(PORT, () => {
    console.log(`🚀 Intercom Tip Plugin running on port ${PORT}`)
    console.log(`📡 Endpoints:`)
    console.log(`   - POST /api/intercom/initialize/inbox (客服主界面)`)
    console.log(`   - POST /api/intercom/submit/inbox (发送卡片)`)
    console.log(`   - POST /api/intercom/initialize/messenger (用户卡片)`)
    console.log(`   - POST /api/intercom/submit/messenger (打赏回调)`)
})
