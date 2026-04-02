/**
 * 管理后台路由模块
 * 处理管理后台页面和退款功能
 */

const express = require('express');
const router = express.Router();
const { requireAuth } = require('../utils/auth');
const { getExchangeRate, formatCurrency, calculateNetAmount, formatNetCurrency } = require('../utils/currency');
const { getTips, getMonthlyTips, getAllAgentNames, getTipById, updateRefundStatus, getFinalRecord, getPendingTips } = require('../services/database');
const { processPayPalRefund } = require('../services/paypal');
const { generateAdminPage } = require('../views/admin-page');
const { generateMonthlyReport } = require('../views/monthly-report');
const { generateExcelExport } = require('../services/excel');

// 管理后台主页
router.get('/', requireAuth, async (req, res) => {
    try {
        let { startDate, endDate, agent, report, currency = 'CNY', page = '1' } = req.query;
        const pageSize = 10;
        const currentPage = Math.max(1, parseInt(page) || 1);

        // 如果没有提供日期，默认展示本月 1 号到本月最后一天
        if (!startDate || !endDate) {
            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth();

            // 本月 1 号
            const start = new Date(year, month, 1);
            // 下月 0 号即为本月最后一天
            const end = new Date(year, month + 1, 0);

            const formatDate = (date) => {
                const y = date.getFullYear();
                const m = String(date.getMonth() + 1).padStart(2, '0');
                const d = String(date.getDate()).padStart(2, '0');
                return `${y}-${m}-${d}`;
            };

            if (!startDate) startDate = formatDate(start);
            if (!endDate) endDate = formatDate(end);
        }

        // 如果请求月度报表
        if (report === 'monthly') {
            const { month, year } = req.query;
            return generateMonthlyReport(res, month, year, currency);
        }

        // 获取汇率（如果显示人民币）
        let exchangeRate = null;
        if (currency === 'CNY') {
            exchangeRate = await getExchangeRate();
        }

        // 获取打赏记录（带分页）
        const { data: tips, error, count: totalCount } = await getTips({
            startDate,
            endDate,
            agent,
            page: currentPage,
            pageSize
        });
        if (error) throw error;

        const totalPages = Math.ceil((totalCount || 0) / pageSize);

        // 获取待支付订单
        const { data: pendingTips, error: pendingError } = await getPendingTips();
        if (pendingError) {
            console.error('⚠️ 获取待支付订单失败:', pendingError);
        }

        // 获取所有客服名称
        const allAgents = await getAllAgentNames();

        // 计算统计数据
        let totalAmount = 0;
        let totalNetAmount = 0;
        let agentStats = {};

        (tips || []).forEach(tip => {
            // 排除已退款的记录
            if (tip.refund_status === 'completed') {
                return;
            }

            const netAmount = calculateNetAmount(tip.amount);
            totalAmount += tip.amount;
            totalNetAmount += netAmount;
            if (!agentStats[tip.agent_name]) {
                agentStats[tip.agent_name] = { count: 0, total: 0, netTotal: 0 };
            }
            agentStats[tip.agent_name].count++;
            agentStats[tip.agent_name].total += tip.amount;
            agentStats[tip.agent_name].netTotal += netAmount;
        });

        const html = generateAdminPage({
            tips,
            pendingTips: pendingTips || [],
            allAgents,
            agentStats,
            totalAmount,
            totalNetAmount,
            startDate,
            endDate,
            agent,
            currency,
            exchangeRate,
            formatCurrency,
            formatNetCurrency,
            currentPage,
            totalPages,
            totalCount: totalCount || 0
        });

        res.send(html);
    } catch (error) {
        console.error('❌ 管理后台错误:', error);
        // 生产环境隐藏详细错误信息
        const isProduction = process.env.NODE_ENV === 'production';
        const errorMessage = isProduction
            ? '服务器内部错误，请稍后重试'
            : `错误信息: ${error.message}`;

        res.status(500).send(`
      <html>
        <body style="font-family: Arial; padding: 50px; text-align: center;">
          <h1>服务器错误</h1>
          <p>${errorMessage}</p>
          <p>请检查服务器日志或联系管理员</p>
          <a href="/" style="color: #667eea;">返回首页</a>
        </body>
      </html>
    `);
    }
});

