/**
 * 对话服务 - 处理对话相关的业务逻辑
 */

class ConversationService {
    constructor() {
      // 可以在这里初始化数据库连接等
      this.conversationCache = new Map();
    }
  
    /**
     * 生成卡片创建选项
     * @param {string} adminId - 客服 ID
     * @param {string} conversationId - 对话 ID
     * @param {string} agentName - 客服名称
     * @returns {object} 卡片创建选项
     */
    generateCardCreationOptions(adminId, conversationId, agentName = "Support Agent") {
      return {
        admin_id: adminId,
        conversationId: conversationId,
        agent_name: agentName,
        created_at: new Date().toISOString(),
      };
    }
  }
  
  module.exports = new ConversationService();
