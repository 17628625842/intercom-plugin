const { extractConversationId, getAmountFromComponentId, logWithPrefix, generateSocketSignature, extractAgentName } = require("../utils/helpers")
const { userMainCanvas, userCustomAmountCanvas, userPaymentCanvas } = require("../constants/canvasTemplates")
const conversationService = require("../services/conversationService")
const socketController = require("./socketController")

/**
 * 用户端初始化 - 显示打赏界面
 */
const initialize = (req, res) => {
    const conversationId = extractConversationId(req)
    logWithPrefix("🎯", `Canvas 用户端 - 对话 ID: ${conversationId}`)

    const cardCreationOptions = req.body.card_creation_options || {};
    let agentName = cardCreationOptions.agentName;
    logWithPrefix("🔍", `用户端 - 客服名称: ${agentName}`, cardCreationOptions)
    
    // 如果 Configure Flow 没有传递，尝试从其他来源获取
    if (!agentName || agentName === 'Support Agent') {
        agentName = extractAgentName(req);
    }

    const response = userMainCanvas(conversationId, agentName)
    res.json(response)
}

/**
 * 用户端提交 - 处理打赏按钮点击
 */
const submit = (req, res) => {
    const { component_id, card_creation_options, context, input_values, customer, user } = req.body
    const adminId = card_creation_options?.admin_id || "unknown"
    const conversationId = context?.conversation_id || extractConversationId(req) || "unknown"
    
    // 鲁棒性获取 userId
    const userId = user?.external_id || user?.user_id || customer?.user_id || customer?.id || "unknown"
    
    logWithPrefix("🎯", `用户操作: ${component_id}, 对话: ${conversationId}`, req.body)

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
            logWithPrefix("💰", `自定义金额输入: ${amount}`)
        }
        
        if (!amount || isNaN(amount) || amount <= 0) {
            logWithPrefix("⚠️", "无效的自定义金额，返回输入界面")
            return res.json(userCustomAmountCanvas(conversationId))
        }
    }

    // 3. 处理支付跳转逻辑 (如果当前选择了金额)
    if (amount && !isNaN(amount)) {
        logWithPrefix("💸", `准备支付跳转, 金额: ${amount}`)
        // 生成连接信息
        const signature = generateSocketSignature(userId, socketController.SOCKET_SECRET)
        const socketInfo = {
            endpoint: "/ws",
            userId,
            signature
        }
        // 返回支付跳转界面，并将 amount 存入 metadata
        return res.json(userPaymentCanvas(adminId, amount, conversationId, socketInfo))
    }

    // 4. 处理支付确认按钮点击 (Go to Pay)
    if (component_id === "go_to_pay" || component_id.startsWith("go_to_pay_")) {
        // 优先从 ID 中提取金额，如果失败则回退到 metadata
        let currentAmount = 0
        if (component_id.startsWith("go_to_pay_")) {
            const extractedAmount = parseFloat(component_id.replace("go_to_pay_", ""))
            if (!isNaN(extractedAmount)) {
                currentAmount = extractedAmount
                logWithPrefix("💰", `从按钮 ID 提取到金额: ${currentAmount}`)
            }
        }
        
        logWithPrefix("💳", `用户 ${userId} 点击去支付, 对话: ${conversationId}, 最终确认金额: ${currentAmount}`)
        
        if (currentAmount > 0) {
            // 发送 WebSocket 消息通知用户端支付已启动
            socketController.sendMessage(userId, {
                event: "payment_started",
                message: "Payment process initiated",
                amount: currentAmount,
                timestamp: new Date().toISOString(),
                adminId
            })
        } else {
            logWithPrefix("⚠️", "确认支付时金额为 0，可能 metadata 丢失")
        }

        // 重新生成签名信息保持连接有效性
        const signature = generateSocketSignature(userId, socketController.SOCKET_SECRET)
        const socketInfo = { endpoint: "/ws", userId, signature }
        
        // 返回支付跳转界面，设置 isProcessing 为 true，显示提示文本并隐藏按钮
        return res.json(userPaymentCanvas(adminId, currentAmount, conversationId, socketInfo, true))
    }

    // 兜底返回主界面
    res.json(userMainCanvas(conversationId))
}

module.exports = {
    initialize,
    submit,
}
