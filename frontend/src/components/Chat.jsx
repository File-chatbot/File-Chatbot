import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiPlus, FiClock, FiFile, FiUser, FiMessageSquare, FiPaperclip } from 'react-icons/fi';
import ChatHistory from './ChatHistory';

const API_URL = 'http://localhost:3000/api';

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [chatId, setChatId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [hasHistory, setHasHistory] = useState(false);
    const messagesEndRef = useRef(null);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const checkHistory = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const response = await fetch(`${API_URL}/chats`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setHasHistory(data.length > 0);
                }
            } catch (error) {
                console.error('Error checking history:', error);
            }
        };

        checkHistory();
    }, []);

    useEffect(() => {
        const initializeChat = async () => {
            if (!chatId) {
                const newChatId = await startNewChat();
                if (newChatId) {
                    setChatId(newChatId);
                    setMessages([]);
                }
            }
        };

        initializeChat();
    }, []);

    const startNewChat = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Please sign in to continue');
            navigate('/login');
            return null;
        }

        try {
            console.log('Starting new chat...');
            const response = await fetch(`${API_URL}/chats/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            console.log('New chat response:', data);

            if (!response.ok) {
                throw new Error(data.error || 'Failed to start new chat');
            }

            setChatId(data._id);
            setMessages([]);
            toast.success('New chat started');
            return data._id;
        } catch (err) {
            console.error('Error starting new chat:', err);
            toast.error(err.message || 'Failed to start new chat');
            return null;
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file type
            const validTypes = [
                'application/pdf',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ];
            if (!validTypes.includes(file.type)) {
                toast.error('Please select a valid file (PDF, PPTX, or DOCX)');
                return;
            }

            // Check file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                toast.error('File size should be less than 10MB');
                return;
            }

            setSelectedFile(file);
            setFilePreview({
                name: file.name,
                type: file.type,
                size: file.size
            });
            toast.success('File selected successfully');
        }
    };

    const sendMessage = async (content, file = null) => {
        if (!content.trim() && !file) return;

        if (!chatId) {
            toast.error('No active chat. Please start a new chat first.');
            return;
        }

        const newMessage = {
            role: 'user',
            content: content || 'Uploaded a file',
            timestamp: new Date().toISOString()
        };

        if (file) {
            newMessage.file = {
                name: file.name,
                type: file.type,
                size: file.size
            };
        }

        setMessages(prev => [...prev, newMessage]);
        setIsLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('message', content || '');
            formData.append('chatId', chatId);
            if (file) {
                formData.append('file', file);
            }

            console.log('Sending message:', {
                chatId,
                content,
                hasFile: !!file,
                fileInfo: file ? {
                    name: file.name,
                    type: file.type,
                    size: file.size
                } : null
            });

            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${API_URL}/chats/message`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('Non-JSON response:', text);
                throw new Error('Server returned non-JSON response');
            }

            const data = await response.json();
            
            if (!response.ok) {
                console.error('Error response:', data);
                throw new Error(data.error || data.message || 'Failed to send message');
            }

            if (data.error) {
                console.error('Error in response data:', data.error);
                throw new Error(data.error);
            }

            console.log('Message sent successfully:', data);

            // Update messages with the latest chat data
            setMessages(data.messages);
            setInput('');
            setSelectedFile(null);
            setFilePreview(null);
            toast.success('Message sent successfully');
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error(error.message || 'Failed to send message. Please try again.');
            setError(error.message);
            // Remove the user's message since it failed
            setMessages(prev => prev.slice(0, -1));
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() && !selectedFile) return;

        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Please sign in to continue');
            navigate('/login');
            return;
        }

        // If no chatId exists, start a new chat first
        let currentChatId = chatId;
        if (!currentChatId) {
            currentChatId = await startNewChat();
            if (!currentChatId) {
                toast.error('Failed to start new chat');
                return;
            }
        }

        try {
            await sendMessage(input, selectedFile);
        } catch (error) {
            console.error('Error in handleSubmit:', error);
            setError(error.message);
            toast.error(error.message || 'Failed to send message');
        }
    };

    const handleNewChat = async () => {
        const newChatId = await startNewChat();
        if (newChatId) {
            setError(null);
        }
    };

    const handleSignOut = async () => {
        try {
            await logout();
            navigate('/login');
            toast.success('Signed out successfully');
        } catch (error) {
            toast.error('Failed to sign out');
        }
    };

    const handleSelectChat = async (chatId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/chats/${chatId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch chat');
            }

            const data = await response.json();
            setChatId(chatId);
            setMessages(data.messages);
            setIsHistoryOpen(false);
        } catch (error) {
            console.error('Error fetching chat:', error);
            toast.error(error.message || 'Failed to load chat');
        }
    };

    const renderMessage = (message) => {
        const isUser = message.role === 'user';
        return (
            <motion.div
                key={message.timestamp}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
            >
                <div className={`flex items-start gap-3 max-w-[80%] ${isUser ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        isUser ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : 'bg-gradient-to-r from-purple-500 to-pink-500'
                    }`}>
                        {isUser ? (
                            <FiUser className="w-4 h-4 text-white" />
                        ) : (
                            <FiMessageSquare className="w-4 h-4 text-white" />
                        )}
                    </div>
                    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                        <div className={`rounded-2xl px-4 py-3 ${
                            isUser 
                                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' 
                                : 'bg-white border border-gray-200 shadow-sm'
                        }`}>
                            <div className="prose prose-sm max-w-none">
                                {message.content.split('\n').map((line, i) => (
                                    <p key={i} className="mb-2 last:mb-0">
                                        {line}
                                    </p>
                                ))}
                            </div>
                        </div>
                        {message.file && (
                            <div className={`mt-2 ${isUser ? 'text-right' : 'text-left'}`}>
                                <a
                                    href={message.file}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
                                        isUser 
                                            ? 'bg-white/10 text-white hover:bg-white/20' 
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    } transition-colors`}
                                >
                                    <FiPaperclip className="w-4 h-4" />
                                    View File
                                </a>
                            </div>
                        )}
                        <div className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
                            {new Date(message.timestamp).toLocaleTimeString()}
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="chat-container"
        >
            <div className="chat-header">
                <div className="flex items-center gap-4">
                <button
                    onClick={handleSignOut}
                    className="text-gray-600 hover:text-gray-800 transition-colors"
                >
                    Sign Out
                </button>
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span>Back to Home</span>
                    </button>
                </div>
                <h1 className="text-2xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Exam Buddy
                </h1>
                <div className="flex items-center gap-2">
                    {hasHistory && (
                    <button
                        onClick={() => setIsHistoryOpen(true)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <FiClock className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-600">History</span>
                    </button>
                    )}
                    <button
                        onClick={handleNewChat}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        title="New Chat"
                    >
                        <FiPlus className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
            </div>

            <div className="chat-messages">
                {messages.length === 0 ? (
                    <div className="empty-state">
                        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                            Welcome to Exam Buddy!
                        </h2>
                        <p className="text-gray-500">
                            Start a conversation by typing a message or uploading a document (PDF, PPTX, or DOCX).
                        </p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {messages.map((message) => renderMessage(message))}
                    </AnimatePresence>
                )}
                {isLoading && (
                    <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="chat-input">
                {filePreview && (
                    <div className="relative mb-2 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                            <FiFile className="w-5 h-5 text-gray-600" />
                            <span className="text-sm font-medium text-gray-700">
                                {filePreview.name}
                            </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                            {filePreview.type.split('/').pop().toUpperCase()} • 
                            {(filePreview.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedFile(null);
                                setFilePreview(null);
                            }}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                            ×
                        </button>
                    </div>
                )}
                <div className="flex items-center gap-2 w-full">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    disabled={isLoading}
                    className="flex-1"
                />
                    <label className="cursor-pointer p-2 hover:bg-gray-100 rounded-full">
                        <input
                            type="file"
                            accept=".pdf,.pptx,.docx"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                        <FiFile className="w-6 h-6 text-gray-500" />
                    </label>
                <button
                    type="submit"
                        disabled={isLoading || (!input.trim() && !selectedFile)}
                    className="send-button"
                >
                    <FiSend className="w-5 h-5" />
                </button>
                </div>
            </form>

            <AnimatePresence>
                {isHistoryOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="history-overlay"
                            onClick={() => setIsHistoryOpen(false)}
                        />
                        <ChatHistory
                            onSelectChat={handleSelectChat}
                            selectedChatId={chatId}
                            onClose={() => setIsHistoryOpen(false)}
                        />
                    </>
                )}
            </AnimatePresence>

            <style jsx>{`
                .chat-messages {
                    padding: 1rem;
                    overflow-y: auto;
                    flex: 1;
                }

                .message {
                    margin-bottom: 1.5rem;
                    max-width: 80%;
                }

                .user-message {
                    margin-left: auto;
                }

                .ai-message {
                    margin-right: auto;
                }

                .message-content {
                    padding: 1rem;
                    border-radius: 0.75rem;
                    background-color: white;
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
                }

                .user-message .message-content {
                    background-color: #f3f4f6;
                }

                .ai-message .message-content {
                    background-color: white;
                }

                .prose {
                    color: #374151;
                    line-height: 1.6;
                }

                .prose p {
                    margin: 0;
                }

                .typing-indicator {
                    display: flex;
                    gap: 0.5rem;
                    padding: 1rem;
                    margin-bottom: 1rem;
                }

                .typing-indicator span {
                    width: 0.5rem;
                    height: 0.5rem;
                    background-color: #9CA3AF;
                    border-radius: 50%;
                    animation: bounce 1.4s infinite ease-in-out;
                }

                .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
                .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

                @keyframes bounce {
                    0%, 80%, 100% { transform: scale(0); }
                    40% { transform: scale(1); }
                }

                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    text-align: center;
                    padding: 2rem;
                }
            `}</style>
        </motion.div>
    );
};

export default Chat; 