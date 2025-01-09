import React, { useState, useEffect } from 'react';
import './SpeechBubble.css';

const SpeechBubble = ({ text, onNext, className }) => {
    const [displayedText, setDisplayedText] = useState('');  // Store the displayed text
    const [isTypingComplete, setIsTypingComplete] = useState(false);  // Track if typing is complete
    const typingSpeed = 50;  // Speed of typing in milliseconds

    useEffect(() => {
        let index = 0;  // Initialize the index for character tracking
        setDisplayedText('');  // Reset the displayed text when a new prompt is received
        setIsTypingComplete(false);  // Reset typing complete status

        const intervalId = setInterval(() => {
            if (index < text.length) {
                setDisplayedText((prev) => prev + text.charAt(index));
                index++;  // Increment the index after setting the new character
            } else {
                setIsTypingComplete(true);  // Mark typing as complete
                clearInterval(intervalId);  // Stop the interval when all text is typed
            }
        }, typingSpeed);

        // Cleanup the interval on unmount
        return () => clearInterval(intervalId);
    }, [text]);

    return (
        <div className={`speech-bubble ${className}`}>
            <div className="speech-content">
            <div>{displayedText}</div>
            {/* Render "Next" button when typing is complete */}
            {isTypingComplete && (
                <button className="next-button" onClick={onNext}>
                    Next
                </button>
            )}
            </div>
        </div>
    );
};

export default SpeechBubble;
