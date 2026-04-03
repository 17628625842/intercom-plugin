const express = require('express');
const intercomRoutes = require('./intercom');
const canvasRoutes = require('./canvas');

const router = express.Router();

router.use('/intercom', intercomRoutes);
router.use('/canvas/user', canvasRoutes);

module.exports = router;