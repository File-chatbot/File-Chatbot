import chatModel from "../models/ChatModel.js";
import fetch from 'node-fetch';
import fs from 'fs';
import FileModel from "../models/FileModel.js";
import mongoose from 'mongoose';

const API_URL = "https://4nnc5hl6-11434.inc1.devtunnels.ms/api/chat";
const TEXT_MODEL = "wizardlm2";
const IMAGE_MODEL = "llava-llama3";

const fileSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, required: true },
    size: { type: Number, required: true }
}, { _id: false });

// Start a new chat --POST
const startChat = async (req, res) => {
    try {
        console.log('Creating new chat...');
        const chat = await chatModel.create({
            user: req.user._id,
            messages: []
        });
        console.log('Chat created successfully:', chat);

        res.status(201).json({
            _id: chat._id,
            messages: chat.messages,
            createdAt: chat.createdAt,
            updatedAt: chat.updatedAt
        });
    } catch (error) {
        console.error('Error creating chat:', error);
        res.status(500).json({
            error: "Failed to create chat",
            message: error.message
        });
    }
};

// Send a message and get response --POST
const sendMessage = async (req, res) => {
    const { chatId, message } = req.body;
    const file = req.file;
    
    console.log('Received message request:', { 
        chatId, 
        message, 
        file: file ? {
            name: file.originalname,
            type: file.mimetype,
            size: file.size
        } : null 
    });
    
    if (!chatId) {
        console.log('Missing chatId');
        return res.status(400).json({
            error: "Chat ID is required"
        });
    }

    if (!message && !file) {
        console.log('Missing message and file');
        return res.status(400).json({
            error: "Either message or file is required"
        });
    }

    try {
        // Get the chat and verify ownership
        console.log('Finding chat with ID:', chatId);
        const chat = await chatModel.findOne({ _id: chatId, user: req.user._id });
        if (!chat) {
            console.log('Chat not found or unauthorized:', chatId);
            return res.status(404).json({
                error: "Chat not found or unauthorized"
            });
        }
        console.log('Found chat:', chat);

        // Prepare the new message
        const newMessage = {
            role: 'user',
            content: message || 'Uploaded a file',
            timestamp: new Date()
        };

        if (file) {
            try {
                // Read file as buffer instead of utf8
                const fileBuffer = fs.readFileSync(file.path);
                // Convert buffer to base64 for transmission
                const base64Content = fileBuffer.toString('base64');
                newMessage.file = {
                    name: file.originalname,
                    type: file.mimetype,
                    size: file.size,
                    content: base64Content
                };
                console.log('File content read successfully:', {
                    name: file.originalname,
                    type: file.mimetype,
                    size: file.size
                });
            } catch (readError) {
                console.error('Error reading file:', readError);
                return res.status(500).json({
                    error: "Failed to read file content",
                    message: readError.message
                });
            }
        }

        // Add user message to chat
        console.log('Adding user message to chat:', JSON.stringify(newMessage, null, 2));
        try {
            chat.messages.push(newMessage);
            const savedChat = await chat.save();
            console.log('User message saved successfully:', JSON.stringify(savedChat.messages[savedChat.messages.length - 1], null, 2));
        } catch (saveError) {
            console.error('Error saving message:', saveError);
            if (saveError.name === 'ValidationError') {
                console.error('Validation error details:', JSON.stringify(saveError.errors, null, 2));
                return res.status(400).json({
                    error: "Invalid message format",
                    details: saveError.errors
                });
            }
            return res.status(500).json({
                error: "Failed to save message",
                message: saveError.message
            });
        }

        // Get response from API
        console.log('Getting response from API');
        try {
            const apiResponse = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                    model: TEXT_MODEL,
                messages: chat.messages.map(msg => ({
                    role: msg.role,
                        content: msg.content,
                        file: msg.file ? {
                            name: msg.file.name,
                            type: msg.file.type,
                            content: msg.file.content,
                            size: msg.file.size
                        } : undefined
                })),
                stream: false
            })
        });

            if (!apiResponse.ok) {
                const errorText = await apiResponse.text();
                console.error('API error response:', errorText);
                return res.status(apiResponse.status).json({
                    error: `API error: ${apiResponse.status}`,
                    details: errorText
                });
        }

            const apiData = await apiResponse.json();
            console.log('API response data:', apiData);
            const aiResponse = apiData.message?.content || "No response from AI";
        console.log('Received AI response:', aiResponse);

        // Add AI response to chat
        console.log('Adding AI response to chat');
            const aiMessage = {
            role: 'assistant',
                content: aiResponse,
                timestamp: new Date()
            };
            chat.messages.push(aiMessage);
        await chat.save();
        console.log('AI response saved successfully');

            // Return the complete chat with all messages
            return res.status(200).json({
            _id: chat._id,
                messages: chat.messages.map(msg => ({
                    role: msg.role,
                    content: msg.content,
                    timestamp: msg.timestamp,
                    file: msg.file ? {
                        name: msg.file.name,
                        type: msg.file.type,
                        size: msg.file.size
                    } : undefined
                })),
            createdAt: chat.createdAt,
            updatedAt: chat.updatedAt
        });
        } catch (apiError) {
            console.error('Error with API call:', apiError);
            // Remove the user's message since the API call failed
            chat.messages.pop();
            await chat.save();
            return res.status(500).json({
                error: "Failed to get AI response",
                message: apiError.message
            });
        }
    } catch (error) {
        console.error('Error in sendMessage:', error);
        return res.status(500).json({
            error: "Failed to send message",
            message: error.message
        });
    }
};

