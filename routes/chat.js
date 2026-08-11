const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn } = require("../middleware");
const chatController = require("../controllers/chats");

router.get("/chat", isLoggedIn, wrapAsync(chatController.renderInbox));
router.get("/chat/history/:contactId", isLoggedIn, wrapAsync(chatController.getHistory));

module.exports = router;
