import chatModel from "../models/ChatModel.js";
import fetch from 'node-fetch';

const OLLAMA_URL = "http://182.71.102.210:11434/api/chat";
const MODEL_NAME = "llama3.1:latest";

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
    
    console.log('Received message request:', { chatId, message });
    
    if (!chatId || !message) {
        console.log('Missing required fields:', { chatId, message });
        return res.status(400).json({
            error: "Chat ID and message are required"
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

        // Add user message to chat
        console.log('Adding user message to chat');
        chat.messages.push({
            role: 'user',
            content: message
        });
        await chat.save();
        console.log('User message saved successfully');

        // Get response from Llama
        console.log('Getting response from Ollama API');
        const ollamaResponse = await fetch(OLLAMA_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                model: MODEL_NAME,
                messages: chat.messages.map(msg => ({
                    role: msg.role,
                    content: msg.content
                })),
                stream: false
            })
        });

        if (!ollamaResponse.ok) {
            throw new Error(`Ollama API error: ${ollamaResponse.status}`);
        }

        const ollamaData = await ollamaResponse.json();
        const aiResponse = ollamaData.message?.content || "No response from AI";
        console.log('Received AI response:', aiResponse);

        // Add AI response to chat
        console.log('Adding AI response to chat');
        chat.messages.push({
            role: 'assistant',
            content: aiResponse
        });
        await chat.save();
        console.log('AI response saved successfully');

        res.status(200).json({
            _id: chat._id,
            messages: chat.messages,
            createdAt: chat.createdAt,
            updatedAt: chat.updatedAt
        });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({
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
        const chats = await chatModel.find({ user: req.user._id })
            .sort({ updatedAt: -1 })
            .select('_id messages createdAt updatedAt');
        
        res.status(200).json(chats);
    } catch (error) {
        console.error('Error fetching chats:', error);
        res.status(500).json({
            error: "Failed to fetch chats",
            message: error.message
        });
    }
};

export { startChat, sendMessage, getChat, getAllChats };


