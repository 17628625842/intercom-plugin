const express = require('express');
const canvasController = require('../controllers/canvasController');

const router = express.Router();

// 用户端初始化 - 显示打赏界面
router.post('/initialize', canvasController.initialize);

// 用户端提交 - 处理打赏按钮点击
router.post('/submit', canvasController.submit);


module.exports = router;