/**
 * 数据库服务模块
 * 处理 Supabase 数据库操作
 */

const { supabase } = require('../config');

/**
 * 获取打赏记录（默认只获取已完成的）
 * @param {object} filters - 筛选条件
 * @returns {Promise<{data: Array, error: Error|null, count: number}>}
 */
async function getTips(filters = {}) {
    // 先获取总数
    let countQuery = supabase
        .from('tips')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

    if (filters.startDate) {
        countQuery = countQuery.gte('created_at', filters.startDate);
    }
    if (filters.endDate) {
        const endDateTime = new Date(filters.endDate);
        endDateTime.setHours(23, 59, 59, 999);
        countQuery = countQuery.lte('created_at', endDateTime.toISOString());
    }
    if (filters.agent && filters.agent !== 'all') {
        countQuery = countQuery.eq('agent_name', filters.agent);
    }

    const { count } = await countQuery;

    // 再获取数据
    let query = supabase
        .from('tips')
        .select('*')
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

    if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
    }

    if (filters.endDate) {
        const endDateTime = new Date(filters.endDate);
        endDateTime.setHours(23, 59, 59, 999);
        query = query.lte('created_at', endDateTime.toISOString());
    }

    if (filters.agent && filters.agent !== 'all') {
        query = query.eq('agent_name', filters.agent);
    }

    // 分页
    if (filters.page && filters.pageSize) {
        const offset = (filters.page - 1) * filters.pageSize;
        query = query.range(offset, offset + filters.pageSize - 1);
    }

    const result = await query;
    return { ...result, count };
}

/**
 * 获取月度打赏记录（只获取已完成的）
 * @param {number} year - 年份
 * @param {number} month - 月份（0-11）
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
async function getMonthlyTips(year, month) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0, 23, 59, 59);

    return await supabase
        .from('tips')
        .select('*')
        .eq('status', 'completed')  // 只获取已完成的记录
        .gte('created_at', firstDay.toISOString())
        .lte('created_at', lastDay.toISOString())
        .order('created_at', { ascending: false });
}

/**
 * 获取所有客服名称
 * @returns {Promise<Array<string>>}
 */
async function getAllAgentNames() {
    const { data: allTips } = await supabase
        .from('tips')
        .select('agent_name')
        .order('agent_name');

    return [...new Set(allTips?.map(tip => tip.agent_name) || [])];
}

/**
 * 通过 ID 获取单条打赏记录
 * @param {number} tipId - 打赏记录 ID
 * @returns {Promise<{data: object, error: Error|null}>}
 */
async function getTipById(tipId) {
    return await supabase
        .from('tips')
        .select('*')
        .eq('id', tipId)
        .single();
}

/**
 * 通过支付 ID 获取记录
 * @param {string} paymentId - PayPal 支付 ID
 * @returns {Promise<{data: object|null, error: Error|null}>}
 */
async function getTipByPaymentId(paymentId) {
    return await supabase
        .from('tips')
        .select('id, status')
        .eq('payment_id', paymentId)
        .single();
}

/**
 * 创建打赏记录
 * @param {object} tipData - 打赏数据
 * @returns {Promise<{data: object, error: Error|null}>}
 */
async function createTip(tipData) {
    return await supabase.from('tips').insert(tipData).select();
}

/**
 * 创建打赏记录（如果已存在则忽略）
 * 使用 upsert 实现幂等性，避免重复记录
 * @param {object} tipData - 打赏数据（必须包含 payment_id）
 * @returns {Promise<{data: object, error: Error|null, isNew: boolean}>}
 */
