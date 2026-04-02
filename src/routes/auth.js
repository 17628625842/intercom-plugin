/**
 * 认证路由模块
 * 处理登录、登出（使用 JWT Token）
 */

const express = require('express');
const router = express.Router();
const { config } = require('../config');
const { createLoginPage } = require('../views/login');
const { generateToken } = require('../utils/auth');

// 登录路由
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (username === config.admin.username && password === config.admin.password) {
        // 生成 JWT Token
        const token = generateToken({
            authenticated: true,
            username: username,
            loginTime: Date.now()
        });

        // 设置 HttpOnly Cookie（更安全）
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // 生产环境使用 HTTPS
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000 // 24小时
        });

        console.log(`✅ 用户 ${username} 登录成功 (JWT)`);
        res.redirect('/');
    } else {
        console.log(`❌ 登录失败: 用户名或密码错误`);
        res.send(createLoginPage('用户名或密码错误'));
    }
});

// 退出登录路由
router.get('/logout', (req, res) => {
    // 清除 JWT Cookie
    res.clearCookie('auth_token');

    console.log('👋 用户已登出');
    res.redirect('/');
});

module.exports = router;
