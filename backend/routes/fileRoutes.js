import express from 'express';
import { uploadFile, getFile, deleteFile, getChatFiles } from '../controllers/fileController.js';
import { upload, handleMulterError } from '../middleware/fileUpload.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// All file routes require authentication
router.use(auth);

// Upload a file
router.post('/upload', upload.single('file'), handleMulterError, uploadFile);

// Get a file by ID
router.get('/:fileId', getFile);

// Delete a file
router.delete('/:fileId', deleteFile);

// Get all files for a chat
router.get('/chat/:chatId', getChatFiles);

export default router; 