/**
 * Intercom 工具模块
 * 处理 Intercom API 交互
 */

const axios = require('axios');
const { config } = require('../config');

const { accessToken, apiBase } = config.intercom;

/**
 * 获取当前登录账号的 admin ID
 * @returns {Promise<string|null>} admin ID
 */
async function getCurrentAdminId() {
    try {
        console.log('🔍 开始获取当前登录账号信息...');
        console.log('🔑 使用的 Access Token:', accessToken ? `${accessToken.substring(0, 10)}...` : '未设置');

        const response = await axios({
            method: 'GET',
            url: `${apiBase}/me`,
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json',
                'Intercom-Version': '2.11'
            },
            timeout: 15000 // 增加超时时间到 15 秒
        });

        console.log('✅ 获取账号信息成功:');
        console.log('📋 完整响应数据:', JSON.stringify(response.data, null, 2));
        console.log('👤 账号 ID:', response.data.id);
        console.log('📝 账号名称:', response.data.name);
        console.log('📧 账号邮箱:', response.data.email);
        console.log('🏷️ 账号类型:', response.data.type);

        return response.data.id;
    } catch (error) {
        console.error('❌ 获取当前登录账号失败:', error.response?.data || error.message);
        return null;
    }
}

/**
 * 根据客服名称获取其 admin_id
 * @param {string} agentName - 客服名称
 * @returns {Promise<string|null>} admin ID
 */
async function getAdminIdByName(agentName) {
    try {
        console.log(`🔍 查找客服 "${agentName}" 的 admin_id...`);

        const response = await axios({
            method: 'GET',
            url: `${apiBase}/admins`,
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json',
                'Intercom-Version': '2.11'
            }
        });

        console.log('📋 所有客服列表:', response.data.admins?.map(admin => ({
            id: admin.id,
            name: admin.name,
            email: admin.email
        })));

        const admin = response.data.admins?.find(admin =>
            admin.name.toLowerCase() === agentName.toLowerCase() ||
            admin.name.toLowerCase().includes(agentName.toLowerCase())
        );

        if (admin) {
            console.log(`✅ 找到客服: ${admin.name} (ID: ${admin.id})`);
            return admin.id;
        } else {
            console.log(`❌ 未找到客服: ${agentName}`);
            return null;
        }
    } catch (error) {
        console.error('❌ 获取客服列表失败:', error);
        return null;
    }
}

/**
 * 发送打赏消息给用户
 * @param {string} conversationId - 对话 ID
 * @param {string} agentName - 客服名称
 * @param {object} req - 请求对象（可选）
 * @returns {Promise<object>} 发送结果
 */
async function sendTipMessageToUser(conversationId, agentName, req = null) {
    try {
        console.log(`📤 准备发送打赏消息给用户，对话 ID: ${conversationId}, 客服名称: ${agentName}`);

        if (!accessToken) {
            throw new Error('INTERCOM_ACCESS_TOKEN 未设置');
        }

        if (!conversationId || conversationId === 'unknown') {
            throw new Error(`对话 ID 无效: ${conversationId}`);
        }

        let targetAdminId = null;

        // 优先尝试从请求上下文获取当前操作的客服 ID
        if (req && req.body && req.body.admin && req.body.admin.id) {
            targetAdminId = req.body.admin.id;
            console.log(`✅ 从请求上下文获取到当前操作客服 ID: ${targetAdminId} (${req.body.admin.name})`);
        }

        // 如果没有从上下文获取到，尝试根据客服名称查找
        if (!targetAdminId) {
            console.log(`🔍 未从上下文获取到客服 ID，尝试根据名称查找: ${agentName}`);
            targetAdminId = await getAdminIdByName(agentName);
        }

        // 如果仍然找不到，回退到系统账号
        if (!targetAdminId) {
            console.log('⚠️ 未找到目标客服，使用系统账号');
            targetAdminId = await getCurrentAdminId();
        }

        if (!targetAdminId) {
            throw new Error('无法获取任何有效的 admin ID');
        }

        console.log(`🔍 最终使用 admin_id: ${targetAdminId} 发送消息`);

        const tipUrl = `${config.baseUrl}/tip/${conversationId}/${encodeURIComponent(agentName)}`;
        console.log(`🔗 生成的打赏链接: ${tipUrl}`);

        const messageData = {
            message_type: 'comment',
            type: 'admin',
            admin_id: targetAdminId.toString(),
            body: `👉 [Leave a Tip for ${agentName}](${tipUrl})`
        };

        console.log('📤 发送到 Intercom API 的数据:', JSON.stringify(messageData, null, 2));

        const response = await axios({
            method: 'POST',
            url: `${apiBase}/conversations/${conversationId}/parts`,
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Intercom-Version': '2.11'
            },
            data: messageData,
            timeout: 15000,
            validateStatus: function (status) {
                return status < 500;
            }
        });

        console.log(`📊 API 响应状态: ${response.status}`);

        if (response.status >= 400) {
            throw new Error(`Intercom API 错误 ${response.status}: ${JSON.stringify(response.data)}`);
        }

        console.log('✅ 打赏消息发送成功:', response.data.id);
        return response.data;
    } catch (error) {
        console.error('❌ 发送打赏消息失败:', error);
        throw error;
    }
}

