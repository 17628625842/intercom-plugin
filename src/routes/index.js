const express = require("express")
const intercomRoutes = require("./intercom")
const canvasRoutes = require("./canvas")
const tokenRoutes = require("./token")

const router = express.Router()

router.use("/agent", intercomRoutes)
router.use("/canvas/user", canvasRoutes)
router.use("/api", tokenRoutes)

module.exports = router
