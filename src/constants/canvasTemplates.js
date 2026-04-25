/**
 * Canvas 组件模板
 */

// 客服主界面模板
const adminMainCanvas = (conversationId) => ({
    canvas: {
        content: {
            components: [
                { type: "text", text: "💝 发送打赏卡片", style: "header" },
                { type: "input", id: "agent_name_input", label: "客服名称", placeholder: "请输入客服名称" },
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
                { type: "input", id: "agent_name_input", label: "客服名称", placeholder: "请输入客服名称" },
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
const userCustomAmountCanvas = (conversationId, adminId = "unknown", agentName = "Support Agent", error = null) => {
    const components = [{ type: "text", text: "✨ Custom Tip Amount", style: "header" }]

    if (error) {
        components.push({
            type: "text",
            text: `⚠️ ${error}`,
            style: "error",
            align: "center",
        })
    }

    components.push(
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
    )

    return {
        canvas: {
            content: {
                components: components,
            },
            metadata: { conversationId, adminId, agentName, currentView: "custom_input" },
        },
    }
}

// 用户端支付跳转界面模板
const userPaymentCanvas = (adminId, amount, targetUrl) => {
    const canvas = {
        content: {
            components: [
                {
                    type: "text",
                    text: `💰 Tip Amount: $${amount}`,
                    style: "header",
                    align: "center",
                },
                {
                    type: "button",
                    label: "Go to pay",
                    style: "primary",
                    id: `go_to_pay`, // 将金额和 adminId 编码进 ID
                    action: {
                        type: "url",
                        url: targetUrl,
                    },
                },
                {
                    type: "button",
                    label: "← Back",
                    style: "secondary",
                    id: `back_to_amounts:${adminId}`,
                    action: { type: "submit" },
                },
            ],
        },
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
