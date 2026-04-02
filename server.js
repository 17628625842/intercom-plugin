const express = require("express")

const app = express()
const PORT = process.env.PORT || 3000

// 中间件：解析 JSON 格式的请求体
app.use(express.json())

// ==================== GET 请求示例 ====================
// 基础 GET 接口：返回欢迎信息
app.get("/", (req, res) => {
    res.json({
        message: "Welcome to my Node.js service on Render!",
        timestamp: new Date().toISOString(),
        status: "running",
    })
})


function createPayPalCanvas() {
    return {
        content: {
            components: [
                { type: "text", text: "✨ Thank you for your generosity!", style: "muted" },
                {
                    type: "button",
                    label: `Pay  with PayPal`,
                    style: "primary",
                    id: "paypal_redirect",
                    action: { type: "url", url: "https://mulebuy.com/my-account/user-center?id=12313&num=10" },
                },
                { type: "button", label: "← Back", style: "secondary", id: "back_to_amounts", action: { type: "submit" } },
            ],
        },
    }
}

app.post("/canvas/user/initialize", (req, res) => {
    const responseCanvas = createPayPalCanvas()
    res.json({ canvas: responseCanvas })
})

app.post("/canvas/user/submit", (req, res) => {
    const responseCanvas = createPayPalCanvas()
    res.json({ canvas: responseCanvas })
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
    console.log(`Health check: http://localhost:${PORT}/health`)
    console.log(`GET /api/users: http://localhost:${PORT}/api/users`)
    console.log(`POST /api/users: http://localhost:${PORT}/api/users`)
})
