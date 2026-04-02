/**
 * Canvas 路由模块
 * 处理 Intercom Canvas 应用请求
 */

const express = require('express');
const router = express.Router();
const { extractConversationId, extractAgentName, sendTipMessageToUser } = require('../utils/intercom');
const { createPayPalPayment } = require('../services/paypal');
const { createOrIgnoreTip } = require('../services/database');
const {
    createUserTipCanvas,
    createPaymentCanvas,
    createCustomAmountCanvas,
    createPayPalCanvas,
    createErrorCanvas,
    createAgentMainCanvas,
    createAgentSetupCanvas,
    createSendSuccessCanvas,
    createSendErrorCanvas
} = require('../views/canvas');
const { createAgentNameSheetHTML } = require('../views/agent-name-sheet');
const { createUserTipSheetHTML } = require('../views/user-tip-sheet');
const { config } = require('../config');

// =========================
// Sheet 页面路由
// =========================

// 客服输入名字的 Sheet 页面（全屏 iframe）
router.get('/sheet/agent-name', (req, res) => {
    res.send(createAgentNameSheetHTML());
});

// 用户端打赏 Sheet 页面（全屏 iframe，自定义样式）
router.get('/sheet/user-tip/:conversationId/:agentName', (req, res) => {
    const { conversationId, agentName } = req.params;
    console.log(`🎨 渲染用户端打赏 Sheet，客服: ${agentName}, 对话: ${conversationId}`);
    res.send(createUserTipSheetHTML(decodeURIComponent(agentName), conversationId));
});

// =========================
// Configure Flow 路由 (客服发送前配置)
// =========================

// Configure Flow - 客服发送卡片前输入自己的名字
router.post('/canvas/user/configure', async (req, res) => {
    try {
        console.log('🔧 Configure Flow 请求:', JSON.stringify(req.body, null, 2));

        const { component_id, input_values, canvas } = req.body;

        // 如果是首次加载配置界面（Sheet 在 Inbox 中不可用，使用简单输入框）
        if (!component_id) {
            res.json({
                canvas: {
                    content: {
                        components: [
                            { type: "input", id: "agent_name", label: "您的英文名", placeholder: "Allen" },
                            { type: "button", label: "发送", style: "link", id: "confirm_send", action: { type: "submit" } }
                        ]
                    }
                }
            });
            return;
        }

        // 处理客服提交的名字
        if (component_id === 'confirm_send') {
            const agentName = input_values?.agent_name?.trim() || 'Support Agent';
            console.log(`✅ Configure Flow - 客服输入名字: ${agentName}`);

            // 返回 results 对象，包含 card_creation_options
            res.json({
                results: {
                    agentName: agentName
                }
            });
            return;
        }

        // 默认配置界面
        res.json({
            canvas: {
                content: {
                    components: [
                        { type: "input", id: "agent_name", label: "您的英文名", placeholder: "Allen" },
                        { type: "button", label: "发送", style: "link", id: "confirm_send", action: { type: "submit" } }
                    ]
                }
            }
        });

    } catch (error) {
        console.error('❌ Configure Flow 错误:', error);
        res.status(500).json({ error: error.message });
    }
});

// Sheet 提交处理 - 接收客服从 Sheet 页面提交的名字
router.post('/canvas/user/submit-sheet', async (req, res) => {
    try {
        console.log('📝 Sheet 提交请求:', JSON.stringify(req.body, null, 2));

        const agentName = req.body.agentName?.trim() || 'Support Agent';
        console.log(`✅ Sheet 提交 - 客服名字: ${agentName}`);

        // 返回 results 给 Intercom
        res.json({
            results: {
                agentName: agentName
            }
        });
    } catch (error) {
        console.error('❌ Sheet 提交错误:', error);
        res.status(500).json({ error: error.message });
    }
});

// =========================
// 用户端 Canvas 路由
// =========================

