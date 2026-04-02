/**
 * 管理后台 HTML 辅助组件
 */

const avatarColors = [
    'linear-gradient(135deg, #ec4899, #f472b6)',
    'linear-gradient(135deg, #10b981, #34d399)',
    'linear-gradient(135deg, #8b5cf6, #a78bfa)',
    'linear-gradient(135deg, #f59e0b, #fbbf24)',
    'linear-gradient(135deg, #3b82f6, #60a5fa)'
];

function getAvatarColor(name) {
    const colorIndex = (name || 'A').charCodeAt(0) % avatarColors.length;
    return avatarColors[colorIndex];
}

/**
 * 渲染待处理打赏表格
 */
function renderPendingTipsTable(pendingTips) {
    if (!pendingTips || pendingTips.length === 0) return '';

    return `
    <div class="table-section pending-table-section" style="margin-bottom: 2rem;">
        <div class="table-header">
            <h2 class="table-title" style="color: #f59e0b;">
                <i class="fas fa-clock" style="margin-right: 0.5rem;"></i>未完成支付
                <span style="font-size: 0.75rem; font-weight: 400; color: var(--text-muted); margin-left: 0.5rem;">（用户点击了金额但未付款，24小时后自动清除）</span>
            </h2>
            <span class="table-badge" style="background: linear-gradient(135deg, #f59e0b, #fbbf24);">${pendingTips.length} 条</span>
        </div>
        <table>
            <thead>
                <tr>
                    <th>时间</th>
                    <th>客户</th>
                    <th>客服</th>
                    <th>金额</th>
                    <th>对话</th>
                </tr>
            </thead>
            <tbody>
            ${pendingTips.map(tip => {
        const createdTime = new Date(tip.created_at);
        const now = new Date();
        const diffMinutes = Math.floor((now - createdTime) / (1000 * 60));
        const timeAgo = diffMinutes < 60
            ? diffMinutes + ' 分钟前'
            : Math.floor(diffMinutes / 60) + ' 小时前';

        return `
                <tr style="background: rgba(245, 158, 11, 0.05);">
                    <td>
                        <div style="font-size: 0.85rem;">${createdTime.toLocaleString('zh-CN', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Shanghai'
        })}</div>
                        <div style="font-size: 0.7rem; color: #f59e0b;">${timeAgo}</div>
                    </td>
                    <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        ${tip.user_name || 'Unknown'}
                    </td>
                    <td>
                        <div class="agent-cell">
                            <div class="agent-avatar" style="background: ${getAvatarColor(tip.agent_name)}; width: 28px; height: 28px; font-size: 0.75rem;">
                                ${tip.agent_name.charAt(0).toUpperCase()}
                            </div>
                            <span style="font-size: 0.85rem;">${tip.agent_name}</span>
                        </div>
                    </td>
                    <td style="color: #f59e0b; font-weight: 600;">$${tip.amount.toFixed(2)}</td>
                    <td>
                        <span class="conversation-id" style="font-size: 0.75rem;">${tip.conversation_id || '-'}</span>
                    </td>
                </tr>`;
    }).join('')}
            </tbody>
        </table>
    </div>
    `;
}

/**
 * 渲染打赏记录行
 */
