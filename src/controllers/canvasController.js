const { extractConversationId, getAmountFromComponentId, logWithPrefix } = require("../utils/helpers")
const { userMainCanvas, userPaymentCanvas } = require("../constants/canvasTemplates")
const conversationService = require("../services/conversationService")

/**
 * 用户端初始化 - 显示打赏界面
 */
const initialize = (req, res) => {
    const conversationId = extractConversationId(req)
    logWithPrefix("🎯", `Canvas 用户端 - 对话 ID: ${conversationId}`)

    // 记录操作
    conversationService.logConversationAction(conversationId, "user_initialize", {
        cardCreationOptions: req.body.card_creation_options,
    })

    const response = userMainCanvas(conversationId)
    res.json(response)
}

/**
 * 用户端提交 - 处理打赏按钮点击
 */
const submit = (req, res) => {
    const { component_id, card_creation_options, context } = req.body
    const adminId = card_creation_options?.admin_id || "unknown"
    const conversationId = context?.conversation_id || extractConversationId(req) || "unknown"

    logWithPrefix("🎯", `用户操作: ${component_id}, 对话: ${conversationId}`)

    // 记录操作
    conversationService.logConversationAction(conversationId, "user_submit", {
        componentId: component_id,
        adminId,
    })

    // 处理返回金额选择界面
    if (component_id === "back_to_amounts") {
        const response = userMainCanvas(conversationId)
        res.json(response)
        return
    }

    // 获取打赏金额
    const amount = getAmountFromComponentId(component_id)

    // 处理自定义金额
    if (component_id === "tip_custom") {
        // 可以在这里处理自定义金额逻辑
        console.log("自定义金额功能待实现")
    }

    // 返回支付跳转界面
    const response = userPaymentCanvas(adminId, amount || 0, conversationId)
    res.json(response)
}

module.exports = {
    initialize,
    submit,
}