// Get chat history --GET
const getChat = async (req, res) => {
    const { chatId } = req.params;
    
    console.log('Getting chat history for ID:', chatId);
    
    try {
        const chat = await chatModel.findOne({ _id: chatId, user: req.user._id });
        if (!chat) {
            console.log('Chat not found or unauthorized:', chatId);
            return res.status(404).json({
                error: "Chat not found or unauthorized"
            });
        }
        console.log('Found chat:', chat);

        res.status(200).json({
            _id: chat._id,
            messages: chat.messages,
            createdAt: chat.createdAt,
            updatedAt: chat.updatedAt
        });
    } catch (error) {
        console.error('Error fetching chat:', error);
        res.status(500).json({
            error: "Failed to fetch chat",
            message: error.message
        });
    }
};

// Get all chats for the user
const getAllChats = async (req, res) => {
    try {
        console.log('Fetching chats for user:', req.user._id);
        
        const chats = await chatModel.find({ user: req.user._id })
            .sort({ updatedAt: -1 })
            .select('_id messages createdAt updatedAt')
            .lean();
        
        console.log(`Found ${chats.length} chats`);
        
        // Format the response to include message count and preview
        const formattedChats = chats.map(chat => {
            const lastMessage = chat.messages[chat.messages.length - 1];
            return {
                _id: chat._id,
                messageCount: chat.messages.length,
                preview: lastMessage ? lastMessage.content.substring(0, 100) : 'No messages',
                lastMessageTime: lastMessage ? lastMessage.timestamp : chat.updatedAt,
                createdAt: chat.createdAt,
                updatedAt: chat.updatedAt
            };
        });

        console.log('Formatted chats:', formattedChats);
        
        res.status(200).json(formattedChats);
    } catch (error) {
        console.error('Error fetching chats:', error);
        res.status(500).json({
            error: "Failed to fetch chats",
            message: error.message
        });
    }
};

// Get chat statistics
const getChatStats = async (req, res) => {
    try {
        const totalChats = await chatModel.countDocuments({ user: req.user._id });
        const totalMessages = await chatModel.aggregate([
            { $match: { user: req.user._id } },
            { $project: { messageCount: { $size: "$messages" } } },
            { $group: { _id: null, total: { $sum: "$messageCount" } } }
        ]);

        const recentActivity = await chatModel.find({ user: req.user._id })
            .sort({ updatedAt: -1 })
            .limit(5)
            .select('updatedAt messageCount')
            .lean();

        res.status(200).json({
            totalChats,
            totalMessages: totalMessages[0]?.total || 0,
            recentActivity
        });
    } catch (error) {
        console.error('Error fetching chat stats:', error);
        res.status(500).json({
            error: "Failed to fetch chat statistics",
            message: error.message
        });
    }
};

export { 
    startChat, 
    sendMessage, 
    getChat, 
    getAllChats,
    getChatStats 
};


