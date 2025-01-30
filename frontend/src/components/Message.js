import React from "react";
import "./Message.css";

const Message = ({ text, className }) => {
    return (
        <div className={`message-container ${className}`}>
            <p className="message-text">{text}</p>
        </div>
    );
};

export default Message;
