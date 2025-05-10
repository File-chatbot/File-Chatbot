import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiPlus, FiClock } from 'react-icons/fi';

const API_URL = 'http://localhost:4000/api';

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [chatId, setChatId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const messagesEndRef = useRef(null);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

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

        const newMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, newMessage]);
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            console.log('Sending message to chat:', currentChatId);
            const response = await fetch(`${API_URL}/chats/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    chatId: currentChatId,
                    message: input
                })
            });

            const data = await response.json();
            console.log('Message response:', data);

            if (!response.ok) {
                if (response.status === 401) {
                    toast.error('Session expired. Please sign in again.');
                    logout();
                    navigate('/login');
                    return;
                }
                throw new Error(data.error || 'Failed to send message');
            }

            setMessages(data.messages);
            toast.success('Message sent successfully');
        } catch (err) {
            console.error('Error sending message:', err);
            setError(err.message);
            toast.error(err.message || 'Failed to send message');
            // Remove the failed message from the UI
            setMessages(prev => prev.slice(0, -1));
        } finally {
            setIsLoading(false);
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

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="chat-container"
        >
            <div className="chat-header">
                <button
                    onClick={handleSignOut}
                    className="text-gray-600 hover:text-gray-800 transition-colors"
                >
                    Sign Out
                </button>
                <h1 className="text-2xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Exam Buddy
                </h1>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsHistoryOpen(true)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <FiClock className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-600">History</span>
                    </button>
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
                            Start a conversation by typing a message below.
                        </p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {messages.map((message, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className={`message ${message.role === 'user' ? 'user-message' : 'ai-message'}`}
                            >
                                {message.content}
                            </motion.div>
                        ))}
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
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    disabled={isLoading}
                    className="flex-1"
                />
                <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="send-button"
                >
                    <FiSend className="w-5 h-5" />
                </button>
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
                        <motion.div
                            initial={{ x: -320 }}
                            animate={{ x: 0 }}
                            exit={{ x: -320 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="history-panel"
                        >
                            <div className="p-4">
                                <h2 className="text-xl font-semibold mb-4">Chat History</h2>
                                {/* Add your chat history items here */}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Chat; 