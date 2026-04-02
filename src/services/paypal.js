/**
 * PayPal 服务模块
 * 处理 PayPal 支付和退款
 */

const paypal = require('paypal-rest-sdk');
const { config } = require('../config');

/**
 * 配置 PayPal SDK
 */
function configurePayPal() {
    paypal.configure({
        mode: config.paypal.mode,
        client_id: config.paypal.clientId,
        client_secret: config.paypal.clientSecret
    });
}

/**
 * 创建 PayPal 支付
 * @param {number} amount - 金额
 * @param {string} conversationId - 对话 ID
 * @param {string} agentName - 客服名称
 * @returns {Promise<string>} PayPal 支付 URL
 */
async function createPayPalPayment(amount, conversationId, agentName) {
    console.log('🔧 开始创建 PayPal 支付...');

    const baseUrl = config.baseUrl.startsWith('http')
        ? config.baseUrl
        : `https://${config.baseUrl}`;

    configurePayPal();

    return new Promise((resolve, reject) => {
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            reject(new Error(`Invalid amount: ${amount}`));
            return;
        }

        const formattedAmount = numericAmount.toFixed(2);

        const payment = {
            intent: 'sale',
            payer: { payment_method: 'paypal' },
            redirect_urls: {
                return_url: `${baseUrl}/payment/success?conversation=${encodeURIComponent(conversationId)}&agent=${encodeURIComponent(agentName)}&amount=${formattedAmount}`,
                cancel_url: `${baseUrl}/payment/cancel`
            },
            transactions: [{
                amount: { currency: 'USD', total: formattedAmount },
                description: `Tip for ${agentName} (Conversation: ${conversationId})`,
                item_list: {
                    items: [{
                        name: `Tip for ${agentName}`,
                        sku: 'tip',
                        price: formattedAmount,
                        currency: 'USD',
                        quantity: 1
                    }]
                }
            }]
        };

        console.log('💰 PayPal 支付请求 - 对话ID:', conversationId);
        console.log('💰 PayPal return_url:', payment.redirect_urls.return_url);

        paypal.payment.create(payment, (error, paymentResponse) => {
            if (error) {
                console.error('❌ PayPal 创建支付失败:', error);
                reject(new Error('PayPal payment creation failed'));
            } else {
                const approvalUrl = paymentResponse.links.find(link => link.rel === 'approval_url');
                if (approvalUrl) {
                    // 返回 payment_id 和 URL
                    resolve({
                        paymentId: paymentResponse.id,
                        paymentUrl: approvalUrl.href
                    });
                } else {
                    reject(new Error('No approval URL found in PayPal response'));
                }
            }
        });
    });
}

/**
 * 执行 PayPal 支付
 * @param {string} paymentId - PayPal 支付 ID
 * @param {string} payerId - 付款人 ID
 * @param {number} amount - 金额
 * @returns {Promise<object>} 支付结果
 */
function executePayPalPayment(paymentId, payerId, amount) {
    return new Promise((resolve, reject) => {
        configurePayPal();

        const execute_payment_json = {
            payer_id: payerId,
            transactions: [{
                amount: { currency: 'USD', total: parseFloat(amount).toFixed(2) }
            }]
        };

        paypal.payment.execute(paymentId, execute_payment_json, (error, payment) => {
            if (error) {
                console.error('❌ PayPal 执行支付失败:', error.response ? error.response.details : error);
                reject(error);
            } else {
                console.log(`✅ PayPal 支付执行成功: ${payment.id}`);
                resolve(payment);
            }
        });
    });
}

/**
 * 处理 PayPal 退款
 * @param {string} paymentId - 支付 ID
 * @param {number} amount - 退款金额
 * @returns {Promise<object>} 退款结果
 */