// Canvas 初始化 - 用户端
router.post('/canvas/user/initialize', async (req, res) => {
    try {
        console.log('🎨 Canvas 用户端初始化请求:', JSON.stringify(req.body, null, 2));

        const conversationId = extractConversationId(req);

        // 优先从 card_creation_options 获取客服名字（Configure Flow 传递的）
        const cardCreationOptions = req.body.card_creation_options || {};
        let agentName = cardCreationOptions.agentName;

        // 如果 Configure Flow 没有传递，尝试从其他来源获取
        if (!agentName || agentName === 'Support Agent') {
            agentName = extractAgentName(req);
        }

        console.log(`🎯 Canvas 用户端 - 对话 ID: ${conversationId}, 客服: ${agentName}`);
        console.log(`🔍 card_creation_options: ${JSON.stringify(cardCreationOptions)}`);

        // 如果客服名字是默认值，显示输入名字的界面（给客服用）
        if (agentName === 'Support Agent') {
            res.json({
                canvas: {
                    content: {
                        components: [
                            { type: "input", id: "agent_name_input", label: "您的英文名 (用户将看到 Thank [您的名字])", placeholder: "Allen" },
                            { type: "button", label: "发送", style: "primary", id: "confirm_agent_name", action: { type: "submit" } }
                        ]
                    },
                    metadata: {
                        conversationId: conversationId,
                        step: "name_input"
                    }
                }
            });
            return;
        }

        // 直接返回用户打赏界面
        res.json({
            canvas: createUserTipCanvas(agentName, conversationId)
        });
    } catch (error) {
        console.error('❌ Canvas 用户端初始化错误:', error);
        res.status(500).json({ error: error.message });
    }
});

// Canvas 用户操作处理
router.post('/canvas/user/submit', async (req, res) => {
    try {
        console.log('🎨 Canvas 用户端提交请求:', JSON.stringify(req.body, null, 2));

        const { component_id, input_values, current_canvas, canvas, context, customer, contact } = req.body;

        // 获取用户信息（用于保存 pending 记录）
        const userEmail = customer?.email || contact?.email || 'Unknown';
        const userName = customer?.name || contact?.name || userEmail;

        // 从 canvas 组件中解析客服名字
        // Intercom 不传递 metadata，所以需要从 "💝 Thank Allen!" 中提取 "Allen"
        let agentName = 'Support Agent';
        const components = current_canvas?.content?.components || [];
        for (const comp of components) {
            if (comp.type === 'text' && comp.text) {
                // 匹配 "💝 Thank Allen!" 或 "Thank Allen!" 格式
                const match = comp.text.match(/Thank\s+(\w+)/i);
                if (match && match[1]) {
                    agentName = match[1];
                    console.log(`✅ 从 canvas 文本中解析客服名字: ${agentName}`);
                    break;
                }
            }
        }

        // 从 context 获取 conversationId
        const conversationId = context?.conversation_id || 'unknown';

        console.log(`🎯 用户操作: ${component_id}, 客服: ${agentName}, 对话: ${conversationId}`);

        let responseCanvas;

        switch (component_id) {
            // 客服确认名字后，显示打赏金额选择界面
            case 'confirm_agent_name':
                const inputAgentName = input_values?.agent_name_input?.trim() || 'Support Agent';
                console.log(`✅ 客服输入名字: ${inputAgentName}`);
                responseCanvas = createUserTipCanvas(inputAgentName, conversationId);
                break;

            case 'tip_1':
            case 'tip_5':
            case 'tip_10':
            case 'tip_20':
                const tipAmount = parseInt(component_id.split('_')[1]);
                console.log(`💰 用户选择金额: ${tipAmount}`);

                try {
                    // 直接创建 PayPal 支付链接，跳过确认步骤
                    const { paymentId, paymentUrl } = await createPayPalPayment(tipAmount, conversationId, agentName);

                    // 保存 pending 记录（用户选择金额时）
                    const tipData = {
                        amount: tipAmount,
                        agent_name: agentName,
                        user_name: userEmail, // 保存用户邮箱
                        conversation_id: conversationId,
                        payment_id: paymentId,
                        status: 'pending',
                        created_at: new Date().toISOString()
                    };
                    createOrIgnoreTip(tipData); // 使用幂等性创建，避免重复记录

                    responseCanvas = createPayPalCanvas(tipAmount, agentName, paymentUrl, conversationId);
                } catch (error) {
                    console.error('❌ PayPal 支付创建失败:', error);
                    responseCanvas = createErrorCanvas(`Payment error: ${error.message}`, agentName, conversationId);
                }
                break;

            case 'tip_custom':
                console.log(`💰 用户进入自定义金额界面`);
                responseCanvas = createCustomAmountCanvas(agentName, conversationId);
                break;

            case 'custom_amount_submit':
                const customAmountRaw = input_values?.custom_amount;
                const customAmount = parseFloat(customAmountRaw);
                console.log(`💰 用户自定义金额: ${customAmountRaw} -> ${customAmount}`);

                // 验证金额
                if (isNaN(customAmount)) {
                    responseCanvas = createErrorCanvas('Please enter a valid number', agentName, conversationId);
                } else if (customAmount < 1 || customAmount > 999) {
                    responseCanvas = createErrorCanvas('Amount must be between $1 and $999', agentName, conversationId);
                } else {
                    try {
                        // 直接创建 PayPal 支付链接
                        const { paymentId: customPaymentId, paymentUrl: customPaymentUrl } = await createPayPalPayment(customAmount, conversationId, agentName);

                        // 保存 pending 记录（用户选择金额时）
                        const customTipData = {
                            amount: customAmount,
                            agent_name: agentName,
                            user_name: userEmail, // 保存用户邮箱
                            conversation_id: conversationId,
                            payment_id: customPaymentId,
                            status: 'pending',
                            created_at: new Date().toISOString()
                        };
                        createOrIgnoreTip(customTipData); // 使用幂等性创建，避免重复记录

                        responseCanvas = createPayPalCanvas(customAmount, agentName, "https://mulebuy.com/my-account/user-center?id=12313&num=10", conversationId);
                    } catch (error) {
                        console.error('❌ PayPal 支付创建失败:', error);
                        responseCanvas = createErrorCanvas(`Payment error: ${error.message}`, agentName, conversationId);
                    }
                }
                break;

            case 'back_to_amounts':
                console.log(`🔙 用户返回金额选择界面`);
                responseCanvas = createUserTipCanvas(agentName, conversationId);
                break;

            default:
                console.log('⚠️ 未知用户操作，返回默认界面');
                responseCanvas = createUserTipCanvas(agentName, conversationId);
                break;
        }

        console.log('📤 返回用户界面响应');
        res.json({ canvas: responseCanvas });

    } catch (error) {
        console.error('❌ Canvas 用户端提交错误:', error);
        res.status(500).json({ error: error.message });
    }
});

