const { extractConversationId, getAmountFromComponentId, logWithPrefix, generateSocketSignature } = require("../utils/helpers")
const { userMainCanvas, userCustomAmountCanvas, userPaymentCanvas } = require("../constants/canvasTemplates")
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

    // 1. 处理视图切换
    if (component_id === "show_custom_input") {
        return res.json(userCustomAmountCanvas(conversationId))
    }

    if (component_id === "back_to_main" || component_id === "back_to_amounts") {
        return res.json(userMainCanvas(conversationId))
    }

    // 2. 获取打赏金额
    let amount = getAmountFromComponentId(component_id)

    // 处理自定义金额提交
    if (component_id === "tip_custom_submit") {
        const customAmount = input_values?.custom_amount_input
        if (customAmount) {
            amount = parseFloat(customAmount)
            logWithPrefix("💰", `自定义金额: ${amount}`)
        }
        
        if (!amount || isNaN(amount) || amount <= 0) {
            // 如果金额无效，可以返回错误提示或回到输入界面
            // 这里简单处理，回到主界面
            return res.json(userMainCanvas(conversationId))
        }
    }

    // 3. 处理支付跳转逻辑
    if (amount) {
        // 生成连接信息
        const signature = generateSocketSignature(userId, socketController.SOCKET_SECRET)
        const socketInfo = {
            endpoint: "/ws",
            userId,
            signature
        }
        // 返回支付跳转界面
        return res.json(userPaymentCanvas(adminId, amount, conversationId, socketInfo))
    }

    // 4. 处理支付确认按钮点击 (Go to Pay)
    if (component_id === "go_to_pay") {
        const currentAmount = previousAmount || 0
        logWithPrefix("💳", `用户${userId}点击去支付, 对话: ${conversationId}, 金额: ${currentAmount}`)
        
        // 发送 WebSocket 消息通知用户端支付已启动
        socketController.sendMessage(userId, {
            event: "payment_started",
            message: "Payment process initiated",
            amount: currentAmount,
            timestamp: new Date().toISOString()
        })

        // 重新生成签名信息保持连接有效性
        const signature = generateSocketSignature(userId, socketController.SOCKET_SECRET)
        const socketInfo = { endpoint: "/ws", userId, signature }
        
        return res.json(userPaymentCanvas(adminId, currentAmount, conversationId, socketInfo))
    }

    // 兜底返回主界面
    res.json(userMainCanvas(conversationId))
}

module.exports = {
    initialize,
    submit,
}
