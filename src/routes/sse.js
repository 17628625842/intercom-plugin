const express = require('express');
const sseController = require('../controllers/sseController');

const router = express.Router();

// SSE 连接入口
router.get('/connect', sseController.connect);

module.exports = router;
