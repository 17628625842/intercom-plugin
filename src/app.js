const express = require('express');
const cors = require('cors');
const compression = require('compression');
const routes = require('./routes');

const app = express();

// 中间件配置
app.use(cors());
app.use(compression());
app.use(express.json());

// 请求日志中间件
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// 注册路由
app.use('/', routes);

// 打开 App 接口 - 返回空白页面
app.get('/open/app', (req, res) => {
  res.send('<!DOCTYPE html><html><head><title>Opening App...</title></head><body></body></html>');
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;