/**
 * 月度报表视图
 */

const { getMonthlyTips, getAllAgentNames } = require('../services/database');
const { getExchangeRate, formatCurrency, calculateNetAmount, formatNetCurrency } = require('../utils/currency');

/**
 * 生成月度报表页面
 */
async function generateMonthlyReport(res, month, year, currency) {
    const now = new Date();
    const targetYear = parseInt(year) || now.getFullYear();
    const targetMonth = parseInt(month) || now.getMonth();

    // 获取汇率
    let exchangeRate = null;
    if (currency === 'CNY') {
        exchangeRate = await getExchangeRate();
    }

    // 获取该月数据
    const { data: monthlyTips, error } = await getMonthlyTips(targetYear, targetMonth);

    if (error) {
        return res.status(500).send('数据库查询失败');
    }

    // 计算统计数据（排除已退款的记录）
    const validTips = (monthlyTips || []).filter(tip => tip.refund_status !== 'completed');
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

    // 生成月份选择器
    const months = [];
    for (let i = 0; i < 12; i++) {
        months.push({
            value: i,
            label: new Date(2000, i).toLocaleString('zh-CN', { month: 'long' }),
            selected: i === targetMonth
        });
    }

    const years = [];
    for (let y = now.getFullYear(); y >= 2020; y--) {
        years.push({
            value: y,
            selected: y === targetYear
        });
    }

    // 客服排行榜（按净到账金额排序）
    const sortedAgents = Object.entries(agentStats)
        .sort((a, b) => b[1].netTotal - a[1].netTotal);

    const html = `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>月度报表 - ${targetYear}年${targetMonth + 1}月</title>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="alternate icon" href="/favicon.png" type="image/png">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
        <style>
            :root {
                --primary: #ec4899;
                --primary-dark: #db2777;
                --primary-light: #f472b6;
                --primary-glow: rgba(236, 72, 153, 0.3);
                --success: #10b981;
                --warning: #f59e0b;
                --danger: #ef4444;
                --dark: #0a0a0a;
                --dark-secondary: #141414;
                --dark-tertiary: #1f1f1f;
                --text-primary: #fafafa;
                --text-secondary: #a3a3a3;
                --text-muted: #737373;
                --border: rgba(255, 255, 255, 0.08);
                --card-bg: rgba(20, 20, 20, 0.9);
            }

            * { margin: 0; padding: 0; box-sizing: border-box; }
            
            body { 
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                background: var(--dark);
                color: var(--text-primary);
                min-height: 100vh;
                overflow-x: hidden;
            }

            /* Animated gradient background */
            .bg-gradient {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: 
                    radial-gradient(ellipse at 0% 0%, rgba(236, 72, 153, 0.12) 0%, transparent 50%),
                    radial-gradient(ellipse at 100% 100%, rgba(244, 114, 182, 0.08) 0%, transparent 50%),
                    radial-gradient(ellipse at 50% 50%, rgba(236, 72, 153, 0.03) 0%, transparent 50%);
                animation: gradientPulse 20s ease-in-out infinite;
                z-index: 0;
            }

            @keyframes gradientPulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
            }

            /* Grid pattern overlay */
            .grid-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-image: 
                    linear-gradient(rgba(236, 72, 153, 0.03) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(236, 72, 153, 0.03) 1px, transparent 1px);
                background-size: 60px 60px;
                z-index: 1;
                pointer-events: none;
            }

            .container { 
                max-width: 1200px; 
                margin: 0 auto; 
                padding: 28px;
                position: relative;
                z-index: 2;
            }
            
            .header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 32px;
                padding: 16px 0;
            }

            .logo {
                display: flex;
                align-items: center;
                gap: 16px;
            }

            .logo-icon {
                width: 52px;
                height: 52px;
                background: linear-gradient(135deg, var(--primary), var(--primary-light));
                border-radius: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                box-shadow: 0 8px 32px var(--primary-glow);
                position: relative;
            }

            .logo-icon::after {
                content: '';
                position: absolute;
                inset: -2px;
                border-radius: 18px;
                background: linear-gradient(135deg, var(--primary), var(--primary-light));
                z-index: -1;
                opacity: 0.5;
                filter: blur(10px);
            }

            .logo-text h1 {
                font-size: 1.5em;
                font-weight: 700;
                background: linear-gradient(135deg, #fff, var(--primary-light));
                -webkit-background-clip: text;
                background-clip: text;
                -webkit-text-fill-color: transparent;
            }

            .logo-text p {
                font-size: 0.9em;
                color: var(--text-muted);
                margin-top: 2px;
            }

            .header-actions {
                display: flex;
                gap: 12px;
            }

            .btn {
                padding: 11px 22px;
                border-radius: 12px;
                font-weight: 500;
                font-size: 0.9em;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                display: flex;
                align-items: center;
                gap: 8px;
                border: none;
                font-family: inherit;
                text-decoration: none;
            }

            .btn-secondary {
                background: var(--dark-tertiary);
                color: var(--text-primary);
                border: 1px solid var(--border);
            }

            .btn-secondary:hover {
                background: rgba(255, 255, 255, 0.08);
                border-color: var(--primary);
                transform: translateY(-2px);
            }

            .btn-primary {
                background: linear-gradient(135deg, var(--primary), var(--primary-dark));
                color: white;
                box-shadow: 0 4px 20px var(--primary-glow);
            }

            .btn-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 30px rgba(236, 72, 153, 0.4);
            }

            /* Controls Section */
            .controls-section {
                background: var(--card-bg);
                backdrop-filter: blur(20px);
                border-radius: 20px;
                padding: 24px;
                margin-bottom: 28px;
                border: 1px solid var(--border);
                display: flex;
                align-items: center;
                gap: 24px;
                flex-wrap: wrap;
            }

            .control-group {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .control-label {
                color: var(--text-secondary);
                font-weight: 500;
                font-size: 0.9em;
            }

            .control-label i {
                color: var(--primary);
                margin-right: 6px;
            }

            .select-input {
                padding: 10px 16px;
                background: var(--dark);
                border: 1px solid var(--border);
                border-radius: 10px;
                color: var(--text-primary);
                font-size: 0.95em;
                font-family: inherit;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .select-input:focus {
                outline: none;
                border-color: var(--primary);
                box-shadow: 0 0 0 4px rgba(236, 72, 153, 0.1);
            }

            .currency-switch {
                display: flex;
                background: var(--dark);
                border-radius: 10px;
                padding: 4px;
                gap: 4px;
            }

            .currency-option {
                padding: 10px 20px;
                border-radius: 8px;
                border: none;
                background: transparent;
                color: var(--text-muted);
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 0.9em;
                font-family: inherit;
            }

            .currency-option.active {
                background: linear-gradient(135deg, var(--primary), var(--primary-dark));
                color: white;
                box-shadow: 0 4px 16px var(--primary-glow);
            }

            .currency-option:hover:not(.active) {
                color: var(--text-primary);
            }

            .exchange-rate-info {
                color: var(--text-muted);
                font-size: 0.85em;
                margin-left: auto;
                display: flex;
                align-items: center;
                gap: 6px;
            }

            .exchange-rate-info i {
                color: var(--primary-light);
            }

            /* Stats Grid */
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 20px;
                margin-bottom: 28px;
            }

            .stat-card {
                background: var(--card-bg);
                backdrop-filter: blur(20px);
                border-radius: 20px;
                padding: 26px;
                border: 1px solid var(--border);
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                position: relative;
                overflow: hidden;
            }

            .stat-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 3px;
                background: linear-gradient(90deg, var(--primary), var(--primary-light));
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            .stat-card:hover {
                transform: translateY(-6px);
                box-shadow: 
                    0 20px 40px rgba(0, 0, 0, 0.4),
                    0 0 60px var(--primary-glow);
                border-color: rgba(236, 72, 153, 0.3);
            }

            .stat-card:hover::before {
                opacity: 1;
            }

            .stat-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 18px;
            }

            .stat-icon {
                width: 50px;
                height: 50px;
                border-radius: 14px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 22px;
            }

            .stat-icon.pink { background: rgba(236, 72, 153, 0.15); color: var(--primary); }
            .stat-icon.green { background: rgba(16, 185, 129, 0.15); color: var(--success); }
            .stat-icon.purple { background: rgba(168, 85, 247, 0.15); color: #a855f7; }
            .stat-icon.blue { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }

            .stat-value {
                font-size: 2.2em;
                font-weight: 800;
                margin-bottom: 6px;
                background: linear-gradient(135deg, #fff, #e5e5e5);
                -webkit-background-clip: text;
                background-clip: text;
                -webkit-text-fill-color: transparent;
            }

            .stat-label {
                color: var(--text-muted);
                font-size: 0.95em;
                font-weight: 500;
            }

            /* Leaderboard */
            .leaderboard {
                background: var(--card-bg);
                backdrop-filter: blur(20px);
                border-radius: 20px;
                border: 1px solid var(--border);
                overflow: hidden;
            }

            .leaderboard-header {
                padding: 22px 26px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid var(--border);
                background: rgba(236, 72, 153, 0.03);
            }

            .leaderboard-title {
                font-size: 1.25em;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .leaderboard-title i {
                color: var(--warning);
            }

            .leaderboard-item {
                display: flex;
                align-items: center;
                padding: 18px 26px;
                border-bottom: 1px solid var(--border);
                transition: all 0.2s ease;
            }

            .leaderboard-item:hover {
                background: rgba(236, 72, 153, 0.03);
            }

            .rank {
                width: 48px;
                height: 48px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 14px;
                font-weight: 700;
                font-size: 1.2em;
                margin-right: 18px;
            }

            .rank-1 { 
                background: linear-gradient(135deg, #ffd700, #ffb700); 
                color: #1a1a1a;
                box-shadow: 0 4px 16px rgba(255, 215, 0, 0.3);
            }
            .rank-2 { 
                background: linear-gradient(135deg, #e0e0e0, #b0b0b0); 
                color: #1a1a1a;
                box-shadow: 0 4px 16px rgba(192, 192, 192, 0.3);
            }
            .rank-3 { 
                background: linear-gradient(135deg, #cd7f32, #b8860b); 
                color: white;
                box-shadow: 0 4px 16px rgba(205, 127, 50, 0.3);
            }
            .rank-other { 
                background: var(--dark-tertiary); 
                color: var(--text-muted);
            }

            .agent-info {
                flex: 1;
            }

            .agent-name {
                font-weight: 600;
                font-size: 1.05em;
                color: var(--text-primary);
                margin-bottom: 4px;
            }

            .agent-count {
                font-size: 0.85em;
                color: var(--text-muted);
            }

            .agent-amount {
                text-align: right;
            }

            .agent-net {
                font-size: 1.3em;
                font-weight: 700;
                color: var(--success);
                margin-bottom: 4px;
            }

            .agent-gross {
                font-size: 0.8em;
                color: var(--text-muted);
            }

            .empty {
                text-align: center;
                padding: 60px 40px;
                color: var(--text-muted);
            }

            .empty i {
                font-size: 4em;
                margin-bottom: 20px;
                color: var(--dark-tertiary);
            }

            /* Responsive */
            @media (max-width: 1200px) {
                .stats-grid { grid-template-columns: repeat(2, 1fr); }
            }

            @media (max-width: 768px) {
                .header { flex-direction: column; gap: 20px; text-align: center; }
                .header-actions { justify-content: center; flex-wrap: wrap; }
                .stats-grid { grid-template-columns: 1fr; }
                .controls-section { 
                    flex-direction: column; 
                    gap: 16px;
                    align-items: stretch;
                }
                .control-group { justify-content: center; }
                .exchange-rate-info { margin-left: 0; justify-content: center; }
                .container { padding: 16px; }
            }

            /* Animation */
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(24px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .stat-card { animation: fadeInUp 0.6s ease-out backwards; }
            .stat-card:nth-child(1) { animation-delay: 0.1s; }
            .stat-card:nth-child(2) { animation-delay: 0.15s; }
            .stat-card:nth-child(3) { animation-delay: 0.2s; }
            .stat-card:nth-child(4) { animation-delay: 0.25s; }
            .controls-section { animation: fadeInUp 0.6s ease-out 0.05s backwards; }
            .leaderboard { animation: fadeInUp 0.6s ease-out 0.35s backwards; }
        </style>
    </head>
    <body>
        <div class="bg-gradient"></div>
        <div class="grid-overlay"></div>
        
        <div class="container">
            <!-- Header -->
            <header class="header">
                <div class="logo">
                    <div class="logo-icon">
                        <i class="fas fa-chart-bar"></i>
                    </div>
                    <div class="logo-text">
                        <h1>月度报表</h1>
                        <p>${targetYear}年${targetMonth + 1}月数据统计</p>
                    </div>
                </div>
                <div class="header-actions">
                    <a href="/?currency=${currency}" class="btn btn-secondary">
                        <i class="fas fa-arrow-left"></i>
                        返回主页
                    </a>
                    <a href="/export/monthly/${targetYear}/${targetMonth + 1}?currency=${currency}" class="btn btn-primary">
                        <i class="fas fa-file-excel"></i>
                        导出Excel
                    </a>
                </div>
            </header>

            <!-- Controls -->
            <div class="controls-section">
                <div class="control-group">
                    <span class="control-label">
                        <i class="fas fa-calendar"></i>
                        选择月份
                    </span>
                    <select id="yearSelect" class="select-input" onchange="updateReport()">
                        ${years.map(y => `<option value="${y.value}" ${y.selected ? 'selected' : ''}>${y.value}年</option>`).join('')}
                    </select>
                    <select id="monthSelect" class="select-input" onchange="updateReport()">
                        ${months.map(m => `<option value="${m.value}" ${m.selected ? 'selected' : ''}>${m.label}</option>`).join('')}
                    </select>
                </div>

                <div class="control-group">
                    <span class="control-label">
                        <i class="fas fa-coins"></i>
                        货币
                    </span>
                    <div class="currency-switch">
                        <button class="currency-option ${currency === 'USD' ? 'active' : ''}" onclick="switchCurrency('USD')">
                            <i class="fas fa-dollar-sign"></i> USD
                        </button>
                        <button class="currency-option ${currency === 'CNY' ? 'active' : ''}" onclick="switchCurrency('CNY')">
                            <i class="fas fa-yen-sign"></i> CNY
                        </button>
                    </div>
                </div>

                ${currency === 'CNY' && exchangeRate ? `
                <div class="exchange-rate-info">
                    <i class="fas fa-exchange-alt"></i>
                    汇率: 1 USD = ${exchangeRate.toFixed(4)} CNY
                </div>
                ` : ''}
            </div>

            <!-- Stats Grid -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-icon pink">
                            <i class="fas fa-dollar-sign"></i>
                        </div>
                    </div>
                    <div class="stat-value">${formatCurrency(totalNetAmount, currency, exchangeRate)}</div>
                    <div class="stat-label">本月净收入</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-icon green">
                            <i class="fas fa-gift"></i>
                        </div>
                    </div>
                    <div class="stat-value">${validTips.length}</div>
                    <div class="stat-label">有效打赏次数</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-icon purple">
                            <i class="fas fa-users"></i>
                        </div>
                    </div>
                    <div class="stat-value">${Object.keys(agentStats).length}</div>
                    <div class="stat-label">活跃客服</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-icon blue">
                            <i class="fas fa-chart-line"></i>
                        </div>
                    </div>
                    <div class="stat-value">${validTips.length > 0 ? formatCurrency(totalNetAmount / validTips.length, currency, exchangeRate) : formatCurrency(0, currency, exchangeRate)}</div>
                    <div class="stat-label">平均打赏金额</div>
                </div>
            </div>

            <!-- Leaderboard -->
            <div class="leaderboard">
                <div class="leaderboard-header">
                    <h2 class="leaderboard-title">
                        <i class="fas fa-trophy"></i>
                        客服排行榜
                    </h2>
                </div>
                
                ${sortedAgents.length > 0 ? sortedAgents.map(([name, stats], index) => `
                    <div class="leaderboard-item">
                        <div class="rank ${index < 3 ? 'rank-' + (index + 1) : 'rank-other'}">
                            ${index < 3 ? ['🥇', '🥈', '🥉'][index] : index + 1}
                        </div>
                        <div class="agent-info">
                            <div class="agent-name">${name}</div>
                            <div class="agent-count">${stats.count} 次打赏</div>
                        </div>
                        <div class="agent-amount">
                            <div class="agent-net">${formatCurrency(stats.netTotal, currency, exchangeRate)}</div>
                            <div class="agent-gross">净收入</div>
                        </div>
                    </div>
                `).join('') : `
                    <div class="empty">
                        <i class="fas fa-inbox"></i>
                        <p>本月暂无打赏记录</p>
                    </div>
                `}
            </div>
        </div>
        
        <script>
            function updateReport() {
                const year = document.getElementById('yearSelect').value;
                const month = document.getElementById('monthSelect').value;
                const currency = '${currency}';
                window.location.href = '/?report=monthly&year=' + year + '&month=' + month + '&currency=' + currency;
            }
            
            function switchCurrency(newCurrency) {
                const urlParams = new URLSearchParams(window.location.search);
                urlParams.set('currency', newCurrency);
                window.location.href = '/?' + urlParams.toString();
            }
        </script>
    </body>
    </html>
  `;

    res.send(html);
}

module.exports = {
    generateMonthlyReport
};