async function createOrIgnoreTip(tipData) {
    if (!tipData.payment_id) {
        return { data: null, error: new Error('payment_id is required'), isNew: false };
    }

    // 先检查是否已存在
    const { data: existing } = await supabase
        .from('tips')
        .select('id, status')
        .eq('payment_id', tipData.payment_id)
        .single();

    if (existing) {
        console.log(`📝 Pending 记录已存在: ${tipData.payment_id}, 状态: ${existing.status}`);
        return { data: existing, error: null, isNew: false };
    }

    // 不存在则创建
    const { data, error } = await supabase
        .from('tips')
        .insert(tipData)
        .select();

    if (error) {
        // 如果是 duplicate key 错误，说明在检查和插入之间有其他请求已经创建了
        if (error.code === '23505') {
            console.log(`⚠️ 并发创建检测到，记录已存在: ${tipData.payment_id}`);
            const { data: concurrentData } = await supabase
                .from('tips')
                .select('id, status')
                .eq('payment_id', tipData.payment_id)
                .single();
            return { data: concurrentData, error: null, isNew: false };
        }
        return { data: null, error, isNew: false };
    }

    console.log(`✅ 新 Pending 记录已创建: ${tipData.payment_id}`);
    return { data: data?.[0], error: null, isNew: true };
}

/**
 * 通过 payment_id 更新打赏记录状态为 completed
 * @param {string} paymentId - PayPal 支付 ID
 * @param {string} userEmail - 用户邮箱
 * @returns {Promise<{data: object, error: Error|null}>}
 */
async function updateTipToCompleted(paymentId, userEmail) {
    return await supabase
        .from('tips')
        .update({
            status: 'completed',
            user_name: userEmail
        })
        .eq('payment_id', paymentId)
        .eq('status', 'pending')
        .select();
}

/**
 * 获取待支付的打赏记录（只获取24小时内的）
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
async function getPendingTips() {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    return await supabase
        .from('tips')
        .select('*')
        .eq('status', 'pending')
        .gte('created_at', oneDayAgo) // 只获取24小时内的
        .order('created_at', { ascending: false });
}

/**
 * 将超时的 pending 记录标记为 expired（可选，超过24小时）
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
async function expireOldPendingTips() {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    return await supabase
        .from('tips')
        .update({ status: 'expired' })
        .eq('status', 'pending')
        .lt('created_at', oneDayAgo)
        .select();
}

/**
 * 更新打赏记录的退款状态
 * @param {number} tipId - 打赏记录 ID
 * @param {string} refundId - 退款 ID
 * @param {string} reason - 退款原因
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
async function updateRefundStatus(tipId, refundId, reason = '管理员申请退款') {
    const currentTime = new Date().toISOString();

    // 先只更新 refund_status
    const { error: basicError } = await supabase
        .from('tips')
        .update({ refund_status: 'completed' })
        .eq('id', tipId);

    if (basicError) {
        console.error('❌ 基础状态更新失败:', basicError);
        return { success: false, error: basicError.message };
    }

    console.log('✅ 基础状态更新成功');

    // 尝试更新其他字段
    const optionalUpdates = [
        { field: 'refund_date', value: currentTime },
        { field: 'refund_reason', value: reason },
        { field: 'refund_id', value: refundId }
    ];

    for (const update of optionalUpdates) {
        try {
            const { error: fieldError } = await supabase
                .from('tips')
                .update({ [update.field]: update.value })
                .eq('id', tipId);

            if (fieldError) {
                console.warn(`⚠️ 字段 ${update.field} 更新失败 (可能不存在):`, fieldError.message);
            } else {
                console.log(`✅ 字段 ${update.field} 更新成功`);
            }
        } catch (fieldError) {
            console.warn(`⚠️ 字段 ${update.field} 更新异常:`, fieldError.message);
        }
    }

    return { success: true, error: null };
}

/**
 * 获取最终更新的记录
 * @param {number} tipId - 打赏记录 ID
 * @returns {Promise<object>}
 */
async function getFinalRecord(tipId) {
    const { data } = await supabase
        .from('tips')
        .select('*')
        .eq('id', tipId)
        .single();

    return data;
}

/**
 * 测试数据库连接
 * @returns {Promise<boolean>}
 */
async function testConnection() {
    try {
        const { data, error } = await supabase.from('tips').select('*').limit(1);
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('❌ 数据库连接失败:', error.message);
        return false;
    }
}

module.exports = {
    getTips,
    getMonthlyTips,
    getAllAgentNames,
    getTipById,
    getTipByPaymentId,
    createTip,
    createOrIgnoreTip,
    updateTipToCompleted,
    getPendingTips,
    expireOldPendingTips,
    updateRefundStatus,
    getFinalRecord,
    testConnection
};
