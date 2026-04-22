const { extractConversationId, getAmountFromComponentId, getAdminIdFromComponentId, logWithPrefix, generateSocketSignature } = require("../utils/helpers")
const { userMainCanvas, userCustomAmountCanvas, userPaymentCanvas } = require("../constants/canvasTemplates")
const tokenController = require("./tokenController")

/**
 * 用户端初始化 - 显示打赏界面
 */
const initialize = (req, res) => {
    const conversationId = extractConversationId(req)
    logWithPrefix("🎯", `Canvas 用户端 - 对话 ID: ${conversationId}`)

    const cardCreationOptions = req.body.card_creation_options || {}
    const agentName = "Support Agent"
    let adminId = cardCreationOptions.admin_id || "unknown"

    logWithPrefix("🔍", `用户端初始化 - 客服: ${agentName} (${adminId})`)

    const response = userMainCanvas(conversationId, agentName, adminId)
    res.json(response)
}

/**
 * 用户端提交 - 处理打赏按钮点击
 */
const submit = (req, res) => {
    const { component_id, card_creation_options, context, input_values, customer, user, current_canvas } = req.body
    logWithPrefix("🔍", `用户端提交 -`, req.body)

    // 优先级：请求体中的 options > 当前卡片的 metadata > 从 component_id 解析 > 兜底
    let adminId = card_creation_options?.admin_id || current_canvas?.metadata?.adminId

    // 如果上面都没拿到，尝试从按钮 ID 中提取（最可靠的持久化方案）
    if (!adminId || adminId === "unknown") {
        const extractedAdminId = getAdminIdFromComponentId(component_id)
        if (extractedAdminId) {
            adminId = extractedAdminId
            logWithPrefix("🔗", `从组件 ID 提取到客服 ID: ${adminId}`)
        }
    }
    if (!adminId) adminId = "unknown"

    const agentName = "Support Agent"

    const conversationId = context?.conversation_id || current_canvas?.metadata?.conversationId || extractConversationId(req) || "unknown"

    // 鲁棒性获取 userId
    const userId = user?.external_id || user?.user_id || customer?.user_id || customer?.id || "unknown"

    // 获取基础的 component_id (去掉 :adminId 部分)
    const baseComponentId = component_id.split(":")[0]

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
            return res.json(userCustomAmountCanvas(conversationId, adminId, agentName, "Please enter a valid amount greater than 0."))
        }

        if (amount > 999) {
            logWithPrefix("⚠️", `自定义金额超出上限: ${amount}`)
            return res.json(userCustomAmountCanvas(conversationId, adminId, agentName, "Maximum tip amount is $999."))
        }
    }

    // 3. 处理支付跳转逻辑 (如果当前选择了金额)
    if (amount && !isNaN(amount)) {
        logWithPrefix("💸", `准备支付跳转, 金额: ${amount}`)

        // --- 安全增强：生成短效一次性票据 ---
        const ticketId = tokenController.exchangeTicket(userId)

        // 使用固定的 baseUrl
        const baseUrl = "https://mulebuy.com"

        // 无论何种环境，都跳转到 H5 页面
        const targetUrl = `${baseUrl}?ticketId=${ticketId || ""}&amount=${amount}&adminId=${adminId}`

        logWithPrefix("🌐", `设置按钮跳转 H5 URL (Ticket 模式): ${targetUrl}`)

        // 返回支付跳转界面
        return res.json(userPaymentCanvas(amount, targetUrl))
    }

    // 兜底返回主界面
    res.json(userMainCanvas(conversationId, agentName, adminId))
}

module.exports = {
    initialize,
    submit,
}
