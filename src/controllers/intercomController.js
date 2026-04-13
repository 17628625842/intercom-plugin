const { extractConversationId, logWithPrefix, extractAgentName } = require("../utils/helpers")
const { adminMainCanvas, adminSuccessCanvas } = require("../constants/canvasTemplates")
const conversationService = require("../services/conversationService")

/**
 * 客服端初始化 - 显示主界面
 */
const initialize = (req, res) => {
    const conversation = req.body.conversation || {}
    const conversationId = extractConversationId(req) || conversation.id || "unknown"
    logWithPrefix("🔍", `客服端 - 对话 ID: ${conversationId}`)
    const response = adminMainCanvas(conversationId)
    res.json(response)
}

/**
 * 客服端提交 - 处理按钮点击
 */
const submit = (req, res) => {
    const { component_id, canvas } = req.body
    const conversationId = extractConversationId(req) || canvas?.metadata?.conversationId || "unknown"
    const adminId = req.body.admin?.id || "unknown"
    // 获取输入框中的名字
    // const inputAgentName = req.body.input_values?.agent_name_input?.trim();
    logWithPrefix("🔍", `客服操作: ${component_id}, 对话 ID: ${conversationId}`)

    // 生成卡片创建选项
    const cardCreationOptions = conversationService.generateCardCreationOptions(adminId, conversationId)

    // 返回响应，包含更新后的界面和卡片创建选项
    const response = {
        ...adminSuccessCanvas(conversationId),
        card_creation_options: cardCreationOptions,
    }

    res.json(response)
}

module.exports = {
    initialize,
    submit,
}
