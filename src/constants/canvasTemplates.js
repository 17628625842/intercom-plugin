/**
 * Canvas 组件模板
 */

// 客服主界面模板
const adminMainCanvas = (conversationId) => ({
    canvas: {
        content: {
            components: [
                { type: "text", text: "💝 发送打赏卡片", style: "header" },
                { type: "spacer", size: "m" },
                { type: "input", id: "agent_name_input", label: "您的英文名", placeholder: "请输入您的名字" },
                {
                    type: "button",
                    id: "send_tip_card",
                    label: "发送",
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
                { type: "text", text: "💝 发送打赏卡片", style: "header" },
                { type: "spacer", size: "m" },
                { type: "input", id: "agent_name_input", label: "您的英文名", placeholder: "请输入您的名字" },
                {
                    type: "button",
                    id: "send_tip_card",
                    label: "发送",
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
const userMainCanvas = (conversationId, agentName, adminId = "unknown") => ({
    canvas: {
        content: {
            components: [
                { type: "text", text: `❤️ Thank ${agentName}!`, style: "header" },
                { type: "text", text: "Your support means a lot ✨", style: "muted" },
                {
                    type: "button",
                    label: "💵 $1",
                    style: "secondary",
                    id: `tip_1:${adminId}`,
                    action: { type: "submit" },
                },
                {
                    type: "button",
                    label: "💵 $5",
                    style: "secondary",
                    id: `tip_5:${adminId}`,
                    action: { type: "submit" },
                },
                {
                    type: "button",
                    label: "💵 $10",
                    style: "secondary",
                    id: `tip_10:${adminId}`,
                    action: { type: "submit" },
                },
                {
                    type: "button",
                    label: "💵 $20",
                    style: "secondary",
                    id: `tip_20:${adminId}`,
                    action: { type: "submit" },
                },
                {
                    type: "button",
                    label: "✨ Custom Amount",
                    style: "secondary",
                    id: `show_custom_input:${adminId}`,
                    action: { type: "submit" },
                },
            ],
        },
        metadata: { conversationId, adminId, agentName, currentView: "main" },
    },
})

// 用户端自定义金额输入界面模板
const userCustomAmountCanvas = (conversationId, adminId = "unknown", agentName = "Support Agent") => ({
    canvas: {
        content: {
            components: [
                { type: "text", text: "✨ Custom Tip Amount", style: "header" },
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
                    id: `tip_custom_submit:${adminId}`,
                    action: { type: "submit" },
                },
                {
                    type: "button",
                    label: "← Back",
                    style: "secondary",
                    id: `back_to_main:${adminId}`,
                    action: { type: "submit" },
                },
            ],
        },
        metadata: { conversationId, adminId, agentName, currentView: "custom_input" },
    },
})

// 用户端支付跳转界面模板
const userPaymentCanvas = (adminId, amount, conversationId, socketInfo = null, isProcessing = false, agentName = "Support Agent") => {
    const components = [
        {
            type: "text",
            text: `💰 打赏金额: $${amount}`,
            style: "header",
            align: "center",
        },
    ]

    if (isProcessing) {
        components.push({
            type: "text",
            text: "For payment details, please visit the [Personal Center -> Account -> Balance] page to view them.",
            style: "muted",
            align: "center",
        })
    } else {
        components.push({
            type: "button",
            label: "Go to pay",
            style: "primary",
            id: `go_to_pay_${amount}:${adminId}`, // 将金额和 adminId 编码进 ID
            action: { type: "submit" },
        })
        components.push({
            type: "text",
            text: "For payment details, please visit the [Personal Center -> Account -> Balance] page to view them.",
            style: "muted",
            align: "center",
        })
    }

    components.push({
        type: "button",
        label: "← Back",
        style: "secondary",
        id: `back_to_amounts:${adminId}`,
        action: { type: "submit" },
    })

    const canvas = {
        content: {
            components: components,
        },
        metadata: { conversationId, adminId, agentName, socketInfo, amount: String(amount) },
    }

    return { canvas }
}

module.exports = {
    adminMainCanvas,
    adminSuccessCanvas,
    userMainCanvas,
    userCustomAmountCanvas,
    userPaymentCanvas,
}