function renderTipRow(tip, options) {
    const { currency, exchangeRate, formatCurrency, formatNetCurrency } = options;
    const isRefunded = tip.refund_status === 'completed';

    return `
    <tr>
        <td>${new Date(tip.created_at).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Shanghai'
    })}</td>
        <td>
            <div class="agent-cell">
                <div class="agent-avatar" style="background: ${getAvatarColor(tip.agent_name)};">
                    ${tip.agent_name.charAt(0).toUpperCase()}
                </div>
                <div class="agent-info">
                    <span class="agent-name">${tip.agent_name}</span>
                </div>
            </div>
        </td>
        <td class="${isRefunded ? 'amount-refunded' : 'amount-cell'}">
            ${isRefunded
            ? `${formatCurrency(tip.amount, currency, exchangeRate)} <small style="color: var(--danger);">(已退款)</small>`
            : formatNetCurrency(tip.amount, currency, exchangeRate)
        }
        </td>
        <td>${tip.user_name || '匿名用户'}</td>
        <td><span class="conv-id" title="${tip.conversation_id || 'N/A'}">${tip.conversation_id || 'N/A'}</span></td>
        <td>
            <span class="status-badge ${isRefunded ? 'refunded' : 'completed'}">
                <i class="fas ${isRefunded ? 'fa-times-circle' : 'fa-check-circle'}"></i>
                ${isRefunded ? '已退款' : '已完成'}
            </span>
            ${isRefunded && tip.refund_reason ? `
                <div class="refund-reason" onclick="showRefundReason('${tip.refund_reason.replace(/'/g, "\\'")}')">
                    <i class="fas fa-comment-dots"></i>
                    ${tip.refund_reason.length > 12 ? tip.refund_reason.substring(0, 12) + '...' : tip.refund_reason}
                </div>
            ` : ''}
            ${isRefunded && tip.refund_date ? `
                <div class="refund-info">
                    退款: ${new Date(tip.refund_date).toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' })}
                </div>
            ` : ''}
        </td>
        <td>
            ${!isRefunded && tip.payment_id ? `
                <button onclick="handleRefund('${tip.id}', '${tip.agent_name}', ${tip.amount})" class="action-btn">
                    <i class="fas fa-undo"></i> 退款
                </button>
            ` : isRefunded ? `
                <span class="processed-label">已处理</span>
            ` : `
                <span class="no-payment">无支付ID</span>
            `}
        </td>
    </tr>
    `;
}

/**
 * 渲染分页器
 */
function renderPagination(currentPage, totalPages) {
    if (totalPages <= 1) return '';

    return `
    <div class="pagination" style="display: flex; justify-content: center; align-items: center; gap: 0.5rem; margin-top: 1.5rem; padding: 1rem;">
        <button onclick="goToPage(1)" ${currentPage === 1 ? 'disabled' : ''} 
            style="padding: 0.5rem 1rem; border: 1px solid var(--border); background: var(--glass); color: var(--text-primary); border-radius: 0.5rem; cursor: ${currentPage === 1 ? 'not-allowed' : 'pointer'}; opacity: ${currentPage === 1 ? '0.5' : '1'};">
            <i class="fas fa-angle-double-left"></i>
        </button>
        <button onclick="goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''} 
            style="padding: 0.5rem 1rem; border: 1px solid var(--border); background: var(--glass); color: var(--text-primary); border-radius: 0.5rem; cursor: ${currentPage === 1 ? 'not-allowed' : 'pointer'}; opacity: ${currentPage === 1 ? '0.5' : '1'};">
            <i class="fas fa-angle-left"></i>
        </button>
        
        <span style="padding: 0.5rem 1rem; color: var(--text-secondary);">
            第 <strong style="color: var(--primary);">${currentPage}</strong> / ${totalPages} 页
        </span>
        
        <button onclick="goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''} 
            style="padding: 0.5rem 1rem; border: 1px solid var(--border); background: var(--glass); color: var(--text-primary); border-radius: 0.5rem; cursor: ${currentPage === totalPages ? 'not-allowed' : 'pointer'}; opacity: ${currentPage === totalPages ? '0.5' : '1'};">
            <i class="fas fa-angle-right"></i>
        </button>
        <button onclick="goToPage(${totalPages})" ${currentPage === totalPages ? 'disabled' : ''} 
            style="padding: 0.5rem 1rem; border: 1px solid var(--border); background: var(--glass); color: var(--text-primary); border-radius: 0.5rem; cursor: ${currentPage === totalPages ? 'not-allowed' : 'pointer'}; opacity: ${currentPage === totalPages ? '0.5' : '1'};">
            <i class="fas fa-angle-double-right"></i>
        </button>
    </div>
    `;
}

module.exports = {
    renderPendingTipsTable,
    renderTipRow,
    renderPagination
};
