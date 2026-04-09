const WebSocket = require('ws');
const crypto = require('crypto');
const { logWithPrefix } = require('../utils/helpers');

// 存储所有的 WebSocket 连接
// 格式: { userId: socket }
const connections = new Map();

const SOCKET_SECRET = process.env.SOCKET_SECRET || 'Scwc9Y5o8ln0Yai6';

let wss = null;

/**
 * 初始化 WebSocket 服务
 * @param {Server} server - HTTP Server 实例
 */
const init = (server) => {
    wss = new WebSocket.Server({ server, path: '/ws' });

    wss.on('connection', (ws, req) => {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const userId = url.searchParams.get('userId');
        const signature = url.searchParams.get('signature');

        if (!userId) {
            logWithPrefix('❌', 'WebSocket 连接失败: Missing userId');
            ws.close(4001, 'Missing userId');
            return;
        }

        // 验证签名
        if (!verifySignature(userId, signature)) {
            logWithPrefix('❌', `WebSocket 签名验证失败: ${userId}`);
            ws.close(4002, 'Invalid signature');
            return;
        }

        // 存储连接
        connections.set(String(userId), ws);
        logWithPrefix('🔌', `WebSocket 已连接: ${userId}`);

        // 发送欢迎消息
        ws.send(JSON.stringify({ type: 'connected', userId }));

        ws.on('message', (message) => {
            logWithPrefix('📥', `收到来自 ${userId} 的消息:`, message.toString());
        });

        ws.on('close', () => {
            connections.delete(String(userId));
            logWithPrefix('🔌', `WebSocket 已断开: ${userId}`);
        });

        ws.on('error', (err) => {
            logWithPrefix('❌', `WebSocket 错误 (${userId}):`, err.message);
            connections.delete(String(userId));
        });
    });

    logWithPrefix('🚀', 'WebSocket 服务已启动 (path: /ws)');
};

const verifySignature = (id, signature) => {
    if (!signature) return false;
    const idStr = String(id);
    const expectedSignature = crypto.createHmac('sha256', SOCKET_SECRET).update(idStr).digest('hex');
    return signature === expectedSignature;
};

const sendMessage = (userId, data) => {
    const idStr = String(userId);
    const ws = connections.get(idStr);

    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data));
        logWithPrefix('📤', `已通过 WebSocket 发送消息到用户 ${idStr}`, data);
        return true;
    }

    logWithPrefix('⚠️', `未找到活跃的 WebSocket 连接: ${idStr}`);
    return false;
};

module.exports = {
    init,
    sendMessage,
    SOCKET_SECRET
};
