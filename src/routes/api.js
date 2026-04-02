/**
 * API 路由模块
 * 处理各种 API 请求
 */

const express = require('express');
const router = express.Router();
const { requireAuth } = require('../utils/auth');
const { getExchangeRate } = require('../utils/currency');

// 实时汇率API端点
router.get('/api/exchange-rate', async (req, res) => {
    try {
        const rate = await getExchangeRate();
        res.json({
            success: true,
            rate: rate,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ 汇率API错误:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