// 退款处理
router.post('/admin/refund/:tipId', requireAuth, async (req, res) => {
    try {
        const { tipId } = req.params;
        const { reason } = req.body;

        console.log(`🔄 处理退款请求: tipId=${tipId}, reason=${reason}`);

        const numericTipId = parseInt(tipId);
        if (isNaN(numericTipId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid tip ID'
            });
        }

        // 获取原始打赏记录
        const { data: tip, error: fetchError } = await getTipById(numericTipId);

        if (fetchError || !tip) {
            console.error('❌ 打赏记录不存在:', fetchError);
            return res.status(404).json({
                success: false,
                error: '打赏记录不存在'
            });
        }

        console.log('📋 找到打赏记录:', {
            id: tip.id,
            amount: tip.amount,
            agent_name: tip.agent_name,
            payment_id: tip.payment_id,
            current_refund_status: tip.refund_status
        });

        // 检查是否已经退款
        if (tip.refund_status === 'completed') {
            console.log('⚠️ 该记录已经处理过退款');
            return res.status(400).json({
                success: false,
                error: '该记录已经处理过退款'
            });
        }

        if (!tip.payment_id) {
            console.log('⚠️ 该记录没有PayPal支付ID');
            return res.status(400).json({
                success: false,
                error: '该记录没有PayPal支付ID，无法退款'
            });
        }

        console.log(`📋 准备PayPal退款: ${tip.agent_name}, $${tip.amount}, PayPal ID: ${tip.payment_id}`);

        // 调用PayPal退款API
        const refundResult = await processPayPalRefund(tip.payment_id, tip.amount);

        if (refundResult.success) {
            console.log(`✅ PayPal退款成功，退款ID: ${refundResult.refund_id}`);
            console.log(`🔄 开始更新数据库记录 ID: ${numericTipId}`);

            // 更新数据库
            const updateResult = await updateRefundStatus(numericTipId, refundResult.refund_id, reason);

            if (!updateResult.success) {
                return res.json({
                    success: true,
                    message: 'PayPal退款成功，但数据库状态更新失败',
                    refund_id: refundResult.refund_id,
                    warning: '请手动在数据库中更新退款状态',
                    manual_sql: `UPDATE tips SET refund_status = 'completed' WHERE id = ${numericTipId};`
                });
            }

            // 获取最终记录
            const finalResult = await getFinalRecord(numericTipId);

            console.log('📋 最终更新结果:', finalResult);
            console.log(`🎉 退款完成: tipId=${numericTipId}, refundId=${refundResult.refund_id}`);

            res.json({
                success: true,
                message: '退款成功',
                refund_id: refundResult.refund_id,
                updated_record: finalResult
            });

        } else {
            console.error('❌ PayPal退款失败:', refundResult.error);
            res.status(500).json({
                success: false,
                error: `PayPal退款失败: ${refundResult.error}`
            });
        }

    } catch (error) {
        console.error('❌ 退款处理异常:', error);
        res.status(500).json({
            success: false,
            error: `退款处理失败: ${error.message}`
        });
    }
});

// Excel 导出路由
router.get('/export/monthly/:year/:month', requireAuth, async (req, res) => {
    console.log('📊 Excel导出路由被触发');
    console.log('参数:', req.params);
    console.log('查询:', req.query);

    try {
        await generateExcelExport(req, res);
    } catch (error) {
        console.error('❌ Excel导出失败:', error);

        if (!res.headersSent) {
            res.status(500).json({
                error: 'Excel导出失败',
                message: error.message
            });
        }
    }
});

module.exports = router;
