import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiClock, FiMessageSquare, FiSearch, FiFile, FiUser, FiChevronLeft } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const API_URL = 'http://localhost:3000/api';

const ChatHistory = ({ onSelectChat, selectedChatId, onClose }) => {
    const [chats, setChats] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedChat, setSelectedChat] = useState(null);
    const [view, setView] = useState('list'); // 'list' or 'chat'

    useEffect(() => {
            fetchChats();
    }, []);

    const fetchChats = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${API_URL}/chats`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch chat history');
            }
            
            const data = await response.json();
            console.log('Fetched chats:', data);
            setChats(data);
        } catch (error) {
            console.error('Error fetching chats:', error);
            setError(error.message);
            toast.error(error.message || 'Failed to fetch chat history');
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            return 'Today at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (days === 1) {
            return 'Yesterday at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (days < 7) {
            return date.toLocaleDateString([], { weekday: 'long' }) + ' at ' + 
                   date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else {
            return date.toLocaleDateString([], { 
            year: 'numeric',
            month: 'short',
                day: 'numeric' 
        });
        }
    };

    const handleChatSelect = (chat) => {
        setSelectedChat(chat);
        setView('chat');
        onSelectChat(chat._id);
    };

    const filteredChats = chats.filter(chat => {
        const searchLower = searchQuery.toLowerCase();
        return chat.preview?.toLowerCase().includes(searchLower) ||
               formatDate(chat.lastMessageTime || chat.updatedAt).toLowerCase().includes(searchLower);
    });

    const renderChatList = () => (
        <div className="flex-1 overflow-y-auto">
            {isLoading ? (
                <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
            ) : error ? (
                <div className="p-4 text-center">
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
                        <p className="font-medium">{error}</p>
                    </div>
                    <button
                        onClick={fetchChats}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            ) : filteredChats.length === 0 ? (
                <div className="p-8 text-center">
                    <FiMessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">
                        {searchQuery ? 'No chats found matching your search' : 'Start a new chat to see your history here'}
                    </p>
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="mt-2 text-blue-500 hover:text-blue-600"
                        >
                            Clear search
                        </button>
                    )}
                    {!searchQuery && (
                        <button
                            onClick={onClose}
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            Start New Chat
                        </button>
                    )}
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                    {filteredChats.map((chat) => (
                        <button
                                key={chat._id}
                            onClick={() => handleChatSelect(chat)}
                            className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                                selectedChatId === chat._id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                                }`}
                            >
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <FiMessageSquare className="w-5 h-5 text-blue-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {chat.preview || 'New Chat'}
                                        </p>
                                        <span className="text-xs text-gray-500">
                                            {formatDate(chat.lastMessageTime || chat.updatedAt)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <FiClock className="w-3 h-3" />
                                            {chat.messageCount} message{chat.messageCount !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );

    const renderChatView = () => {
        if (!selectedChat) return null;

        return (
            <div className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {selectedChat.messages.map((message, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[80%] rounded-lg p-3 ${
                                message.role === 'user' 
                                    ? 'bg-blue-500 text-white' 
                                    : 'bg-gray-100 text-gray-900'
                            }`}>
                                {message.file && (
                                    <div className={`mb-2 p-2 rounded ${
                                        message.role === 'user' ? 'bg-blue-600' : 'bg-gray-200'
                                    }`}>
                                        <div className="flex items-center gap-2">
                                            <FiFile className="w-4 h-4" />
                                            <span className="text-sm font-medium">
                                                {message.file.name}
                                            </span>
                                        </div>
                                        <div className="text-xs mt-1">
                                            {message.file.type.split('/').pop().toUpperCase()} • 
                                            {(message.file.size / 1024 / 1024).toFixed(2)} MB
                                        </div>
                                    </div>
                                )}
                                <div className="prose prose-sm max-w-none">
                                    {message.content.split('\n').map((line, i) => (
                                        <p key={i} className="mb-2 last:mb-0">
                                            {line}
                                        </p>
                                    ))}
                                </div>
                                <div className={`text-xs mt-1 ${
                                    message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                                }`}>
                                    {formatDate(message.timestamp)}
                                </div>
                            </div>
                        </motion.div>
                        ))}
                </div>
            </div>
        );
    };

    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed right-0 top-0 h-full w-full md:w-[600px] bg-white shadow-lg z-50 flex flex-col"
        >
            <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                    {view === 'chat' ? (
                        <button
                            onClick={() => setView('list')}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
                        >
                            <FiChevronLeft className="w-5 h-5" />
                            <span>Back to Chats</span>
                        </button>
                    ) : (
                        <h2 className="text-lg font-semibold text-gray-800">Chat History</h2>
                    )}
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                    >
                        <FiX className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
                {view === 'list' && (
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search chats..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                )}
            </div>

            <AnimatePresence mode="wait">
                {view === 'list' ? renderChatList() : renderChatView()}
            </AnimatePresence>
        </motion.div>
    );
};

export default ChatHistory; 