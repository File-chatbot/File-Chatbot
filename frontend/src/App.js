import React, { useState, useEffect } from 'react';
import { API_URL } from './config';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatId, setChatId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const startNewChat = async () => {
    try {
      setError(null);
      const response = await fetch(`${API_URL}/api/chats/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setChatId(data._id);
      setMessages([]);
    } catch (error) {
      console.error('Error starting chat:', error);
      setError('Failed to start chat. Please try again.');
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !chatId) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/chats/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
    <div className="App">
      <div className="chat-container">
        <div className="chat-header">
          <h1>Chat with AI</h1>
          <button onClick={startNewChat} className="new-chat-btn">
            Start New Chat
          </button>
        </div>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="messages-container">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.role === 'user' ? 'user-message' : 'ai-message'}`}
            >
              <div className="message-content">{msg.content}</div>
            </div>
          ))}
          {isLoading && (
            <div className="message ai-message">
              <div className="message-content">AI is typing...</div>
            </div>
          )}
        </div>

        <div className="input-container">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={chatId ? "Type your message..." : "Click 'Start New Chat' to begin"}
            disabled={!chatId || isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || !chatId || isLoading}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App; 