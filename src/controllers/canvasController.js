const { extractConversationId, getAmountFromComponentId, logWithPrefix, generateSocketSignature } = require("../utils/helpers")
const { userMainCanvas, userPaymentCanvas } = require("../constants/canvasTemplates")
const conversationService = require("../services/conversationService")
const socketController = require("./socketController")

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
    const { component_id, card_creation_options, context, input_values, canvas, customer } = req.body
    const adminId = card_creation_options?.admin_id || "unknown"
    const conversationId = context?.conversation_id || extractConversationId(req) || "unknown"
    const userId = customer.user_id
    // 从 Canvas 之前的元数据中提取金额（如果存在）
    const previousAmount = canvas?.metadata?.amount

    logWithPrefix("🎯", `用户操作: ${component_id}, 对话: ${conversationId}`, req)

    // 记录操作
    conversationService.logConversationAction(conversationId, "user_submit", {
        componentId: component_id,
        adminId,
        input_values,
        previousAmount
    })

    // 处理返回金额选择界面
    if (component_id === "back_to_amounts") {
        const response = userMainCanvas(conversationId)
        res.json(response)
        return
    }

    // 获取打赏金额
    let amount = getAmountFromComponentId(component_id)

    // 处理自定义金额
    if (component_id === "tip_custom") {
        const customAmount = input_values?.custom_amount_input
        if (customAmount) {
            amount = parseFloat(customAmount)
            logWithPrefix("💰", `自定义金额: ${amount}`)
        }
    }

    // 如果当前操作不是选择金额，则使用之前的金额
    if (!amount && previousAmount) {
        amount = previousAmount
    }

    // 处理支付按钮
    if (component_id === "go_to_pay") {
        logWithPrefix("💳", `用户${userId}点击去支付, 对话: ${conversationId}, 金额: ${amount}`)
        
        // 发送 WebSocket 消息通知用户端支付已启动
        socketController.sendMessage(userId, {
            event: "payment_started",
            message: "Payment process initiated",
            amount: amount,
            timestamp: new Date().toISOString()
        })
    }

    // 生成连接信息
    const signature = generateSocketSignature(userId, socketController.SOCKET_SECRET)
    const socketInfo = {
        endpoint: "/ws",
        userId,
        signature
    }

    // 返回支付跳转界面
    const response = userPaymentCanvas(adminId, amount || 0, conversationId, socketInfo)
    res.json(response)
}

module.exports = {
    initialize,
    submit,
}