async function processPayPalRefund(paymentId, amount) {
    return new Promise((resolve, reject) => {
        console.log('🔧 PayPal退款调试信息:');
        console.log('- Client ID:', config.paypal.clientId ? '已设置' : '未设置');
        console.log('- Client Secret:', config.paypal.clientSecret ? '已设置' : '未设置');
        console.log('- Payment ID:', paymentId);
        console.log('- Amount:', amount);
        console.log('- Mode: live');

        configurePayPal();

        // 添加输入验证
        if (!paymentId || !amount) {
            resolve({
                success: false,
                error: 'PayPal payment ID 或金额不能为空'
            });
            return;
        }

        // 验证PayPal凭据
        if (!config.paypal.clientId || !config.paypal.clientSecret) {
            resolve({
                success: false,
                error: 'PayPal API 凭据未正确配置'
            });
            return;
        }

        console.log(`🔄 开始获取支付详情: ${paymentId}`);

        // 首先获取支付详情
        paypal.payment.get(paymentId, (error, payment) => {
            if (error) {
                console.error('❌ 获取PayPal支付详情失败:', JSON.stringify(error, null, 2));
                resolve({
                    success: false,
                    error: `获取支付详情失败: ${error.message || '未知错误'}`
                });
                return;
            }

            console.log('✅ 获取PayPal支付详情成功');
            console.log('📋 支付详情:', JSON.stringify(payment, null, 2));

            // 检查支付状态
            if (payment.state !== 'approved') {
                console.log('⚠️ 支付状态不正确:', payment.state);
                resolve({
                    success: false,
                    error: `支付状态不正确 (${payment.state})，无法退款`
                });
                return;
            }

            try {
                // 获取交易信息
                const transactions = payment.transactions;
                if (!transactions || transactions.length === 0) {
                    throw new Error('支付中没有找到交易记录');
                }

                const transaction = transactions[0];
                console.log('📊 交易信息:', JSON.stringify(transaction, null, 2));

                if (!transaction.related_resources || transaction.related_resources.length === 0) {
                    throw new Error('交易中没有找到相关资源');
                }

                const relatedResource = transaction.related_resources[0];
                console.log('🔗 相关资源:', JSON.stringify(relatedResource, null, 2));

                if (!relatedResource.sale) {
                    // 如果没有sale，检查是否有authorization
                    if (relatedResource.authorization) {
                        resolve({
                            success: false,
                            error: '这是一个预授权支付，无法直接退款。请联系PayPal支持。'
                        });
                    } else {
                        resolve({
                            success: false,
                            error: '找不到可退款的销售记录'
                        });
                    }
                    return;
                }

                const saleId = relatedResource.sale.id;
                const saleState = relatedResource.sale.state;

                console.log(`🔍 Sale ID: ${saleId}`);
                console.log(`📊 Sale State: ${saleState}`);

                if (saleState !== 'completed') {
                    resolve({
                        success: false,
                        error: `销售状态不正确 (${saleState})，无法退款`
                    });
                    return;
                }

                // 创建退款
                const refundData = {
                    amount: {
                        currency: 'USD',
                        total: parseFloat(amount).toFixed(2)
                    },
                    reason: 'Refund'
                };

                console.log('💰 发起PayPal退款请求:', JSON.stringify(refundData, null, 2));

                paypal.sale.refund(saleId, refundData, (refundError, refund) => {
                    if (refundError) {
                        console.error('❌ PayPal退款失败:', JSON.stringify(refundError, null, 2));

                        let errorMessage = 'PayPal退款失败';

                        if (refundError.response) {
                            const errorResponse = refundError.response;
                            console.log('📋 错误响应详情:', JSON.stringify(errorResponse, null, 2));

                            if (errorResponse.name) {
                                switch (errorResponse.name) {
                                    case 'TRANSACTION_ALREADY_REFUNDED':
                                        errorMessage = '该交易已经被退款';
                                        break;
                                    case 'INSUFFICIENT_FUNDS':
                                        errorMessage = '商户账户余额不足';
                                        break;
                                    case 'TRANSACTION_REFUSED':
                                        errorMessage = '退款被拒绝';
                                        break;
                                    case 'INVALID_REQUEST':
                                        errorMessage = `无效请求: ${errorResponse.message || '请检查退款金额和支付状态'}`;
                                        break;
                                    default:
                                        errorMessage = errorResponse.message || errorResponse.name || '未知错误';
                                }
                            }
                        }

                        resolve({
                            success: false,
                            error: errorMessage
                        });
                    } else {
                        console.log('✅ PayPal退款成功!');
                        console.log('📋 退款详情:', JSON.stringify(refund, null, 2));

                        resolve({
                            success: true,
                            refund_id: refund.id,
                            status: refund.state,
                            amount: refund.amount.total
                        });
                    }
                });

            } catch (parseError) {
                console.error('❌ 解析支付信息失败:', parseError);
                resolve({
                    success: false,
                    error: `解析支付信息失败: ${parseError.message}`
                });
            }
        });
    });
}

module.exports = {
    createPayPalPayment,
    executePayPalPayment,
    processPayPalRefund
};
