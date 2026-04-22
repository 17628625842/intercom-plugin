const express = require("express")
const intercomRoutes = require("./intercom")
const canvasRoutes = require("./canvas")
const reviewRoutes = require("./review")
const tokenRoutes = require("./token")

const router = express.Router()

router.use("/intercom", intercomRoutes)
router.use("/canvas/user", canvasRoutes)
router.use("/review", reviewRoutes)
router.use("/api", tokenRoutes)

module.exports = router
