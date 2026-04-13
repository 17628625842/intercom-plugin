const { 
    extractConversationId, 
    getAmountFromComponentId, 
    getAdminIdFromComponentId,
    logWithPrefix, 
    generateSocketSignature, 
    extractAgentName 
} = require("../utils/helpers")
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
    let agentName = extractAgentName(req)
    let adminId = cardCreationOptions.admin_id || "unknown";
    
    logWithPrefix("🔍", `用户端初始化 - 客服: ${agentName} (${adminId})`)
    
    const response = userMainCanvas(conversationId, agentName, adminId)
    res.json(response)
}

/**
 * 用户端提交 - 处理打赏按钮点击
 */
const submit = (req, res) => {
    const { component_id, card_creation_options, context, input_values, customer, user, current_canvas } = req.body
    
    // 优先级：请求体中的 options > 当前卡片的 metadata > 从 component_id 解析 > 兜底
    let adminId = card_creation_options?.admin_id || current_canvas?.metadata?.adminId;
    
    // 如果上面都没拿到，尝试从按钮 ID 中提取（最可靠的持久化方案）
    if (!adminId || adminId === "unknown") {
        const extractedAdminId = getAdminIdFromComponentId(component_id);
        if (extractedAdminId) {
            adminId = extractedAdminId;
            logWithPrefix("🔗", `从组件 ID 提取到客服 ID: ${adminId}`);
        }
    }
    if (!adminId) adminId = "unknown";

    const agentName = "Support Agent"
    const components = current_canvas?.content?.components || [];
    for (const comp of components) {
        if (comp.type === 'text' && comp.text) {
            // 匹配 "💝 Thank Allen!" 或 "Thank Allen!" 格式
            const match = comp.text.match(/Thank\s+(\w+)/i);
            if (match && match[1]) {
                agentName = match[1];
                console.log(`✅ 从 canvas 文本中解析客服名字: ${agentName}`);
                break;
            }
        }
    }

    const conversationId = context?.conversation_id || current_canvas?.metadata?.conversationId || extractConversationId(req) || "unknown"
    
    // 鲁棒性获取 userId
    const userId = user?.external_id || user?.user_id || customer?.user_id || customer?.id || "unknown"
    
    // 获取基础的 component_id (去掉 :adminId 部分)
    const baseComponentId = component_id.split(':')[0];
    
    logWithPrefix("🎯", `用户操作: ${baseComponentId}, 客服: ${agentName} (${adminId}), 对话: ${conversationId}`)

    // 1. 处理视图切换
    if (baseComponentId === "show_custom_input") {
        return res.json(userCustomAmountCanvas(conversationId, adminId, agentName))
    }

    if (baseComponentId === "back_to_main" || baseComponentId === "back_to_amounts") {
        return res.json(userMainCanvas(conversationId, agentName, adminId))
    }

    // 2. 获取打赏金额
    let amount = getAmountFromComponentId(component_id)

    // 处理自定义金额提交
    if (baseComponentId === "tip_custom_submit") {
        const customAmount = input_values?.custom_amount_input
        if (customAmount) {
            amount = parseFloat(customAmount)
            logWithPrefix("💰", `自定义金额输入: ${amount}`)
        }
        
        if (!amount || isNaN(amount) || amount <= 0) {
            logWithPrefix("⚠️", "无效的自定义金额，返回输入界面")
            return res.json(userCustomAmountCanvas(conversationId, adminId, agentName))
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
        // 返回支付跳转界面，并将 adminId, agentName 等存入 metadata
        return res.json(userPaymentCanvas(adminId, amount, conversationId, socketInfo, false, agentName))
    }

    // 4. 处理支付确认按钮点击 (Go to Pay)
    if (baseComponentId === "go_to_pay" || baseComponentId.startsWith("go_to_pay_")) {
        // 优先从 ID 中提取金额，如果失败则回退到 metadata
        let currentAmount = 0
        if (baseComponentId.startsWith("go_to_pay_")) {
            const extractedAmount = parseFloat(baseComponentId.replace("go_to_pay_", ""))
            if (!isNaN(extractedAmount)) {
                currentAmount = extractedAmount
                logWithPrefix("💰", `从按钮 ID 提取到金额: ${currentAmount}`)
            }
        }
        
        if (currentAmount <= 0) {
            currentAmount = parseFloat(current_canvas?.metadata?.amount || 0)
        }
        
        logWithPrefix("💳", `用户 ${userId} 点击去支付, 对话: ${conversationId}, 最终确认金额: ${currentAmount}`)
        
        if (currentAmount > 0) {
            // 发送 WebSocket 消息通知用户端支付已启动
            socketController.sendMessage(userId, {
                event: "payment_started",
                message: "Payment process initiated",
                amount: currentAmount,
                timestamp: new Date().toISOString(),
                adminId,
                agentName,
            })
        } else {
            logWithPrefix("⚠️", "确认支付时金额为 0，可能 metadata 丢失")
        }

        // 重新生成签名信息保持连接有效性
        const signature = generateSocketSignature(userId, socketController.SOCKET_SECRET)
        const socketInfo = { endpoint: "/ws", userId, signature }
        
        // 返回支付跳转界面，设置 isProcessing 为 true，显示提示文本并隐藏按钮
        return res.json(userPaymentCanvas(adminId, currentAmount, conversationId, socketInfo, true, agentName))
    }

    // 兜底返回主界面
    res.json(userMainCanvas(conversationId, agentName, adminId))
}

module.exports = {
    initialize,
    submit,
}
