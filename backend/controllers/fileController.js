import FileModel from '../models/FileModel.js';
import fs from 'fs';
import path from 'path';

// Upload a file
const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: "No file uploaded"
            });
        }

        const { chatId } = req.body;
        if (!chatId) {
            // Clean up the uploaded file
            fs.unlinkSync(req.file.path);
            return res.status(400).json({
                error: "Chat ID is required"
            });
        }

        const file = await FileModel.create({
            originalName: req.file.originalname,
            fileName: req.file.filename,
            mimeType: req.file.mimetype,
            size: req.file.size,
            path: req.file.path,
            user: req.user._id,
            chat: chatId
        });

        res.status(201).json({
            _id: file._id,
            originalName: file.originalName,
            mimeType: file.mimeType,
            size: file.size,
            createdAt: file.createdAt
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        // Clean up the uploaded file if there was an error
        if (req.file && req.file.path) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (cleanupError) {
                console.error('Error cleaning up file:', cleanupError);
            }
        }
        res.status(500).json({
            error: "Failed to upload file",
            message: error.message
        });
    }
};

// Get file by ID
const getFile = async (req, res) => {
    try {
        const file = await FileModel.findOne({
            _id: req.params.fileId,
            user: req.user._id
        });

        if (!file) {
            return res.status(404).json({
                error: "File not found or unauthorized"
            });
        }

        // Check if file exists on disk
        if (!fs.existsSync(file.path)) {
            return res.status(404).json({
                error: "File not found on server"
            });
        }

        res.download(file.path, file.originalName);
    } catch (error) {
        console.error('Error getting file:', error);
        res.status(500).json({
            error: "Failed to get file",
            message: error.message
        });
    }
};

// Delete file
const deleteFile = async (req, res) => {
    try {
        const file = await FileModel.findOne({
            _id: req.params.fileId,
            user: req.user._id
        });

        if (!file) {
            return res.status(404).json({
                error: "File not found or unauthorized"
            });
        }

        // Delete file from disk
        if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }

        // Delete file record from database
        await file.deleteOne();

        res.status(200).json({
            message: "File deleted successfully"
        });
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({
            error: "Failed to delete file",
            message: error.message
        });
    }
};

// Get files for a chat
const getChatFiles = async (req, res) => {
    try {
        const files = await FileModel.find({
            chat: req.params.chatId,
            user: req.user._id
        }).sort({ createdAt: -1 });

        res.status(200).json(files);
    } catch (error) {
        console.error('Error getting chat files:', error);
        res.status(500).json({
            error: "Failed to get chat files",
            message: error.message
        });
    }
};

export {
    uploadFile,
    getFile,
    deleteFile,
    getChatFiles
}; 