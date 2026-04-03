const express = require('express');
const intercomController = require('../controllers/intercomController');

const router = express.Router();

// 客服端初始化 - 显示主界面
router.post('/initialize', intercomController.initialize);

// 客服端提交 - 处理按钮点击
router.post('/submit', intercomController.submit);

module.exports = router;