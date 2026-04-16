/**
 * 从请求中提取对话 ID
 * @param {object} req - 请求对象
 * @returns {string|null} 对话 ID
 */
function extractConversationId(req) {
    console.log('🔍 开始提取对话 ID...');
    
    const possibleIds = [
      req.body.conversation_id,
      req.body.context?.conversation_id,
      req.body.conversation?.id,
      req.body.canvas?.metadata?.conversationId,
      req.body.conversationId,
      req.body.id,
      req.body.card_creation_options?.conversationId,
      req.body.context?.conversation?.id,
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
   * 获取金额对应的数值
   * @param {string} componentId - 组件 ID
   * @returns {number|null} 金额
   */
  function getAmountFromComponentId(componentId) {
    // 兼容带 admin_id 的 ID，例如 "tip_5:12345"
    const baseId = componentId.split(':')[0];
    const amountMap = {
      tip_1: 1,
      tip_5: 5,
      tip_10: 10,
      tip_20: 20,
    };
    return amountMap[baseId] || null;
  }

  /**
   * 从组件 ID 中提取客服 ID
   * @param {string} componentId - 组件 ID
   * @returns {string|null} 客服 ID
   */
  function getAdminIdFromComponentId(componentId) {
    if (!componentId || !componentId.includes(':')) return null;
    return componentId.split(':')[1];
  }
  
  /**
   * 格式化日志输出
   * @param {string} prefix - 日志前缀
   * @param {string} message - 日志消息
   * @param {object} data - 附加数据
   */
  function logWithPrefix(prefix, message, data = null) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${prefix} ${message}`;
    
    if (data) {
      console.log(logMessage, data);
    } else {
      console.log(logMessage);
    }
  }
  
  const crypto = require("crypto")

/**
 * 生成 Socket 签名
 * @param {string|number} userId 用户 ID
 * @param {string} secret 密钥
 * @returns {string} 签名
 */
function generateSocketSignature(userId, secret) {
    // 确保 userId 是字符串，避免 TypeError [ERR_INVALID_ARG_TYPE]
    const idStr = String(userId)
    return crypto.createHmac("sha256", secret).update(idStr).digest("hex")
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
 * 判断请求是否来自 App
 * @param {object} req - 请求对象
 * @returns {boolean} 是否来自 App
 */
function isFromApp(req) {
    // 1. 检查 customer/contact 对象中的 app 信息
    const customer = req.body.customer || req.body.contact || {};
    
    // 如果有 ios_app_name 或 android_app_name，通常意味着用户安装了 App
    // 但更准确的是看当前请求的上下文
    if (customer.ios_app_name === 'Mulebuy' || customer.android_app_name === 'Mulebuy') {
        // 如果 OS 是 iOS 或 Android，且没有明确的浏览器（或者浏览器是内嵌的）
        const os = (customer.os || '').toLowerCase();
        const browser = (customer.browser || '').toLowerCase();
        
        if (os.includes('ios') || os.includes('android')) {
            // 在 App SDK 中，browser 字段通常为空或者特定值
            if (!browser || browser === 'unknown' || browser.includes('intercom')) {
                return true;
            }
        }
    }

    return false;
}

module.exports = {
    extractAgentName,
    extractConversationId,
    getAmountFromComponentId,
    getAdminIdFromComponentId,
    logWithPrefix,
    generateSocketSignature,
    isFromApp,
};