import express from 'express';
import { startChat, sendMessage, getChat, getAllChats } from '../controllers/chatController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// All chat routes require authentication
router.use(auth);

router.post('/start', startChat);
router.post('/message', sendMessage);
router.get('/:chatId', getChat);
router.get('/', getAllChats);

export default router; 