/**
 * 从请求中提取对话 ID
 * @param {object} req - 请求对象
 * @returns {string|null} 对话 ID
 */
function extractConversationId(req) {
    console.log('🔍 开始提取对话 ID...');
    
    const possibleIds = [
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
    const amountMap = {
      tip_1: 1,
      tip_5: 5,
      tip_10: 10,
      tip_20: 20,
    };
    return amountMap[componentId] || null;
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

module.exports = {
    extractConversationId,
    getAmountFromComponentId,
    logWithPrefix,
    generateSocketSignature,
};