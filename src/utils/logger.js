/**
 * 日志工具模块
 * 根据环境变量控制日志详细程度
 */

const isProduction = process.env.NODE_ENV === 'production';

/**
 * 日志级别
 * - error: 始终输出
 * - warn: 始终输出
 * - info: 始终输出
 * - debug: 仅开发环境输出
 * - verbose: 仅开发环境输出
 */

const logger = {
    // 错误日志 - 始终输出
    error: (...args) => {
        console.error('❌', ...args);
    },

    // 警告日志 - 始终输出
    warn: (...args) => {
        console.warn('⚠️', ...args);
    },

    // 信息日志 - 始终输出
    info: (...args) => {
        console.log('ℹ️', ...args);
    },

    // 成功日志 - 始终输出
    success: (...args) => {
        console.log('✅', ...args);
    },

    // 调试日志 - 仅开发环境
    debug: (...args) => {
        if (!isProduction) {
            console.log('🔍', ...args);
        }
    },

    // 详细日志 - 仅开发环境
    verbose: (...args) => {
        if (!isProduction) {
            console.log('📋', ...args);
        }
    },

    // 请求日志 - 生产环境简化
    request: (method, path) => {
        if (isProduction) {
            // 生产环境：只记录路径，不记录时间戳
            console.log(`${method} ${path}`);
        } else {
            // 开发环境：完整信息
            console.log(`📨 ${new Date().toISOString()} | ${method} ${path}`);
        }
    },

    // 支付日志 - 始终输出（业务关键）
    payment: (...args) => {
        console.log('💳', ...args);
    },

    // 数据库日志 - 生产环境简化
    db: (...args) => {
        if (isProduction) {
            // 生产环境：只记录关键信息
            const message = args[0];
            if (typeof message === 'string' && (message.includes('失败') || message.includes('错误'))) {
                console.log('📝', ...args);
            }
        } else {
            console.log('📝', ...args);
        }
    }
};

module.exports = logger;
