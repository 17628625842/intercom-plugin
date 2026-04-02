/**
 * 客服打赏系统 - 主入口文件
 * 
 * 重构版本：模块化架构
 * 原始版本的所有功能保持不变
 */

require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser'); // 用于解析 JWT Cookie
const { config } = require('./src/config');

// 导入路由模块
const {
    authRoutes,
    paymentRoutes,
    canvasRoutes,
    apiRoutes,
    adminRoutes
} = require('./src/routes');

// 创建 Express 应用
const app = express();

// 信任反向代理 (解决 Vercel/Nginx 等环境下的真实 IP 获取问题)
// 这也是解决 express-rate-limit 报错 "ERR_ERL_UNEXPECTED_X_FORWARDED_FOR" 的关键
app.set('trust proxy', 1);

// 中间件配置
app.use(cors({
    origin: true,
    credentials: true
}));

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Cookie 解析器（用于 JWT Token）
app.use(cookieParser());

// 速率限制配置
const rateLimit = require('express-rate-limit');

// 登录接口速率限制（严格：每15分钟最多5次失败尝试）
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 5, // 最多5次请求
    message: { error: '登录尝试过于频繁，请15分钟后再试' },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true // 成功的请求不计入限制
});

// 通用 API 速率限制（宽松：每分钟100次）
const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1分钟
    max: 100, // 最多100次请求
    message: { error: '请求过于频繁，请稍后再试' },
    standardHeaders: true,
    legacyHeaders: false
});

// 为登录接口应用严格限制
app.post('/login', loginLimiter);

// 为 API 接口应用通用限制
app.use('/api', apiLimiter);
app.use('/create-payment', apiLimiter);

// 静态文件服务 (favicon 等)
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

// 日志工具
const logger = require('./src/utils/logger');

// 请求日志中间件（生产环境自动简化）
app.use((req, res, next) => {
    logger.request(req.method, req.path);
    next();
});

// 注册路由
app.use('/', authRoutes);      // 认证路由 (登录/登出)
app.use('/', paymentRoutes);   // 支付路由 (打赏页面、PayPal支付)
app.use('/', canvasRoutes);    // Canvas 路由 (Intercom Canvas 应用)
app.use('/', apiRoutes);       // API 路由 (汇率等)
app.use('/', adminRoutes);     // 管理后台路由 (必须放在最后，因为包含 '/' 根路由)

// 健康检查（含数据库验证）
const { testConnection } = require('./src/services/database');

app.get('/health', async (req, res) => {
    const health = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '2.0.0-modular',
        services: {
            server: 'healthy',
            database: 'unknown'
        }
    };

    try {
        // 检查数据库连接
        const dbConnected = await testConnection();
        health.services.database = dbConnected ? 'healthy' : 'unhealthy';

        // 如果数据库不健康，整体状态也不健康
        if (!dbConnected) {
            health.status = 'degraded';
        }
    } catch (error) {
        health.services.database = 'error';
        health.status = 'unhealthy';
        health.error = process.env.NODE_ENV === 'production'
            ? 'Database connection failed'
            : error.message;
    }

    // 根据状态返回对应的 HTTP 状态码
    const statusCode = health.status === 'ok' ? 200 : 503;
    res.status(statusCode).json(health);
});

// 404 处理
app.use((req, res) => {
    console.log(`⚠️ 404 未找到: ${req.method} ${req.path}`);
    res.status(404).json({
        error: 'Not Found',
        path: req.path
    });
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('❌ 服务器错误:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
    });
});

// 启动服务器
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('');
    console.log('🎉 ========================================');
    console.log('🎉   客服打赏系统 v2.0 (模块化版本)');
    console.log('🎉 ========================================');
    console.log(`🚀 服务器运行在: http://localhost:${PORT}`);
    console.log(`📊 管理后台: http://localhost:${PORT}/`);
    console.log(`💰 PayPal 模式: ${config.paypal.mode}`);
    console.log(`🔗 Base URL: ${config.baseUrl}`);
    console.log('');
    console.log('📦 已加载的模块:');
    console.log('   ├── config/       - 配置模块');
    console.log('   ├── utils/        - 工具函数');
    console.log('   │   ├── auth      - 认证中间件');
    console.log('   │   ├── currency  - 货币工具');
    console.log('   │   └── intercom  - Intercom API');
    console.log('   ├── services/     - 业务服务');
    console.log('   │   ├── paypal    - PayPal 支付');
    console.log('   │   ├── database  - 数据库操作');
    console.log('   │   └── excel     - Excel 导出');
    console.log('   ├── views/        - 视图模板');
    console.log('   │   ├── login     - 登录页面');
    console.log('   │   ├── tip-page  - 打赏页面');
    console.log('   │   ├── admin     - 管理后台');
    console.log('   │   └── canvas    - Intercom Canvas');
    console.log('   └── routes/       - 路由处理');
    console.log('       ├── auth      - 认证路由');
    console.log('       ├── payment   - 支付路由');
    console.log('       ├── canvas    - Canvas 路由');
    console.log('       ├── admin     - 管理路由');
    console.log('       └── api       - API 路由');
    console.log('');
});

module.exports = app;
