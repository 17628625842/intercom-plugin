/**
 * 货币工具模块
 * 处理汇率获取、货币格式化和净金额计算
 */

const axios = require('axios');
const { config } = require('../config');

// 汇率缓存
let cachedRate = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10分钟缓存有效期

/**
 * 获取实时汇率 (USD -> CNY)
 * 带有 10 分钟缓存，减少 API 调用
 * @returns {Promise<number>} 汇率
 */
async function getExchangeRate() {
    // 检查缓存是否有效
    const now = Date.now();
    if (cachedRate && (now - cacheTimestamp) < CACHE_DURATION) {
        console.log(`💱 使用缓存汇率: ${cachedRate} (剩余 ${Math.round((CACHE_DURATION - (now - cacheTimestamp)) / 1000)}秒)`);
        return cachedRate;
    }

    try {
        const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD', {
            timeout: 5000
        });

        if (response.data && response.data.rates && response.data.rates.CNY) {
            const rate = response.data.rates.CNY;
            // 更新缓存
            cachedRate = rate;
            cacheTimestamp = now;
            console.log(`💱 获取USD->CNY汇率成功: ${rate} (已缓存10分钟)`);
            return rate;
        }
        throw new Error('汇率数据格式错误');
    } catch (error) {
        console.warn('⚠️ 获取实时汇率失败，使用默认汇率:', error.message);
        return config.defaultExchangeRate;
    }
}

/**
 * 格式化货币显示
 * @param {number} amount - 金额
 * @param {string} currency - 货币类型 ('USD' | 'CNY')
 * @param {number|null} exchangeRate - 汇率（如果显示CNY）
 * @returns {string} 格式化后的货币字符串
 */
function formatCurrency(amount, currency = 'USD', exchangeRate = null) {
    if (!amount || isNaN(amount)) return '-';

    if (currency === 'USD') {
        return `$${parseFloat(amount).toFixed(2)}`;
    } else if (currency === 'CNY' && exchangeRate) {
        const cnyAmount = parseFloat(amount) * exchangeRate;
        return `¥${cnyAmount.toFixed(2)}`;
    }

    return `$${parseFloat(amount).toFixed(2)}`;
}

/**
 * 计算扣除PayPal手续费后的净金额
 * PayPal手续费: 4.4% + $0.3
 * @param {number} grossAmount - 原始金额
 * @returns {number} 净金额
 */
function calculateNetAmount(grossAmount) {
    if (!grossAmount || isNaN(grossAmount)) return 0;

    const fee = (parseFloat(grossAmount) * config.fees.percentage) + config.fees.fixed;
    const netAmount = parseFloat(grossAmount) - fee;

    return Math.max(0, netAmount);
}

/**
 * 格式化净金额显示
 * @param {number} grossAmount - 原始金额
 * @param {string} currency - 货币类型
 * @param {number|null} exchangeRate - 汇率
 * @returns {string} 格式化后的净金额字符串
 */
function formatNetCurrency(grossAmount, currency = 'USD', exchangeRate = null) {
    const netAmount = calculateNetAmount(grossAmount);
    return formatCurrency(netAmount, currency, exchangeRate);
}

module.exports = {
    getExchangeRate,
    formatCurrency,
    calculateNetAmount,
    formatNetCurrency
};
