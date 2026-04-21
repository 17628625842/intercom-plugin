const express = require('express');
const reviewController = require('../controllers/reviewController');

const router = express.Router();

// 客服端初始化 - 显示评价主界面
router.post('/agent/initialize', reviewController.agentInitialize);

// 客服端提交 - 处理发送评价按钮点击
router.post('/agent/submit', reviewController.agentSubmit);

// 用户端初始化 - 显示评价界面
router.post('/user/initialize', reviewController.userInitialize);

// 用户端空白页 - 前端判断设备并跳转商店
router.get('/user/open-store', reviewController.userOpenStorePage);

// 评价重定向 - 根据设备跳转到不同的商店
router.post('/user/submit', reviewController.userRedirect);

module.exports = router;