/**
 * 从请求中提取对话 ID
 * @param {object} req - 请求对象
 * @returns {string|null} 对话 ID
 */
function extractConversationId(req) {
    console.log('🔍 开始提取对话 ID...');
    console.log('完整请求体:', JSON.stringify(req.body, null, 2));

    const possibleIds = [
        req.body.context?.conversation_id,
        req.body.conversation?.id,
        req.body.canvas?.metadata?.conversationId,
        req.body.conversationId,
        req.body.id
    ];

    console.log('🔍 可能的 ID 来源:', possibleIds);

    for (const id of possibleIds) {
        if (id && id !== 'unknown' && typeof id === 'string' && id.length > 0) {
            console.log(`✅ 找到有效对话 ID: ${id}`);
            return id;
        }
    }

    console.log('❌ 未找到有效对话 ID');
    return null;
}

/**
 * 从请求中提取客服名称
 * @param {object} req - 请求对象
 * @returns {string} 客服名称
 */
function extractAgentName(req) {
    console.log('🔍 开始提取客服名称...');

    // 1. 优先从 data.item.title 获取（Inbox 插件的数据结构）
    const itemTitle = req.body.data?.item?.title || '';
    console.log(`🔍 检查 data.item.title: "${itemTitle}"`);

    // 2. 也检查 conversation.title（旧的数据结构）
    const conversationTitle = req.body.conversation?.title || '';
    console.log(`🔍 检查 conversation.title: "${conversationTitle}"`);

    const title = itemTitle || conversationTitle;

    // 验证 title 是否像一个人名（不包含连字符、不是部门名称等）
    const invalidPatterns = ['-', 'sales', 'support', 'service', 'team', 'department', 'help', 'customer'];
    const isLikelyPersonName = title.trim() !== '' &&
        title.length <= 20 &&
        !invalidPatterns.some(pattern => title.toLowerCase().includes(pattern));

    if (isLikelyPersonName) {
        console.log(`✅ 从 title 获取客服名称: ${title.trim()}`);
        return title.trim();
    }

    // 3. 从 canvas metadata 中获取（如果之前已保存）
    const metadataAgentName = req.body.canvas?.metadata?.agentName || req.body.current_canvas?.metadata?.agentName;
    if (metadataAgentName && metadataAgentName !== 'Support Agent') {
        console.log(`✅ 从 canvas metadata 获取客服名称: ${metadataAgentName}`);
        return metadataAgentName;
    }

    // 4. 从 conversation_parts 中提取
    const parts = req.body.conversation?.conversation_parts?.conversation_parts
        || req.body.data?.item?.conversation_parts?.conversation_parts
        || [];
    if (Array.isArray(parts) && parts.length > 0) {
        const adminMessages = parts.filter(part => part.author?.type === 'admin');
        if (adminMessages.length > 0) {
            const latestMessage = adminMessages[adminMessages.length - 1].body || '';
            console.log(`🔍 检查最新客服消息: "${latestMessage.substring(0, 100)}..."`);
            const nameMatch = latestMessage.match(/Hi, I'm (\w+), happy to help you today!|Hello, my name is (\w+)|I'm (\w+)/i);
            if (nameMatch) {
                const extractedName = nameMatch[1] || nameMatch[2] || nameMatch[3];
                console.log(`✅ 从消息中提取客服名称: ${extractedName}`);
                return extractedName;
            }
        }
    }

    // 5. 最后才考虑 admin.name（但通常不用这个）
    if (req.body.admin?.name) {
        const adminName = req.body.admin.name;
        console.log(`⚠️ 回退到 admin.name: ${adminName}`);
        return adminName;
    }

    console.log('❌ 未找到有效客服名称，使用默认值');
    return 'Support Agent';
}

