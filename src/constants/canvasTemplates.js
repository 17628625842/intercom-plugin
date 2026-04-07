/**
 * Canvas 组件模板
 */

// 客服主界面模板
const adminMainCanvas = (conversationId) => ({
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
                        type: "submit",
                    },
                },
            ],
        },
        metadata: { conversationId, currentView: "main" },
    },
})

// 客服发送成功界面模板
const adminSuccessCanvas = (conversationId) => ({
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
})

// 用户端打赏主界面模板
const userMainCanvas = (conversationId) => ({
    canvas: {
        content: {
            components: [
                { type: "text", text: "💝 Thank you!", style: "header" },
                { type: "text", text: "Your support means a lot ✨", style: "muted" },
                {
                    type: "button",
                    label: "💵 $5",
                    style: "primary",
                    id: "tip_5",
                    action: { type: "submit" },
                },
                {
                    type: "button",
                    label: "💵 $10",
                    style: "primary",
                    id: "tip_10",
                    action: { type: "submit" },
                },
                {
                    type: "button",
                    label: "✨ Custom Amount",
                    style: "secondary",
                    id: "tip_custom",
                    action: { type: "submit" },
                },
            ],
        },
        metadata: { conversationId },
    },
})

// 用户端支付跳转界面模板
const userPaymentCanvas = (adminId, amount, conversationId) => ({
    canvas: {
        content: {
            components: [
                {
                    type: "button",
                    label: "去支付",
                    style: "primary",
                    id: "TO",
                    action: {
                        type: "url",
                        // url: `https://mulebuy.com?id=${adminId}&money=${amount}`,
                        url: `https://m.mulebuy.com/app/?id=${adminId}&money=${amount}`,
                    },
                },
                // {
                //     type: "button",
                //     label: "APP 去支付",
                //     style: "primary",
                //     id: "TO_app",
                //     action: {
                //         type: "url",
                //         url: `mulebuy://?id=${adminId}&money=${amount}`,
                //     },
                // },
                {
                    type: "button",
                    label: "← Back",
                    style: "secondary",
                    id: "back_to_amounts",
                    action: { type: "submit" },
                },
            ],
        },
        metadata: { conversationId },
    },
})

module.exports = {
    adminMainCanvas,
    adminSuccessCanvas,
    userMainCanvas,
    userPaymentCanvas,
}
