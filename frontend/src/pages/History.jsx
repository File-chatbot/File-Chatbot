import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const History = () => {
    const [chatHistory, setChatHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchChatHistory();
    }, []);

    const fetchChatHistory = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch('http://localhost:4000/api/chats', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch chat history');
            }

            const data = await response.json();
            setChatHistory(data);
            setError(null);
        } catch (error) {
            console.error('Error fetching chat history:', error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignOut = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const getMessagePreview = (messages) => {
        if (!messages || messages.length === 0) return 'No messages';
        const firstMessage = messages[0].content;
        return firstMessage.length > 50 ? firstMessage.substring(0, 50) + '...' : firstMessage;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50">
            {/* Header */}
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
                            Chat History
                        </h1>
                        <button
                            onClick={() => navigate('/chat')}
                            className="px-4 py-2 text-sky-600 hover:text-sky-700 font-medium"
                        >
                            Back to Chat
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
                    </div>
                ) : chatHistory.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600 text-lg">No chat history found</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {chatHistory.map((chat) => (
                            <div
                                key={chat._id}
                                onClick={() => navigate(`/chat/${chat._id}`)}
                                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center">
                                            <span className="text-sky-600 font-medium">
                                                {user?.email?.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">{user?.email}</p>
                                            <p className="text-xs text-gray-400">{formatDate(chat.createdAt)}</p>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-gray-700 mt-2">
                                    {getMessagePreview(chat.messages)}
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Sign Out Button */}
                <div className="mt-8 text-center">
                    <button
                        onClick={handleSignOut}
                        className="px-6 py-2 bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-lg hover:from-sky-700 hover:to-blue-700 transition-all shadow-sm"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default History; 