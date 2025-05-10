const express = require("express");
const router = express.Router();
const { startChat, sendMessage, getChat } = require("../controllers/chatController");

// Start a new chat
router.post("/start", startChat);

// Send a message in a chat
router.post("/message", sendMessage);

// Get chat history
router.get("/:chatId", getChat);

module.exports = router; 
