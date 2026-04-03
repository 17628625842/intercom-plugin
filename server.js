require("dotenv").config()
const express = require("express")
const cors = require("cors")

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.post("/api/intercom/configure", (req, res) => {
    console.log("[Configure] Request received")
    console.log("Admin:", req.body.admin?.name)

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
        },
    }

    console.log("[Configure] Response:", JSON.stringify(response, null, 2))
    res.json(response)
})

// ==================== 配置提交 (Configure Submit) ====================
app.post("/api/intercom/configure/submit", (req, res) => {
    console.log("[Configure Submit] 准备插入卡片")

    const adminId = req.body.admin?.id || "unknown"
    const adminName = req.body.admin?.name || "客服"

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
                            type: "submit", // ✅ 必须包含
                        },
                    },
                ],
            },
        },
        card_creation_options: {
            admin_id: adminId,
            admin_name: adminName,
        },
    })
})

// ==================== 用户端卡片初始化 (Initialize) ====================
app.post("/api/intercom/initialize", (req, res) => {
    console.log("[Initialize] Request received")
    // console.log("Card creation options:", JSON.stringify(req.body.card_creation_options, null, 2))

    const adminId = req.body.card_creation_options?.admin_id || "unknown"
    const adminName = req.body.card_creation_options?.admin_name || "客服"

    // ⚠️ 注意：URL 中的参数需要正确编码
    const tip5Url = `https://mulebuy.com?id=${encodeURIComponent(adminId)}&money=5`
    const tip10Url = `https://mulebuy.com?id=${encodeURIComponent(adminId)}&money=10`

    const response = {
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
                        components: [
                            {
                                type: "button",
                                id: "tip_5",
                                label: "$5",
                                style: "primary",
                                action: {
                                    type: "url",
                                    url: tip5Url,
                                },
                            },
                            {
                                type: "button",
                                id: "tip_10",
                                label: "$10",
                                style: "primary",
                                action: {
                                    type: "url",
                                    url: tip10Url,
                                },
                            },
                        ],
                    },
                ],
            },
        },
    }

    res.json(response)
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
