/**
 * 认证中间件模块
 * 使用 JWT Token 进行无状态认证（适配 Serverless 环境）
 */

const jwt = require('jsonwebtoken');
const { config } = require('../config');
const { createLoginPage } = require('../views/login');

/**
 * 验证 JWT Token
 * @param {string} token - JWT Token
 * @returns {object|null} 解码后的 payload 或 null
 */
function verifyToken(token) {
    try {
        return jwt.verify(token, config.jwt.secret);
    } catch (error) {
        console.log('⚠️ JWT 验证失败:', error.message);
        return null;
    }
}

/**
 * 生成 JWT Token
 * @param {object} payload - Token 载荷
 * @returns {string} JWT Token
 */
function generateToken(payload) {
    return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
}

/**
 * 登录验证中间件
 * 优先检查 JWT Token，兼容 Session（用于平滑过渡）
 */
function requireAuth(req, res, next) {
    // 1. 优先检查 JWT Token（从 Cookie 中获取）
    const token = req.cookies?.auth_token;

    if (token) {
        const decoded = verifyToken(token);
        if (decoded && decoded.authenticated) {
            req.user = decoded;
            return next();
        }
    }

    // 2. 检查是否是登录请求
    if (req.method === 'POST' && req.path === '/login') {
        return next();
    }

    // 4. 未认证，返回登录页面
    res.send(createLoginPage());
}

module.exports = {
    requireAuth,
    generateToken,
    verifyToken
};
