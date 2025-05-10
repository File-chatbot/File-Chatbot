import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:4000/api';

const ChatHistory = ({ onSelectChat, selectedChatId }) => {
    const [chats, setChats] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { user, logout } = useAuth();

    useEffect(() => {
        if (user) {
            fetchChats();
        }
    }, [user]);

    const fetchChats = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${API_URL}/chats`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Authentication failed. Please login again.');
                }
                throw new Error('Failed to fetch chats');
            }
            
            const data = await response.json();
            setChats(data);
            setError(null);
        } catch (error) {
            console.error('Error fetching chats:', error);
            setError(error.message || 'Failed to load chat history');
            if (error.message.includes('Authentication failed')) {
                logout();
            }
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getChatPreview = (chat) => {
        const lastMessage = chat.messages[chat.messages.length - 1];
        return lastMessage ? lastMessage.content.substring(0, 50) + '...' : 'No messages';
    };

    return (
        <div className="w-64 bg-white shadow-lg h-screen flex flex-col">
            <div className="p-4 border-b bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Chat History</h2>
                    <button
                        onClick={fetchChats}
                        className="p-1 hover:bg-white/10 rounded-full transition-colors"
                        title="Refresh"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
                <div className="mt-2 text-sm text-indigo-100">
                    {user?.email || 'User'}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="p-4 text-center text-gray-500">
                        Loading chats...
                    </div>
                ) : error ? (
                    <div className="p-4 text-red-600 text-sm bg-red-50">
                        {error}
                    </div>
                ) : chats.length === 0 ? (
                    <div className="p-4 text-gray-500 text-center">
                        No chat history available
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {chats.map((chat) => (
                            <div
                                key={chat._id}
                                onClick={() => onSelectChat(chat._id)}
                                className={`p-4 cursor-pointer hover:bg-indigo-50 transition-colors ${
                                    selectedChatId === chat._id ? 'bg-indigo-100 border-l-4 border-indigo-600' : ''
                                }`}
                            >
                                <div className="text-sm font-medium text-gray-900 mb-1">
                                    {getChatPreview(chat)}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {formatDate(chat.updatedAt)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="p-4 border-t">
                <button
                    onClick={logout}
                    className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                    Sign Out
                </button>
            </div>
        </div>
    );
};

export default ChatHistory; 