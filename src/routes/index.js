/**
 * 路由模块导出
 */

const authRoutes = require('./auth');
const paymentRoutes = require('./payment');
const canvasRoutes = require('./canvas');
const apiRoutes = require('./api');
const adminRoutes = require('./admin');

module.exports = {
    authRoutes,
    paymentRoutes,
    canvasRoutes,
    apiRoutes,
    adminRoutes
};
