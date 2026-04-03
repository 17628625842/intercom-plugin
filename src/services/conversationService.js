/**
 * 对话服务 - 处理对话相关的业务逻辑
 */

class ConversationService {
    constructor() {
      // 可以在这里初始化数据库连接等
      this.conversationCache = new Map();
    }
  
    /**
     * 记录对话操作
     * @param {string} conversationId - 对话 ID
     * @param {string} action - 操作类型
     * @param {object} data - 附加数据
     */
    logConversationAction(conversationId, action, data = {}) {
      const timestamp = new Date().toISOString();
      const record = {
        conversationId,
        action,
        data,
        timestamp,
      };
      
      console.log(`[Conversation] ${action} - ${conversationId}`, data);
      
      // 可以保存到数据库
      if (!this.conversationCache.has(conversationId)) {
        this.conversationCache.set(conversationId, []);
      }
      this.conversationCache.get(conversationId).push(record);
      
      return record;
    }
  
    /**
     * 获取对话历史
     * @param {string} conversationId - 对话 ID
     * @returns {array} 对话历史
     */
    getConversationHistory(conversationId) {
      return this.conversationCache.get(conversationId) || [];
    }
  
    /**
     * 生成卡片创建选项
     * @param {string} adminId - 客服 ID
     * @param {string} adminName - 客服名称
     * @param {string} conversationId - 对话 ID
     * @returns {object} 卡片创建选项
     */
    generateCardCreationOptions(adminId, adminName, conversationId) {
      return {
        admin_id: adminId,
        admin_name: adminName,
        conversationId: conversationId,
        created_at: new Date().toISOString(),
      };
    }
  }
  
  module.exports = new ConversationService();