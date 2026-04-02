/**
 * 支付路由模块
 * 处理 PayPal 支付相关请求
 */

const express = require('express');
const router = express.Router();
const { supabase } = require('../config');
const { createPayPalPayment, executePayPalPayment } = require('../services/paypal');
const { getTipByPaymentId, createTip, createOrIgnoreTip, updateTipToCompleted } = require('../services/database');
const { createPaymentResultPage } = require('../views/payment-result');
const { createTipPage } = require('../views/tip-page');
const { sendPaymentSuccessMessage } = require('../utils/intercom');
const { sendPaymentNotification } = require('../utils/feishu');

// 打赏页面路由
router.get('/tip/:conversationId/:agentName', async (req, res) => {
    const { conversationId, agentName } = req.params;
    const decodedAgentName = decodeURIComponent(agentName);

    console.log(`🎁 用户访问打赏页面，对话: ${conversationId}, 客服: ${decodedAgentName}`);

    res.send(createTipPage(decodedAgentName, conversationId));
});

// 创建支付
router.post('/create-payment', async (req, res) => {
    try {
        const { amount, conversationId, agentName } = req.body;
        console.log(`💳 创建支付请求: 金额=${amount}, 对话=${conversationId}, 客服=${agentName}`);

        // 金额验证
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount)) {
            console.warn('⚠️ 无效金额:', amount);
            return res.status(400).json({
                success: false,
                error: 'Invalid amount: must be a number'
            });
        }
        if (parsedAmount < 1 || parsedAmount > 999) {
            console.warn('⚠️ 金额超出范围:', parsedAmount);
            return res.status(400).json({
                success: false,
                error: 'Amount must be between $1 and $999'
            });
        }

        // 创建 PayPal 支付，获取 payment_id 和 URL
        const { paymentId, paymentUrl } = await createPayPalPayment(parsedAmount, conversationId, agentName);

        console.log(`💳 PayPal 支付已创建: paymentId=${paymentId}`);

        // 保存 pending 状态的记录到数据库
        const tipData = {
            amount: parseFloat(amount),
            agent_name: agentName,
            user_name: 'Pending...', // 支付完成后会更新为实际邮箱
            conversation_id: conversationId,
            payment_id: paymentId,
            status: 'pending',
            created_at: new Date().toISOString()
        };

        // 使用幂等性创建，避免与 Canvas 路由产生重复记录
        const { data, error: dbError, isNew } = await createOrIgnoreTip(tipData);

        if (dbError) {
            console.error('⚠️ 保存 pending 记录失败:', dbError);
            // 不影响支付流程，继续返回支付链接
        } else if (isNew) {
            console.log('✅ Pending 记录已创建:', data);
        } else {
            console.log('ℹ️ Pending 记录已存在，跳过创建');
        }

        res.json({
            success: true,
            paymentUrl: paymentUrl,
            paymentId: paymentId,
            amount: amount,
            agentName: agentName
        });
    } catch (error) {
        console.error('❌ 创建支付失败:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 支付成功回调 (幂等版本 - 优化顺序)
router.get('/payment/success', async (req, res) => {
    const { paymentId, PayerID, conversation, agent, amount } = req.query;
    console.log(`✅ 支付成功回调:`, { paymentId, PayerID, conversation, agent, amount });

    if (!paymentId || !PayerID) {
        return res.send(createPaymentResultPage(false, 'Invalid payment parameters'));
    }

    const decodedAgent = agent ? decodeURIComponent(agent) : 'Support Agent';

    try {
        // 1. 先检查数据库状态（避免不必要的 PayPal API 调用）
        const { data: existingTip, error: checkError } = await getTipByPaymentId(paymentId);

        // PGRST116 错误码意味着没有找到行（记录不存在）
        const recordNotFound = checkError && checkError.code === 'PGRST116';

        // 其他数据库错误
        if (checkError && !recordNotFound) {
            console.error('❌ 数据库检查失败:', checkError);
            throw new Error('处理支付前数据库检查失败。');
        }

        // 2. 如果记录已完成，直接返回成功页面（不调用 PayPal API）
        if (existingTip && existingTip.status === 'completed') {
            console.log(`⚠️ 重复的支付成功回调，paymentId: ${paymentId} 已完成。跳过 PayPal 验证。`);
            return res.send(createPaymentResultPage(true, `Thank you! Your $${amount} tip for ${decodedAgent} has been sent successfully!`));
        }

        // 3. 需要处理的情况才调用 PayPal API
        const payment = await executePayPalPayment(paymentId, PayerID, amount);
        const userEmail = payment.payer.payer_info.email || 'Anonymous';
        console.log(`✅ PayPal 支付执行成功: ${payment.id}, 用户: ${userEmail}`);

        let dbSuccess = false;

        try {
            if (existingTip && existingTip.status === 'pending') {
                // 情况 A: 记录存在且为 pending - 更新为 completed
                console.log(`📝 发现 pending 记录，更新为 completed: ${paymentId}`);
                const { data, error: updateError } = await updateTipToCompleted(paymentId, userEmail);

                if (updateError) {
                    console.error('❌ 更新记录失败:', updateError);
                } else {
                    console.log('✅ 记录已更新为 completed:', data);
                    dbSuccess = true;
                }
            }
            // 情况 3: 记录已存在但状态既不是 completed 也不是 pending - 强制更新
            else if (existingTip) {
                console.log(`📝 发现状态为 ${existingTip.status} 的记录，强制更新为 completed: ${paymentId}`);
                // 直接使用 update 而不检查状态
                const { data, error: forceUpdateError } = await supabase
                    .from('tips')
                    .update({
                        status: 'completed',
                        user_name: userEmail
                    })
                    .eq('payment_id', paymentId)
                    .select();

                if (forceUpdateError) {
                    console.error('❌ 强制更新记录失败:', forceUpdateError);
                } else {
                    console.log('✅ 记录已强制更新为 completed:', data);
                    dbSuccess = true;
                }
            }
            // 情况 4: 记录完全不存在 - 创建新记录（兼容旧流程）
            else {
                console.log(`📝 未找到记录，创建新的 completed 记录: ${paymentId}`);
                const tipData = {
                    amount: parseFloat(amount),
                    agent_name: decodedAgent,
                    user_name: userEmail,
                    conversation_id: conversation,
                    payment_id: paymentId,
                    status: 'completed',
                    created_at: new Date().toISOString()
                };

                const { data, error: dbError } = await createTip(tipData);

                if (dbError) {
                    console.error('❌ 数据库创建失败:', dbError);
                    // 如果是 duplicate key 错误，说明在我们检查和插入之间，另一个请求已经创建了记录
                    // 这种情况下，尝试更新为 completed
                    if (dbError.code === '23505') {
                        console.log('📝 检测到并发插入，尝试更新现有记录...');
                        const { data: retryData, error: retryError } = await supabase
                            .from('tips')
                            .update({
                                status: 'completed',
                                user_name: userEmail
                            })
                            .eq('payment_id', paymentId)
                            .select();

                        if (retryError) {
                            console.error('❌ 重试更新失败:', retryError);
                        } else {
                            console.log('✅ 重试更新成功:', retryData);
                            dbSuccess = true;
                        }
                    }
                } else {
                    console.log('✅ 数据库创建成功:', data);
                    dbSuccess = true;
                }
            }

            // 发送支付成功消息给用户（异步，不等待结果，优先级高）
            sendPaymentSuccessMessage(conversation, decodedAgent, amount)
                .then(() => console.log('✅ Intercom 支付成功消息已发送'))
                .catch(err => console.error('⚠️ 发送 Intercom 消息失败:', err));

            // 发送飞书群通知（异步，不等待结果）
            sendPaymentNotification(decodedAgent, amount, userEmail, conversation)
                .catch(err => console.error('⚠️ 发送飞书通知失败:', err));

            if (dbSuccess) {
                res.send(createPaymentResultPage(true, `Thank you! Your $${amount} tip for ${decodedAgent} has been sent successfully!`));
            } else {
                res.send(createPaymentResultPage(true, `Your $${amount} tip was paid successfully, but saving the record failed. Please contact support.`));
            }
        } catch (dbError) {
            console.error('❌ 数据库操作异常:', dbError);
            res.send(createPaymentResultPage(true, `Your $${amount} tip was paid successfully, but saving the record failed. Please contact support.`));
        }
    } catch (error) {
        console.error('❌ 处理支付成功回调时发生错误:', error);
        res.send(createPaymentResultPage(false, error.message || 'An unexpected error occurred. Please contact support.'));
    }
});

// 支付取消
router.get('/payment/cancel', (req, res) => {
    console.log('❌ 支付被取消');
    res.send(createPaymentResultPage(false, 'Payment was cancelled'));
});

module.exports = router;
