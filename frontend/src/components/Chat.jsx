import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:4000/api';

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [chatId, setChatId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [chats, setChats] = useState([]);
    const messagesEndRef = useRef(null);
    const { user, logout } = useAuth();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        fetchChats();
    }, []);

    const fetchChats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/chats`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch chats');
            }
            
            const data = await response.json();
            setChats(data);
        } catch (error) {
            console.error('Error fetching chats:', error);
            setError('Failed to load chat history');
        }
    };

    const startNewChat = async () => {
        try {
            setError(null);
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/chats/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            setChatId(data._id);
            setMessages([]);
            fetchChats(); // Refresh chat list
        } catch (error) {
            console.error('Error starting chat:', error);
            setError('Failed to start chat. Please try again.');
        }
    };

    const loadChat = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/chats/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to load chat');
            }
            
            const data = await response.json();
            setChatId(id);
            setMessages(data.messages);
        } catch (error) {
            console.error('Error loading chat:', error);
            setError('Failed to load chat');
        }
    };

    const sendMessage = async () => {
        if (!inputMessage.trim() || !chatId) return;

        setIsLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/chats/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    chatId,
                    message: inputMessage,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setMessages(data.messages);
            setInputMessage('');
            fetchChats(); // Refresh chat list
        } catch (error) {
            console.error('Error sending message:', error);
            setError('Failed to send message. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !isLoading) {
            sendMessage();
        }
    };

    return (
        <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
            {/* Sidebar */}
            <div className="w-64 bg-white shadow-lg">
                <div className="p-4 border-b bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Exam Buddy</h2>
                        <button
                            onClick={startNewChat}
                            className="px-3 py-1 text-sm bg-white text-indigo-600 rounded-full hover:bg-indigo-50 transition-colors"
                        >
                            New Chat
                        </button>
                    </div>
                    <div className="mt-2 text-sm text-indigo-100">
                        {user.email}
                    </div>
                </div>
                <div className="overflow-y-auto h-[calc(100vh-8rem)]">
                    {chats.map((chat) => (
                        <div
                            key={chat._id}
                            onClick={() => loadChat(chat._id)}
                            className={`p-3 cursor-pointer hover:bg-indigo-50 transition-colors ${
                                chatId === chat._id ? 'bg-indigo-100 border-l-4 border-indigo-600' : ''
                            }`}
                        >
                            <div className="text-sm truncate">
                                {chat.messages[0]?.content || 'New Chat'}
                            </div>
                            <div className="text-xs text-gray-500">
                                {new Date(chat.updatedAt).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
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

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto p-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 shadow-sm">
                            {error}
                        </div>
                    )}

                    {messages.length === 0 && !isLoading && (
                        <div className="h-full flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <h2 className="text-2xl font-bold mb-2 text-indigo-600">Welcome to Exam Buddy!</h2>
                                <p className="text-gray-600">Your AI study companion. Start a new conversation or select a previous chat.</p>
                            </div>
                        </div>
                    )}

                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`flex mb-4 ${
                                msg.role === 'user' ? 'justify-end' : 'justify-start'
                            }`}
                        >
                            <div
                                className={`max-w-[70%] rounded-2xl p-4 ${
                                    msg.role === 'user'
                                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                                        : 'bg-white shadow-lg'
                                }`}
                            >
                                {msg.content}
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex justify-start mb-4">
                            <div className="bg-white shadow-lg rounded-2xl p-4">
                                <div className="flex space-x-2">
                                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-100"></div>
                                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-200"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="border-t p-4 bg-white shadow-lg">
                    <div className="flex space-x-4 max-w-4xl mx-auto">
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your message..."
                            className="flex-1 border rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            disabled={!chatId || isLoading}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!inputMessage.trim() || !chatId || isLoading}
                            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all shadow-md"
                        >
                            {isLoading ? 'Sending...' : 'Send'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chat; 