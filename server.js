require("dotenv").config()
const express = require("express")
const cors = require("cors")

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// ==================== 配置界面 (客服看到的) ====================
// 当客服在消息框点击 + 选择你的 App 时，首先调用这个 URL
app.post("/api/intercom/configure", (req, res) => {
    const { admin, workspace_id } = req.body

    console.log("[Configure] 客服正在配置打赏:", {
        adminId: admin?.id,
        adminName: admin?.name,
    })

    // 返回配置界面，让客服选择打赏金额选项
    res.json({
        canvas: {
            content: {
                components: [
                    {
                        type: "text",
                        text: "💰 设置打赏金额",
                        style: "header",
                    },
                    {
                        type: "text",
                        text: "选择用户可以打赏的金额：",
                    },
                    {
                        type: "row",
                        components: [
                            {
                                type: "button",
                                id: "enable_5",
                                label: "✓ 启用 $5",
                                style: "primary",
                            },
                            {
                                type: "button",
                                id: "enable_10",
                                label: "✓ 启用 $10",
                                style: "primary",
                            },
                        ],
                    },
                    {
                        type: "input",
                        id: "custom_amount",
                        label: "自定义金额（可选）",
                        placeholder: "例如: 20",
                    },
                    {
                        type: "button",
                        id: "complete_config",
                        label: "完成配置并插入卡片",
                        style: "primary",
                    },
                ],
            },
        },
    })
})

// ==================== 配置完成回调 ====================
// 当客服点击"完成配置"按钮时，Intercom 会再次调用 configure_url
// 你需要返回 results 对象，这些数据会作为 card_creation_options 传给 initialize
app.post("/api/intercom/configure/submit", (req, res) => {
    const { component_id, input_values, current_canvas, admin } = req.body

    console.log("[Configure Submit] 客服完成配置:", {
        componentId: component_id,
        inputValues: input_values,
        adminId: admin?.id,
    })

    // 收集配置结果 - 这些会作为 card_creation_options 传给 initialize
    const results = {
        enabled_amounts: {
            5: true, // 根据实际按钮点击状态设置
            10: true,
        },
        custom_amount: input_values?.custom_amount || null,
        admin_id: admin?.id,
        admin_name: admin?.name,
        configured_at: new Date().toISOString(),
    }

    // 返回 results 对象结束配置流程
    res.json({ results })
})

// ==================== 用户端卡片初始化 ====================
// 配置完成后，Intercom 会带着 card_creation_options 调用 initialize_url
app.post("/api/intercom/initialize", (req, res) => {
    const { card_creation_options, user, workspace_id, context } = req.body

    console.log("[Initialize] 为用户渲染打赏卡片:", {
        userId: user?.id,
        userEmail: user?.email,
        location: context?.location,
        config: card_creation_options,
    })

    const adminId = card_creation_options?.admin_id || "unknown"
    const adminName = card_creation_options?.admin_name || "客服"

    // 构建金额按钮 - 根据配置动态生成
    const amountButtons = []

    if (card_creation_options?.enabled_amounts?.["5"]) {
        amountButtons.push({
            type: "button",
            id: "tip_5",
            label: "$5",
            style: "primary",
            action: {
                type: "url",
                url: `https://mulebuy.com?id=${adminId}&money=5`,
            },
        })
    }

    if (card_creation_options?.enabled_amounts?.["10"]) {
        amountButtons.push({
            type: "button",
            id: "tip_10",
            label: "$10",
            style: "primary",
            action: {
                type: "url",
                url: `https://mulebuy.com?id=${adminId}&money=10`,
            },
        })
    }

    // 返回用户端看到的打赏卡片
    res.json({
        canvas: {
            content: {
                components: [
                    {
                        type: "text",
                        text: `🎁 支持一下 ${adminName}`,
                        style: "header",
                    },
                    {
                        type: "text",
                        text: "感谢您的支持！请选择打赏金额：",
                    },
                    {
                        type: "row",
                        components: amountButtons,
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
})

// ==================== 健康检查 ====================
app.get("/health", (req, res) => {
    res.json({
        status: "healthy",
        endpoints: {
            configure: "/api/intercom/configure",
            configure_submit: "/api/intercom/configure/submit",
            initialize: "/api/intercom/initialize",
        },
    })
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
