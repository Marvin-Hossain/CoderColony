// Bot.js
import React, { useState } from "react";

const Bot = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");

    const sendMessage = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/bot", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ input }),
            });

            const data = await response.json();
            const botMessage = data.response;

            setMessages([...messages, { user: input, bot: botMessage }]);
            setInput(""); // Clear input field
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    return (
        <div className="container">
            <h1>Chat with AI</h1>
            <div className="chat-box">
                {messages.map((msg, index) => (
                    <div key={index} className="mb-3">
                        <p><strong>You:</strong> {msg.user}</p>
                        <p><strong>AI:</strong> {msg.bot}</p>
                    </div>
                ))}
            </div>
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="form-control mb-2"
            />
            <button onClick={sendMessage} className="btn btn-primary">Send</button>
        </div>
    );
};

export default Bot;
