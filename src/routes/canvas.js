const express = require('express');
const canvasController = require('../controllers/canvasController');

const router = express.Router();

// 用户端初始化 - 显示打赏界面
router.post('/initialize', canvasController.initialize);

// 用户端提交 - 处理打赏按钮点击
router.post('/submit', canvasController.submit);

router.get("/open/app", (req, res) => {
    return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
        </head>
        <body>
        <script>
            window.location.href = 'https://m.mulebuy.com/app/?id=123';
        </script>
        </body>
        </html>
      `)
})

module.exports = router;