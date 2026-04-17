const { extractConversationId, logWithPrefix } = require("../utils/helpers")
const { adminReviewMainCanvas, adminReviewSuccessCanvas, userReviewCanvas } = require("../constants/canvasTemplates")
const conversationService = require("../services/conversationService")

/**
 * 客服端初始化 - 显示评价主界面
 */
const agentInitialize = (req, res) => {
    const conversationId = extractConversationId(req) || "unknown"
    logWithPrefix("🔍", `评价客服端 - 初始化 对话 ID: ${conversationId}`)
    const response = adminReviewMainCanvas(conversationId)
    res.json(response)
}

/**
 * 客服端提交 - 发送评价卡片
 */
const agentSubmit = (req, res) => {
    const conversationId = extractConversationId(req) || req.body.canvas?.metadata?.conversationId || "unknown"
    const adminId = req.body.admin?.id || "unknown"
    logWithPrefix("🔍", `评价客服端 - 发送评价卡片 对话 ID: ${conversationId}`)

    // 生成卡片创建选项 (标记为 review 类型，虽然现在有独立接口，但 card_creation_options 还是需要的)
    const cardCreationOptions = conversationService.generateCardCreationOptions(adminId, conversationId)
    // 强制标记类型，以便用户端初始化时识别
    cardCreationOptions.type = "review"

    const response = {
        ...adminReviewSuccessCanvas(conversationId),
        card_creation_options: cardCreationOptions,
    }

    res.json(response)
}

/**
 * 用户端初始化 - 显示评价界面
 */
const userInitialize = (req, res) => {
    const conversationId = extractConversationId(req)
    const agentName = "Support Agent"
    const response = userReviewCanvas(conversationId, agentName)
    res.json(response)
}

/**
 * 评价重定向 - 根据设备跳转到不同的商店
 */
const userRedirect = (req, res) => {
    logWithPrefix("🔍", `评价重定向 - 请求头:`, req.headers)
    const userAgent = req.headers['user-agent'] || '';
    const isApple = /iPhone|iPad|iPod|Macintosh/i.test(userAgent);
    
    const appleStoreUrl = 'https://apps.apple.com/cn/app/mulebuy-buy-from-china/id6744265394';
    const googlePlayUrl = 'https://play.google.com/store/apps/details?id=com.mulebuy.app';
    
    const targetUrl = isApple ? appleStoreUrl : googlePlayUrl;
    
    logWithPrefix("🔗", `评价重定向 - 设备: ${isApple ? 'Apple' : 'Other'}, 跳转: ${targetUrl}`);
    
    res.redirect(targetUrl);
}

module.exports = {
    agentInitialize,
    agentSubmit,
    userInitialize,
    userRedirect,
}
