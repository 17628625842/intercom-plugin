/**
 * 飞书通知模块
 * 通过 Webhook 发送消息到飞书群组
 */

const { config } = require('../config');

/**
 * 发送支付成功通知到飞书群
 * @param {string} agentName - 客服名称
 * @param {number} amount - 打赏金额
 * @param {string} userEmail - 用户邮箱
 * @param {string} conversationId - 对话ID
 */
async function sendPaymentNotification(agentName, amount, userEmail, conversationId) {
    const webhookUrl = config.feishu?.webhookUrl;

    if (!webhookUrl) {
        console.log('⚠️ 飞书 Webhook 未配置，跳过通知');
        return;
    }

    // 参数验证
    console.log('📤 准备发送飞书通知:', { agentName, amount, userEmail, conversationId });

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum)) {
        console.error('❌ 飞书通知失败: 金额无效', { amount });
        return;
    }

    if (!conversationId) {
        console.error('❌ 飞书通知失败: 对话ID为空');
        return;
    }

    // 重试配置
    const maxRetries = 2;
    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const intercomUrl = `https://app.intercom.com/a/inbox/tj75osrf/inbox/conversation/${conversationId}`;

            // 根据金额选择不同颜色
            let headerTemplate = 'green';
            let amountEmoji = '💵';
            if (amountNum >= 20) {
                headerTemplate = 'red';
                amountEmoji = '💎';
            } else if (amountNum >= 10) {
                headerTemplate = 'orange';
                amountEmoji = '🌟';
            } else if (amountNum >= 5) {
                headerTemplate = 'turquoise';
                amountEmoji = '💰';
            }

            const payload = {
                msg_type: 'interactive',
                card: {
                    config: { wide_screen_mode: true },
                    header: {
                        title: { tag: 'plain_text', content: `${amountEmoji} 收到 $${amountNum.toFixed(2)} 打赏！` },
                        template: headerTemplate
                    },
                    elements: [
                        {
                            tag: 'markdown',
                            content: `**👤 客服：** ${agentName || 'Unknown'}\n**💳 金额：** $${amountNum.toFixed(2)}\n**📧 客户：** ${userEmail || 'Unknown'}`
                        },
                        { tag: 'hr' },
                        {
                            tag: 'action',
                            actions: [{
                                tag: 'button',
                                text: { tag: 'plain_text', content: '📬 查看对话' },
                                type: 'primary',
                                url: intercomUrl
                            }]
                        },
                        {
                            tag: 'note',
                            elements: [{
                                tag: 'plain_text',
                                content: `${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}`
                            }]
                        }
                    ]
                }
            };

            console.log(`📤 飞书通知发送尝试 ${attempt}/${maxRetries}`);

            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            if (result.code === 0) {
                console.log('✅ 飞书通知发送成功');
                return; // 成功，退出函数
            } else {
                throw new Error(`飞书 API 错误: ${result.msg || result.code}`);
            }
        } catch (error) {
            lastError = error;
            console.warn(`⚠️ 飞书通知发送失败 (尝试 ${attempt}/${maxRetries}):`, error.message);

            if (attempt < maxRetries) {
                const waitTime = attempt * 1000; // 1秒, 2秒...
                console.log(`⏳ 等待 ${waitTime}ms 后重试...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
    }

    // 所有重试都失败
    console.error('❌ 飞书通知发送最终失败:', lastError?.message);
}

module.exports = {
    sendPaymentNotification
};

