/**
 * Canvas 组件创建函数
 * 用于 Intercom Canvas 应用
 */

const { config } = require('../config');

/**
 * 创建用户端打赏界面
 */
function createUserTipCanvas(agentName, conversationId) {
    console.log(`🎨 创建用户端打赏界面，客服: ${agentName}`);
    return {
        content: {
            components: [
                { type: "text", text: `💝 Thank ${agentName}!`, style: "header" },
                { type: "text", text: "Your support means a lot ✨", style: "muted" },
                { type: "button", label: "💵 $1", style: "primary", id: "tip_1", action: { type: "submit" } },
                { type: "button", label: "💵 $5", style: "primary", id: "tip_5", action: { type: "submit" } },
                { type: "button", label: "💵 $10", style: "primary", id: "tip_10", action: { type: "submit" } },
                { type: "button", label: "💵 $20", style: "primary", id: "tip_20", action: { type: "submit" } },
                { type: "button", label: "✨ Custom Amount 11", style: "secondary", id: "tip_custom", action: { type: "url", url: 'https://mulebuy.com/my-account/user-center?id=123' } },
                { type: "button", label: "✨ Custom Amount app", style: "secondary", id: "tip_custom2", action: { type: "url", url: 'mulebuy://?id=8qdq&num=10' } },
            ]
        },
        metadata: { agentName, conversationId }
    };
}

/**
 * 创建支付确认界面
 */
function createPaymentCanvas(amount, agentName, conversationId) {
    console.log(`🎨 创建支付确认界面，金额: ${amount}, 客服: ${agentName}`);
    return {
        content: {
            components: [
                { type: "text", text: "💳 Confirm Your Tip", style: "header" },
                { type: "text", text: `You're tipping $${amount.toFixed(2)} to ${agentName}`, style: "paragraph" },
                { type: "text", text: "✨ Thank you for your generosity!", style: "muted" },
                { type: "spacer", size: "s" },
                { type: "button", label: `✅ Pay $${amount.toFixed(2)}`, style: "primary", id: `confirm_payment_${amount}`, action: { type: "submit" } },
                { type: "button", label: "← Back", style: "secondary", id: "back_to_amounts", action: { type: "submit" } }
            ]
        },
        metadata: {
            amount: amount,
            agentName: agentName,
            conversationId: conversationId
        }
    };
}

/**
 * 创建自定义金额输入界面
 */
function createCustomAmountCanvas(agentName, conversationId) {
    return {
        content: {
            components: [
                { type: "text", text: "✨ Custom Tip Amount", style: "header" },
                { type: "text", text: `Enter any amount you'd like to tip ${agentName}`, style: "muted" },
                { type: "spacer", size: "s" },
                { type: "input", id: "custom_amount", label: "Amount in USD", placeholder: "e.g. 15" },
                { type: "spacer", size: "xs" },
                { type: "button", label: "✅ Continue", style: "primary", id: "custom_amount_submit", action: { type: "submit" } },
                { type: "button", label: "← Back", style: "secondary", id: "back_to_amounts", action: { type: "submit" } }
            ]
        },
        metadata: { agentName, conversationId }
    };
}

/**
 * 创建 PayPal 支付跳转界面
 */
function createPayPalCanvas(amount, agentName, paymentUrl, conversationId) {
    return {
        content: {
            components: [
                { type: "text", text: `Tip $${amount.toFixed(2)} for ${agentName}`, style: "header" },
                { type: "text", text: "✨ Thank you for your generosity!", style: "muted" },
                { type: "spacer", size: "s" },
                { type: "button", label: `Pay $${amount.toFixed(2)} with PayPal`, style: "primary", id: "paypal_redirect", action: { type: "url", url: paymentUrl } },
                { type: "button", label: "← Back", style: "secondary", id: "back_to_amounts", action: { type: "submit" } }
            ]
        },
        metadata: { agentName, conversationId }
    };
}

/**
 * 创建错误界面
 */
