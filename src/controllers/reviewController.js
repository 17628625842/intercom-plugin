const { extractConversationId, logWithPrefix, extractAgentName } = require("../utils/helpers")
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
    const { canvas, current_canvas } = req.body
    const conversationId = extractConversationId(req) || canvas?.metadata?.conversationId || current_canvas?.metadata?.conversationId || "unknown"
    const adminId = req.body.admin?.id || "unknown"
    logWithPrefix("🔍", `评价客服端 - 发送评价卡片 对话 ID: ${conversationId}`)

    // 对齐打赏功能：返回 canvas + card_creation_options
    const cardCreationOptions = conversationService.generateCardCreationOptions(adminId, conversationId)
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
    const agentName = extractAgentName(req) || "Support Agent"

    logWithPrefix("🔍", `评价用户端 - 初始化 对话 ID: ${conversationId}`)

    const protocol = req.headers["x-forwarded-proto"] || "http"
    const host = req.headers.host
    const targetUrl = `${protocol}://${host}/review/user/open-store`

    const response = userReviewCanvas(conversationId, agentName, targetUrl)
    res.json(response)
}

/**
 * 用户端空白页 - 在前端判断设备并跳转商店
 */
const userOpenStorePage = (req, res) => {
    const appleStoreUrl = "https://apps.apple.com/app/id6744265394?action=write-review"
    const googlePlayUrl = "https://play.google.com/store/apps/details?id=com.mulebuyapp"

    const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redirecting...</title>
</head>
<body>
  <script>
    (function () {
      var ua = navigator.userAgent || "";
      var isIOS = /iPhone|iPad|iPod|Macintosh/i.test(ua);
      var appleStoreUrl = ${JSON.stringify(appleStoreUrl)};
      var googlePlayUrl = ${JSON.stringify(googlePlayUrl)};
      var targetUrl = isIOS ? appleStoreUrl : googlePlayUrl;
      window.location.replace(targetUrl);
    })();
  </script>
</body>
</html>`

    res.setHeader("Content-Type", "text/html; charset=utf-8")
    res.send(html)
}

/**
 * 评价重定向 - 根据设备跳转到不同的商店
 */
const userRedirect = (req, res) => {
    logWithPrefix("🔍", `评价重定向 - 请求头:`, req.headers)
    const userAgent = req.headers["user-agent"] || ""
    const isApple = /iPhone|iPad|iPod|Macintosh/i.test(userAgent)

    const appleStoreUrl = "https://apps.apple.com/cn/app/mulebuy-buy-from-china/id6744265394"
    const googlePlayUrl = "https://play.google.com/store/apps/details?id=com.mulebuy.app"

    const targetUrl = isApple ? appleStoreUrl : googlePlayUrl

    logWithPrefix("🔗", `评价重定向 - 设备: ${isApple ? "Apple" : "Other"}, 跳转: ${targetUrl}`)

    res.redirect(targetUrl)
}

module.exports = {
    agentInitialize,
    agentSubmit,
    userInitialize,
    userOpenStorePage,
    userRedirect,
}