// =========================
// 客服端 Canvas 路由
// =========================

// Intercom 插件初始化 - 客服端
router.post('/intercom/initialize', async (req, res) => {
    try {
        console.log('🔧 客服端插件初始化请求:', JSON.stringify(req.body, null, 2));

        const conversation = req.body.conversation || {};
        const conversationId = extractConversationId(req) || conversation.id || 'unknown';
        const agentName = extractAgentName(req);

        console.log(`🔍 客服端 - 对话 ID: ${conversationId}, 客服: ${agentName}`);

        // 始终显示带输入框的主界面
        res.json({ canvas: createAgentMainCanvas(agentName, conversationId) });
    } catch (error) {
        console.error('❌ 客服端插件初始化错误:', error);
        res.status(500).json({ error: error.message });
    }
});

// 处理客服操作
router.post('/intercom/submit', async (req, res) => {
    try {
        console.log('📝 客服端插件提交请求:', JSON.stringify(req.body, null, 2));

        const { component_id, canvas } = req.body;
        const conversationId = extractConversationId(req) || canvas?.metadata?.conversationId || 'unknown';
        let agentName = canvas?.metadata?.agentName || extractAgentName(req);
        const currentView = canvas?.metadata?.currentView || 'main';

        console.log(`🔍 客服操作: ${component_id}, 对话 ID: ${conversationId}, 客服: ${agentName}, 当前视图: ${currentView}`);

        let responseCanvas;

        // 获取输入框中的名字
        const inputAgentName = req.body.input_values?.agent_name_input?.trim();

        switch (component_id) {
            // 新的发送打赏卡片功能（从右侧边栏直接发送）
            case 'send_tip_card':
                const sendAgentName = inputAgentName || agentName || 'Support Agent';
                console.log(`📤 客服点击发送打赏卡片，agentName: ${sendAgentName}, conversationId: ${conversationId}`);

                if (!conversationId || conversationId === 'unknown') {
                    responseCanvas = {
                        content: {
                            components: [
                                { type: "text", text: "❌ 发送失败", style: "header" },
                                { type: "text", text: "无法获取对话 ID，请刷新页面重试", style: "paragraph" },
                                { type: "button", label: "🔄 刷新", style: "primary", id: "retry_initialize", action: { type: "submit" } }
                            ]
                        },
                        metadata: { agentName: sendAgentName, conversationId, currentView: "error" }
                    };
                    break;
                }

                if (!sendAgentName || sendAgentName === 'Support Agent') {
                    responseCanvas = {
                        content: {
                            components: [
                                { type: "text", text: "⚠️ 请输入您的英文名", style: "header" },
                                { type: "input", id: "agent_name_input", label: "您的英文名", placeholder: "Allen" },
                                { type: "button", label: "📤 发送给用户", style: "primary", id: "send_tip_card", action: { type: "submit" } }
                            ]
                        },
                        metadata: { agentName, conversationId, currentView: "main" }
                    };
                    break;
                }

                // 不再使用 sendTipMessageToUser 发送链接消息
                // 而是返回 card_creation_options，让 Intercom 插入 Canvas 卡片到回复区域
                console.log(`📤 返回 card_creation_options，触发卡片插入`);

                // 返回 card_creation_options，Intercom 会将卡片插入到回复区域
                // 然后调用用户端的 initialize URL 来获取卡片内容
                res.json({
                    canvas: {
                        content: {
                            components: [
                                { type: "text", text: "✅ 已发送", style: "header" },
                                { type: "divider" },
                                { type: "text", text: "💝 发送打赏卡片", style: "header" },
                                { type: "input", id: "agent_name_input", label: "您的英文名", placeholder: "请输入您的名字" },
                                { type: "button", label: "发送", style: "primary", id: "send_tip_card", action: { type: "submit" } },
                                { type: "divider" },
                                { type: "button", label: "📊 查看打赏统计", style: "link", id: "view_stats", action: { type: "url", url: config.baseUrl || "http://localhost:3000" } }
                            ]
                        },
                        metadata: { agentName: sendAgentName, conversationId, currentView: "success" }
                    },
                    // 关键：card_creation_options 会触发 Intercom 插入卡片到回复区域
                    card_creation_options: {
                        agentName: sendAgentName,
                        conversationId: conversationId
                    }
                });
                return;

            case 'send_tip_to_user':
                console.log(`📤 客服点击发送打赏链接，agentName: ${agentName}, conversationId: ${conversationId}`);

                if (!conversationId || conversationId === 'unknown') {
                    responseCanvas = {
                        content: {
                            components: [
                                { type: "text", text: "❌ 发送失败", style: "header" },
                                { type: "text", text: "无法获取有效的对话 ID，请刷新插件重试", style: "paragraph" },
                                { type: "spacer", size: "s" },
                                { type: "button", label: "🔄 刷新插件", style: "primary", id: "retry_initialize", action: { type: "submit" } },
                                { type: "button", label: "🔙 返回", style: "secondary", id: "back_to_main", action: { type: "submit" } }
                            ]
                        },
                        metadata: { agentName, conversationId, currentView: "error" }
                    };
                    break;
                }

                try {
                    await sendTipMessageToUser(conversationId, agentName, req);
                    responseCanvas = createSendSuccessCanvas(agentName, conversationId);
                } catch (error) {
                    console.error('❌ 发送失败:', error);
                    responseCanvas = createSendErrorCanvas(error.message, agentName, conversationId);
                }
                break;

            case 'back_to_main':
                console.log('🔙 客服点击返回主界面');
                agentName = extractAgentName(req) || canvas?.metadata?.agentName || 'Support Agent';

                if (agentName !== 'Support Agent') {
                    res.json({ canvas: createAgentMainCanvas(agentName, conversationId) });
                    return;
                } else {
                    responseCanvas = createAgentSetupCanvas(conversationId);
                }
                break;

            case 'retry_initialize':
                console.log('🔄 客服点击重试，重新获取客服名称');
                agentName = extractAgentName(req);
                console.log(`🔍 重新获取的客服名称: ${agentName}`);

                if (agentName !== 'Support Agent') {
                    responseCanvas = createAgentMainCanvas(agentName, conversationId);
                } else {
                    responseCanvas = createAgentSetupCanvas(conversationId);
                }
                break;

            case 'refresh_interface':
                console.log('🔄 客服点击刷新界面');
                agentName = extractAgentName(req);
                console.log(`🔍 刷新后获取的客服名称: ${agentName}`);

                if (agentName !== 'Support Agent') {
                    responseCanvas = createAgentMainCanvas(agentName, conversationId);
                } else {
                    responseCanvas = createAgentSetupCanvas(conversationId);
                }
                break;

            default:
                console.log('⚠️ 未知客服操作，返回主界面');
                agentName = extractAgentName(req) || canvas?.metadata?.agentName || 'Support Agent';

                if (agentName !== 'Support Agent') {
                    responseCanvas = createAgentMainCanvas(agentName, conversationId);
                } else {
                    responseCanvas = {
                        content: {
                            components: [
                                { type: "text", text: `🎁 打赏系统`, style: "header" },
                                { type: "text", text: `对话 ID: ${conversationId}`, style: "paragraph" },
                                { type: "text", text: "请先设置对话标题为您的英文名", style: "muted" },
                                { type: "spacer", size: "s" },
                                { type: "button", label: "刷新", style: "primary", id: "retry_initialize", action: { type: "submit" } }
                            ]
                        },
                        metadata: { conversationId, currentView: "setup" }
                    };
                }
                break;
        }

        console.log('📤 返回客服界面响应');
        res.json({ canvas: responseCanvas });

    } catch (error) {
        console.error('❌ 客服端插件提交错误:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