/**
 * 发送支付成功消息给用户
 * @param {string} conversationId - 对话 ID
 * @param {string} agentName - 客服名字
 * @param {number} amount - 打赏金额
 * @returns {Promise<object>} 消息响应
 * @throws {Error} 发送失败时抛出错误
 */
async function sendPaymentSuccessMessage(conversationId, agentName, amount) {
    console.log(`💰 发送支付成功消息: 对话=${conversationId}, 客服=${agentName}, 金额=${amount}`);

    const accessToken = config.intercom.accessToken;
    if (!accessToken) {
        throw new Error('未配置 INTERCOM_ACCESS_TOKEN');
    }

    // 尝试获取 admin ID，带重试逻辑
    let adminId = null;
    for (let retry = 0; retry < 2; retry++) {
        adminId = await getCurrentAdminId();
        if (adminId) break;
        console.log(`⚠️ 获取 admin ID 失败，重试 ${retry + 1}/2...`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // 等待1秒后重试
    }

    if (!adminId) {
        throw new Error('无法获取 admin ID（多次重试后仍失败）');
    }

    const messageData = {
        message_type: 'comment',
        type: 'admin',
        admin_id: adminId.toString(),
        body: `✅ **Thank you!** Your $${amount} tip for ${agentName} has been received! 🎉`
    };

    // 重试配置
    const maxRetries = 2;
    const baseTimeout = 60000; // 增加到 60 秒，避免假性超时
    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`📤 Intercom 发送尝试 ${attempt}/${maxRetries}，超时设置: ${baseTimeout}ms`);

            const response = await axios({
                method: 'POST',
                url: `${apiBase}/conversations/${conversationId}/parts`,
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Intercom-Version': '2.11'
                },
                data: messageData,
                timeout: baseTimeout,
                validateStatus: function (status) {
                    return status < 500;
                }
            });

            if (response.status >= 400) {
                throw new Error(`Intercom API 错误 ${response.status}: ${JSON.stringify(response.data)}`);
            }

            console.log('✅ 支付成功消息发送成功:', response.data.id);
            return response.data;
        } catch (error) {
            lastError = error;
            const isTimeout = error.code === 'ECONNABORTED' || error.message.includes('timeout');
            // 只重试明确的网络连接错误（如 DNS 解析失败、连接被拒），超时绝对不重试
            const isNetworkError = error.code === 'ECONNREFUSED' || error.code === 'ECONNRESET' || error.code === 'ENOTFOUND';

            console.warn(`⚠️ Intercom 发送失败 (尝试 ${attempt}/${maxRetries}):`, {
                code: error.code,
                message: error.message,
                isTimeout,
                isNetworkError
            });

            // 如果是超时，通常意味着对方已经收到了但处理慢，绝对不要重试，否则会重复发送
            if (isTimeout) {
                console.error('❌ 请求超时，为防止重复发送，停止重试。');
                break;
            }

            // 只有真正的网络连接错误才重试
            if (isNetworkError && attempt < maxRetries) {
                const waitTime = attempt * 2000;
                console.log(`⏳ 网络连接异常，等待 ${waitTime}ms 后重试...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                continue;
            }

            // 其他错误（如 4xx/5xx）也不重试
            break;
        }
    }

    // 所有重试都失败了
    console.error('❌ Intercom 消息发送最终失败:', lastError);
    throw lastError;
}

module.exports = {
    getCurrentAdminId,
    getAdminIdByName,
    sendTipMessageToUser,
    sendPaymentSuccessMessage,
    extractConversationId,
    extractAgentName
};
