const express = require("express")
const intercomRoutes = require("./intercom")
const canvasRoutes = require("./canvas")
const sseRoutes = require("./sse")

const router = express.Router()

router.use("/intercom", intercomRoutes)
router.use("/canvas/user", canvasRoutes)
router.use("/sse", sseRoutes)

module.exports = router
