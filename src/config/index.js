/**
 * 配置模块
 * 集中管理所有配置常量和服务初始化
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// 环境变量配置
const config = {
    port: process.env.PORT || 3000,
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',

    // Supabase 配置
    supabase: {
        url: process.env.SUPABASE_URL,
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        anonKey: process.env.SUPABASE_ANON_KEY
    },

    // PayPal 配置
    paypal: {
        clientId: process.env.PAYPAL_CLIENT_ID,
        clientSecret: process.env.PAYPAL_CLIENT_SECRET,
        mode: 'live' // 正式环境
    },

    // Intercom 配置
    intercom: {
        accessToken: process.env.INTERCOM_ACCESS_TOKEN,
        apiBase: 'https://api.intercom.io'
    },

    // 飞书配置
    feishu: {
        webhookUrl: process.env.FEISHU_WEBHOOK_URL
    },

    // JWT 配置（用于 Serverless 环境的认证）
    jwt: {
        secret: process.env.JWT_SECRET || 'mulebuy-jwt-secret-key-2024',
        expiresIn: '24h' // Token 有效期 24 小时
    },

    // PayPal 费率配置
    fees: {
        percentage: 0.044, // 4.4%
        fixed: 0.3 // $0.3
    },

    // 默认汇率
    defaultExchangeRate: 7.2,

    // 管理员凭证（从环境变量读取，增强安全性）
    admin: {
        username: process.env.ADMIN_USERNAME || 'admin',
        password: process.env.ADMIN_PASSWORD || 'mulebuy123'
    }
};

// 创建 Supabase 客户端
const supabase = {}

module.exports = {
    config,
    supabase
};
