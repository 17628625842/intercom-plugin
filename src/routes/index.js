const express = require("express")
const intercomRoutes = require("./intercom")
const canvasRoutes = require("./canvas")
const reviewRoutes = require("./review")

const router = express.Router()

router.use("/intercom", intercomRoutes)
router.use("/canvas/user", canvasRoutes)
router.use("/review", reviewRoutes)

module.exports = router
