const express = require("express")
const intercomRoutes = require("./intercom")
const canvasRoutes = require("./canvas")

const router = express.Router()

router.use("/intercom", intercomRoutes)
router.use("/canvas/user", canvasRoutes)
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

module.exports = router
