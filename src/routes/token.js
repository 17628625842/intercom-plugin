const express = require("express");
const tokenController = require("../controllers/tokenController");

const router = express.Router();

router.post("/token", tokenController.saveToken);
router.get("/ticket/:ticketId", tokenController.getTokenByTicket);

module.exports = router;
