/**
 * Excel 导出服务
 * 生成月度打赏报表
 */

const { getMonthlyTips } = require('./database');
const { getExchangeRate, calculateNetAmount } = require('../utils/currency');

/**
 * 生成 Excel 导出
 */
async function generateExcelExport(req, res) {
    let ExcelJS;

    try {
        ExcelJS = require('exceljs');
        console.log('✅ ExcelJS 加载成功');
    } catch (error) {
        console.error('❌ ExcelJS 加载失败:', error);
        return res.status(500).json({
            error: 'Excel导出功能不可用',
            message: 'ExcelJS库未安装，请运行: npm install exceljs'
        });
    }

    try {
        const { year, month } = req.params;
        const { currency = 'USD' } = req.query;

        console.log(`📊 开始生成 ${year}年${month}月 的Excel报表`);

        const targetYear = parseInt(year);
        const targetMonth = parseInt(month) - 1; // 月份从0开始

        // 获取该月数据（只获取 completed 状态的记录）
        const { data: tips, error } = await getMonthlyTips(targetYear, targetMonth);

        if (error) {
            console.error('❌ 数据库查询失败:', error);
            return res.status(500).json({ error: '数据库查询失败' });
        }

        // 记录数限制（防止内存溢出）
        const MAX_EXPORT_RECORDS = 5000;
        let exportTips = tips || [];
        let isLimited = false;

        if (exportTips.length > MAX_EXPORT_RECORDS) {
            console.warn(`⚠️ 记录数 ${exportTips.length} 超过限制 ${MAX_EXPORT_RECORDS}，只导出前 ${MAX_EXPORT_RECORDS} 条`);
            exportTips = exportTips.slice(0, MAX_EXPORT_RECORDS);
            isLimited = true;
        }

        console.log(`📊 获取到 ${(tips || []).length} 条记录，导出 ${exportTips.length} 条`);

        // 获取汇率
        let exchangeRate = 1;
        if (currency === 'CNY') {
            exchangeRate = await getExchangeRate();
        }

        // 创建工作簿
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Tip System';
        workbook.created = new Date();

        // 汇总表
        const summarySheet = workbook.addWorksheet('月度汇总');

        // 设置汇总表样式
        summarySheet.columns = [
            { header: '统计项目', key: 'item', width: 25 },
            { header: '数值', key: 'value', width: 20 },
        ];

        // 计算统计数据（排除已退款的记录）
        const validTips = exportTips.filter(tip => tip.refund_status !== 'completed');
        const refundedTips = exportTips.filter(tip => tip.refund_status === 'completed');

        let totalAmount = 0;
        let totalNetAmount = 0;
        let agentStats = {};

        validTips.forEach(tip => {
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

        // 格式化金额显示
        const formatAmount = (amount) => {
            if (currency === 'CNY') {
                return `¥${(amount * exchangeRate).toFixed(2)}`;
            }
            return `$${amount.toFixed(2)}`;
        };

        // 添加汇总数据
        summarySheet.addRow({ item: '报表月份', value: `${targetYear}年${targetMonth + 1}月` });
        summarySheet.addRow({ item: '货币单位', value: currency });
        if (currency === 'CNY') {
            summarySheet.addRow({ item: '汇率 (USD→CNY)', value: exchangeRate.toFixed(4) });
        }
        summarySheet.addRow({ item: '', value: '' });
        summarySheet.addRow({ item: '总打赏次数', value: validTips.length });
        summarySheet.addRow({ item: '退款次数', value: refundedTips.length });
        summarySheet.addRow({ item: '总打赏金额（毛）', value: formatAmount(totalAmount) });
        summarySheet.addRow({ item: '总到账金额（净）', value: formatAmount(totalNetAmount) });
        summarySheet.addRow({ item: 'PayPal手续费总计', value: formatAmount(totalAmount - totalNetAmount) });
        summarySheet.addRow({ item: '活跃客服人数', value: Object.keys(agentStats).length });
        summarySheet.addRow({ item: '平均打赏金额', value: validTips.length > 0 ? formatAmount(totalNetAmount / validTips.length) : formatAmount(0) });
        if (isLimited) {
            summarySheet.addRow({ item: '', value: '' });
            summarySheet.addRow({ item: '⚠️ 注意', value: `数据已被限制，仅包含前 ${MAX_EXPORT_RECORDS} 条记录` });
        }

        // 设置汇总表样式
        summarySheet.getRow(1).font = { bold: true };
        summarySheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF667eea' }
        };
        summarySheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

        // 客服排行榜
        const leaderboardSheet = workbook.addWorksheet('客服排行榜');
        leaderboardSheet.columns = [
            { header: '排名', key: 'rank', width: 10 },
            { header: '客服姓名', key: 'name', width: 20 },
            { header: '打赏次数', key: 'count', width: 15 },
            { header: '毛收入', key: 'gross', width: 15 },
            { header: '净收入', key: 'net', width: 15 },
            { header: '手续费', key: 'fee', width: 15 },
        ];

        // 按净收入排序
        const sortedAgents = Object.entries(agentStats)
            .sort((a, b) => b[1].netTotal - a[1].netTotal);

        sortedAgents.forEach(([name, stats], index) => {
            leaderboardSheet.addRow({
                rank: index + 1,
                name: name,
                count: stats.count,
                gross: formatAmount(stats.total),
                net: formatAmount(stats.netTotal),
                fee: formatAmount(stats.total - stats.netTotal)
            });
        });

        // 设置排行榜表样式
        leaderboardSheet.getRow(1).font = { bold: true };
        leaderboardSheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF667eea' }
        };
        leaderboardSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

        // 详细记录表
        const detailSheet = workbook.addWorksheet('打赏明细');
        detailSheet.columns = [
            { header: '时间', key: 'date', width: 20 },
            { header: '客服', key: 'agent', width: 15 },
            { header: '用户', key: 'user', width: 25 },
            { header: '金额(USD)', key: 'amount_usd', width: 12 },
            { header: '净收入(USD)', key: 'net_usd', width: 12 },
            { header: `金额(${currency})`, key: 'amount_display', width: 15 },
            { header: `净收入(${currency})`, key: 'net_display', width: 15 },
            { header: '状态', key: 'status', width: 12 },
            { header: '对话ID', key: 'conversation', width: 20 },
            { header: 'PayPal ID', key: 'payment', width: 25 },
        ];

        // 添加所有记录（已限制数量）
        exportTips.forEach(tip => {
            const netAmount = calculateNetAmount(tip.amount);
            detailSheet.addRow({
                date: new Date(tip.created_at).toLocaleString('zh-CN'),
                agent: tip.agent_name,
                user: tip.user_name || '匿名',
                amount_usd: tip.amount.toFixed(2),
                net_usd: netAmount.toFixed(2),
                amount_display: formatAmount(tip.amount),
                net_display: formatAmount(netAmount),
                status: tip.refund_status === 'completed' ? '已退款' : '有效',
                conversation: tip.conversation_id || 'N/A',
                payment: tip.payment_id || 'N/A'
            });
        });

        // 设置详细记录表样式
        detailSheet.getRow(1).font = { bold: true };
        detailSheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF667eea' }
        };
        detailSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

        // 为退款记录添加背景色
        detailSheet.eachRow((row, rowNumber) => {
            if (rowNumber > 1) {
                const statusCell = row.getCell('status');
                if (statusCell.value === '已退款') {
                    row.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFFEF2F2' }
                    };
                    statusCell.font = { color: { argb: 'FFEF4444' } };
                }
            }
        });

        // 生成文件名
        const fileName = `打赏报表_${targetYear}年${targetMonth + 1}月_${currency}.xlsx`;

        // 设置响应头
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`);

        // 写入响应
        await workbook.xlsx.write(res);

        console.log(`✅ Excel报表生成成功: ${fileName}`);

    } catch (error) {
        console.error('❌ Excel生成失败:', error);

        if (!res.headersSent) {
            res.status(500).json({
                error: 'Excel生成失败',
                message: error.message
            });
        }
    }
}

module.exports = {
    generateExcelExport
};
