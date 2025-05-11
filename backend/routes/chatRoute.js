import express from 'express';
import { 
    startChat, 
    sendMessage, 
    getChat, 
    getAllChats,
    getChatStats 
} from '../controllers/chatController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Start a new chat
router.post("/start", startChat);

// Send a message in a chat
router.post("/message", sendMessage);

// Get all chats for the user
router.get("/", getAllChats);

// Get chat statistics
router.get("/stats", getChatStats);

// Get a specific chat
router.get("/:chatId", getChat);

export default router; 