function createErrorCanvas(message, agentName, conversationId) {
    return {
        content: {
            components: [
                { type: "text", text: "❌ Oops! Something went wrong", style: "header" },
                { type: "text", text: message, style: "muted" },
                { type: "spacer", size: "s" },
                { type: "button", label: "🔄 Try Again", style: "primary", id: "back_to_amounts", action: { type: "submit" } }
            ]
        },
        metadata: { agentName, conversationId }
    };
}

/**
 * 创建客服端主界面（带发送功能）
 */
function createAgentMainCanvas(agentName, conversationId) {
    return {
        content: {
            components: [
                { type: "text", text: "💝 发送打赏卡片", style: "header" },
                { type: "spacer", size: "m" },
                { type: "input", id: "agent_name_input", label: "您的英文名", placeholder: "请输入您的名字" },
                { type: "button", label: "发送", style: "primary", id: "send_tip_card", action: { type: "submit" } },
                { type: "divider" },
                { type: "button", label: "📊 查看打赏统计", style: "link", id: "view_stats", action: { type: "url", url: config.baseUrl || "http://localhost:3000" } }
            ]
        },
        metadata: { agentName, conversationId, currentView: "main" }
    };
}

/**
 * 创建客服端设置提示界面
 */
function createAgentSetupCanvas(conversationId) {
    return {
        content: {
            components: [
                { type: "text", text: "请设置对话的标题（Subject）", style: "header" },
                { type: "text", text: `对话 ID: ${conversationId}`, style: "paragraph" },
                { type: "text", text: "请将对话标题设置为您的英文名，例如 'Allen'", style: "muted" },
                { type: "spacer", size: "s" },
                { type: "text", text: "设置方法：在对话界面中找到 Subject 字段，输入您的英文名", style: "paragraph" },
                { type: "spacer", size: "s" },
                { type: "button", label: "我已设置标题", style: "primary", id: "retry_initialize", action: { type: "submit" } }
            ]
        },
        metadata: { conversationId, currentView: "setup" }
    };
}

/**
 * 创建发送成功界面
 */
function createSendSuccessCanvas(agentName, conversationId) {
    return {
        content: {
            components: [
                { type: "text", text: "✅ 发送成功", style: "header" },
                { type: "text", text: `打赏链接已发送给用户 (客服: ${agentName}, ID: ${conversationId})`, style: "paragraph" },
                { type: "spacer", size: "s" },
                { type: "button", label: "📤 再次发送", style: "secondary", id: "send_tip_to_user", action: { type: "submit" } },
                { type: "button", label: "📊 查看统计", style: "secondary", id: "view_stats", action: { type: "url", url: config.baseUrl || "http://localhost:3000" } },
                { type: "button", label: "🔙 返回主界面", style: "primary", id: "back_to_main", action: { type: "submit" } }
            ]
        },
        metadata: { agentName, conversationId, currentView: "success" }
    };
}

/**
 * 创建发送失败界面
 */
function createSendErrorCanvas(errorMessage, agentName, conversationId) {
    return {
        content: {
            components: [
                {
                    type: "list",
                    items: [
                        {
                            type: "item",
                            id: "error_refresh",
                            title: "❌ 发送失败",
                            subtitle: `错误: ${errorMessage}`,
                            tertiary_text: "🔄",
                            action: { type: "submit", id: "refresh_interface" }
                        }
                    ]
                },
                { type: "divider" },
                { type: "spacer", size: "s" },
                { type: "text", text: `客服: ${agentName}, 对话 ID: ${conversationId}`, style: "muted" },
                { type: "spacer", size: "s" },
                { type: "button", label: "🔄 重试", style: "primary", id: "send_tip_to_user", action: { type: "submit" } },
                { type: "button", label: "🔙 返回主界面", style: "secondary", id: "back_to_main", action: { type: "submit" } }
            ]
        },
        metadata: { agentName, conversationId, currentView: "error" }
    };
}

module.exports = {
    createUserTipCanvas,
    createPaymentCanvas,
    createCustomAmountCanvas,
    createPayPalCanvas,
    createErrorCanvas,
    createAgentMainCanvas,
    createAgentSetupCanvas,
    createSendSuccessCanvas,
    createSendErrorCanvas
};
