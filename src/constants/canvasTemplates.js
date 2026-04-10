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
                { type: "text", text: "❤️ Thank Manager!", style: "header" },
                { type: "text", text: "Your support means a lot ✨", style: "muted" },
                {
                    type: "button",
                    label: "💵 $1",
                    style: "secondary",
                    id: "tip_1",
                    action: { type: "submit" },
                },
                {
                    type: "button",
                    label: "💵 $5",
                    style: "secondary",
                    id: "tip_5",
                    action: { type: "submit" },
                },
                {
                    type: "button",
                    label: "💵 $10",
                    style: "secondary",
                    id: "tip_10",
                    action: { type: "submit" },
                },
                {
                    type: "button",
                    label: "💵 $20",
                    style: "secondary",
                    id: "tip_20",
                    action: { type: "submit" },
                },
                {
                    type: "button",
                    label: "✨ Custom Amount",
                    style: "secondary",
                    id: "show_custom_input",
                    action: { type: "submit" },
                },
            ],
        },
        metadata: { conversationId, currentView: "main" },
    },
})

// 用户端自定义金额输入界面模板
const userCustomAmountCanvas = (conversationId) => ({
    canvas: {
        content: {
            components: [
                { type: "text", text: "✨ Custom Amount", style: "header" },
                {
                    type: "input",
                    id: "custom_amount_input",
                    label: "Enter amount ($)",
                    placeholder: "e.g. 15",
                },
                {
                    type: "button",
                    label: "Confirm",
                    style: "primary",
                    id: "tip_custom_submit",
                    action: { type: "submit" },
                },
                {
                    type: "button",
                    label: "← Back",
                    style: "secondary",
                    id: "back_to_main",
                    action: { type: "submit" },
                },
            ],
        },
        metadata: { conversationId, currentView: "custom_input" },
    },
})

// 用户端支付跳转界面模板
const userPaymentCanvas = (adminId, amount, conversationId, sseInfo = null) => ({
    canvas: {
        content: {
            components: [
                {
                    type: "text",
                    text: `💰 打赏金额: $${amount}`,
                    style: "header",
                    align: "center",
                },
                {
                    type: "button",
                    label: "去支付",
                    style: "primary",
                    id: "go_to_pay",
                    action: { type: "submit" },
                },
                {
                    type: "button",
                    label: "← Back",
                    style: "secondary",
                    id: "back_to_amounts",
                    action: { type: "submit" },
                },
            ],
        },
        metadata: { conversationId, sseInfo, amount },
    },
})

module.exports = {
    adminMainCanvas,
    adminSuccessCanvas,
    userMainCanvas,
    userCustomAmountCanvas,
    userPaymentCanvas,
}
