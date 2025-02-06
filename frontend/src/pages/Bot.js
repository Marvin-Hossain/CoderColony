// Bot.js
import React, { useState } from "react";
import { API_CONFIG } from "../services/config";

const Bot = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const sendMessage = async () => {
        if (!input.trim()) return;
        
        setLoading(true);
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.BOT}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ input }),
            });

            if (!response.ok) throw new Error('Failed to send message');
            
            const data = await response.json();
            setMessages(prev => [...prev, { user: input, bot: data.response }]);
            setInput("");
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bot-container">
            <h1>Chat with AI</h1>
            <div className="chat-box">
                {messages.map((msg, index) => (
                    <div key={index} className="message-group">
                        <div className="user-message">You: {msg.user}</div>
                        <div className="bot-message">AI: {msg.bot}</div>
                    </div>
                ))}
            </div>
            <div className="input-area">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    disabled={loading}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button 
                    onClick={sendMessage} 
                    disabled={loading || !input.trim()}
                >
                    {loading ? 'Sending...' : 'Send'}
                </button>
            </div>
        </div>
    );
};

export default Bot;
