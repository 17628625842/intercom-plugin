/**
 * 服务模块导出
 */

const { createPayPalPayment, executePayPalPayment, processPayPalRefund } = require('./paypal');
const {
    getTips,
    getMonthlyTips,
    getAllAgentNames,
    getTipById,
    getTipByPaymentId,
    createTip,
    updateRefundStatus,
    getFinalRecord,
    testConnection
} = require('./database');
const { generateExcelExport } = require('./excel');

module.exports = {
    // PayPal 服务
    createPayPalPayment,
    executePayPalPayment,
    processPayPalRefund,

    // 数据库服务
    getTips,
    getMonthlyTips,
    getAllAgentNames,
    getTipById,
    getTipByPaymentId,
    createTip,
    updateRefundStatus,
    getFinalRecord,
    testConnection,

    // Excel 服务
    generateExcelExport
};
