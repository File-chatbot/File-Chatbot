import express from 'express';
import { startChat, sendMessage, getChat, getAllChats } from '../controllers/chatController.js';
import auth from '../middleware/auth.js';
import { upload, handleMulterError } from '../middleware/fileUpload.js';

const router = express.Router();

// All chat routes require authentication
router.use(auth);

// Start a new chat
router.post('/start', startChat);

// Send a message (with optional file)
router.post('/message', upload.single('file'), handleMulterError, sendMessage);

// Get chat by ID
router.get('/:chatId', getChat);

// Get all chats
router.get('/', getAllChats);

export default router; 