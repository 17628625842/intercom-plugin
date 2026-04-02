/**
 * 视图模块导出
 */

const { createLoginPage } = require('./login');
const { createTipPage } = require('./tip-page');
const { createPaymentResultPage } = require('./payment-result');
const {
    createUserTipCanvas,
    createPaymentCanvas,
    createCustomAmountCanvas,
    createPayPalCanvas,
    createErrorCanvas,
    createAgentMainCanvas,
    createAgentSetupCanvas,
    createSendSuccessCanvas,
    createSendErrorCanvas
} = require('./canvas');
const { generateAdminPage } = require('./admin-page');
const { generateMonthlyReport } = require('./monthly-report');

module.exports = {
    // 登录页面
    createLoginPage,

    // 打赏页面
    createTipPage,

    // 支付结果页面
    createPaymentResultPage,

    // Canvas 组件
    createUserTipCanvas,
    createPaymentCanvas,
    createCustomAmountCanvas,
    createPayPalCanvas,
    createErrorCanvas,
    createAgentMainCanvas,
    createAgentSetupCanvas,
    createSendSuccessCanvas,
    createSendErrorCanvas,

    // 管理后台页面
    generateAdminPage,
    generateMonthlyReport
};
