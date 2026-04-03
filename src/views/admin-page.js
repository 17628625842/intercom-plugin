/**
 * 管理后台页面视图 - 集中管理入口
 */
const { adminStyles } = require('./admin/styles');
const { getAdminScripts } = require('./admin/scripts');
const { renderPendingTipsTable, renderTipRow, renderPagination } = require('./admin/helpers');

/**
 * 生成管理后台页面 HTML
 * @param {object} options - 页面数据
 * @returns {string} HTML 字符串
 */
function generateAdminPage(options) {
    const {
        tips,
        pendingTips,
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
        currentPage = 1,
        totalPages = 1,
        totalCount = 0
    } = options;

    // 计算有效打赏次数（排除已退款的）
    const validTipsCount = (tips || []).filter(tip => tip.refund_status !== 'completed').length;

    // 计算平均打赏金额
    const avgTipAmount = validTipsCount > 0 ? totalNetAmount / validTipsCount : 0;

    return `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>客服打赏系统 - 管理后台</title>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="alternate icon" href="/favicon.png" type="image/png">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/themes/dark.css">
        <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
        <script src="https://cdn.jsdelivr.net/npm/flatpickr/dist/l10n/zh.js"></script>
        <style>
            ${adminStyles}
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
                        <i class="fas fa-gift"></i>
                    </div>
                    <div class="logo-text">
                        <h1>客服打赏系统</h1>
                        <p>实时追踪打赏数据</p>
                    </div>
                </div>
                <div class="header-actions">
                    <a href="/?report=monthly&currency=${currency}" class="btn btn-secondary">
                        <i class="fas fa-chart-bar"></i>
                        月度报表
                    </a>
                    <a href="/logout" class="btn btn-secondary">
                        <i class="fas fa-sign-out-alt"></i>
                        退出登录
                    </a>
                </div>
            </header>

            <!-- Header Toolbar: Currency + Filters -->
            <div class="currency-toggle" style="display: flex; align-items: center; gap: 20px; flex-wrap: nowrap; margin-bottom: 30px; position: relative; z-index: 1000; overflow: visible !important;">
                <div style="display: flex; align-items: center; gap: 12px; flex-shrink: 0;">
                    <span class="currency-label" style="display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-coins"></i> 货币
                    </span>
                    <div class="currency-switch">
                        <button class="currency-option ${currency === 'USD' ? 'active' : ''}" onclick="switchCurrency('USD')">USD</button>
                        <button class="currency-option ${currency === 'CNY' ? 'active' : ''}" onclick="switchCurrency('CNY')">CNY</button>
                    </div>
                </div>

                <div class="header-filters" style="display: flex; align-items: center; gap: 12px; flex: 1; overflow: visible !important;">
                    <!-- 日期框单独加大至 380px -->
                    <div class="custom-date-wrapper" style="width: 380px;">
                        <i class="fas fa-calendar-day" style="left: 12px; font-size: 0.85em;"></i>
                        <input type="text" id="dateRange" class="filter-input date-picker-input" 
                            style="width: 100%; height: 38px; padding-left: 36px; font-size: 0.85em; background: rgba(255,255,255,0.03) !important;"
                            value="${startDate && endDate ? `${startDate} 至 ${endDate}` : ''}" 
                            readonly placeholder="选择日期范围">
                        <input type="hidden" id="startDate" value="${startDate || ''}">
                        <input type="hidden" id="endDate" value="${endDate || ''}">
                    </div>

                    <!-- 客服框保持紧凑 200px -->
                    <div class="custom-select-wrapper" id="agentSelectWrapper" style="width: 200px;">
                        <input type="hidden" id="agentSelect" value="${agent || 'all'}">
                        <div class="custom-select-trigger" style="height: 38px; padding: 0 12px; font-size: 0.85em; background: rgba(255,255,255,0.03);">
                            <span>${agent && agent !== 'all' ? agent : '所有客服'}</span>
                            <i class="fas fa-chevron-down"></i>
                        </div>
                        <div class="custom-options" style="top: calc(100% + 5px);">
                            <div class="custom-option ${(!agent || agent === 'all') ? 'selected' : ''}" data-value="all">所有客服</div>
                            ${allAgents.map(agentName =>
        `<div class="custom-option ${agent === agentName ? 'selected' : ''}" data-value="${agentName}">${agentName}</div>`
    ).join('')}
                        </div>
                    </div>

                    <button class="action-btn" onclick="clearFilters()" style="height: 38px; padding: 0 15px; background: rgba(255,255,255,0.05); color: var(--text-secondary); border: 1px solid var(--border); display: flex; align-items: center; gap: 6px;">
                        <i class="fas fa-undo" style="font-size: 0.8em;"></i> 重置
                    </button>
                </div>

                ${currency === 'CNY' && exchangeRate ? `
                <div class="exchange-rate-info" style="margin-left: auto; flex-shrink: 0;">
                    <i class="fas fa-sync-alt"></i> 1 USD = ${exchangeRate.toFixed(4)} CNY
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
                    <div class="stat-label">总到账金额 (已扣退款)</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-icon green">
                            <i class="fas fa-gift"></i>
                        </div>
                    </div>
                    <div class="stat-value">${validTipsCount}</div>
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
                    <div class="stat-value">${formatCurrency(avgTipAmount, currency, exchangeRate)}</div>
                    <div class="stat-label">平均打赏金额</div>
                </div>
            </div>

            <!-- Pending Orders -->
            ${renderPendingTipsTable(pendingTips)}

            <!-- Main Table -->
            <div class="table-section main-table-section">
                <div class="table-header">
                    <h2 class="table-title">打赏记录详情</h2>
                    <span class="table-badge">共 ${totalCount} 条，第 ${currentPage}/${totalPages} 页</span>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>日期时间</th>
                            <th>客服姓名</th>
                            <th>金额 (${currency})</th>
                            <th>客户</th>
                            <th>对话ID</th>
                            <th>状态</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                    ${(tips || []).length > 0 ? (tips || []).map(tip =>
        renderTipRow(tip, { currency, exchangeRate, formatCurrency, formatNetCurrency })
    ).join('') : `
                        <tr>
                            <td colspan="7">
                                <div class="empty-state">
                                    <i class="fas fa-inbox"></i>
                                    <p>暂无符合条件的打赏记录</p>
                                </div>
                            </td>
                        </tr>
                    `}
                    </tbody>
                </table>
                
                <!-- Pagination -->
                ${renderPagination(currentPage, totalPages)}
            </div>
        </div>

        <script>
            ${getAdminScripts({ startDate, endDate, currency })}
        </script>
    </body>
    </html>
    `;
}

module.exports = {
    generateAdminPage
};
