// import React, { useState, useEffect } from 'react';
// import './SpeechBubble.css';
//
// const SpeechBubble = ({ text, onNext, className }) => {
//     const [displayedText, setDisplayedText] = useState('');  // Store the displayed text
//     const [isTypingComplete, setIsTypingComplete] = useState(false);  // Track if typing is complete
//     const typingSpeed = 50;  // Speed of typing in milliseconds
//
//     useEffect(() => {
//         let index = 0;  // Initialize the index for character tracking
//         setDisplayedText('');  // Reset the displayed text when a new prompt is received
//         setIsTypingComplete(false);  // Reset typing complete status
//
//         const intervalId = setInterval(() => {
//             if (index < text.length) {
//                 setDisplayedText((prev) => prev + text.charAt(index));
//                 index++;  // Increment the index after setting the new character
//             } else {
//                 setIsTypingComplete(true);  // Mark typing as complete
//                 clearInterval(intervalId);  // Stop the interval when all text is typed
//             }
//         }, typingSpeed);
//
//         // Cleanup the interval on unmount
//         return () => clearInterval(intervalId);
//     }, [text]);
//
//     return (
//         <div className={`speech-bubble ${className}`}>
//             <div className="speech-content">
//             <div>{displayedText}</div>
//             {/* Render "Next" button when typing is complete */}
//             {isTypingComplete && (
//                 <button className="next-button" onClick={onNext}>
//                     Next
//                 </button>
//             )}
//             </div>
//         </div>
//     );
// };
//
// export default SpeechBubble;
import React, { useState, useEffect } from "react";
import "./SpeechBubble.css";

const SpeechBubble = ({ className }) => {
    const [displayedText, setDisplayedText] = useState(""); // Displayed text (bot's response)
    const [userInput, setUserInput] = useState(""); // User's input
    const [botText, setBotText] = useState(""); // Full bot response text (to type out)
    const typingSpeed = 50; // Speed of typing in milliseconds

    useEffect(() => {
        if (!botText) return;

        let index = 0;
        setDisplayedText(""); // Reset displayed text for typing effect

        const intervalId = setInterval(() => {
            // Ensure the first letter is included
            setDisplayedText((prev) => prev + botText.charAt(index));
            index++;
            if (index >= botText.length) {
                clearInterval(intervalId); // Stop the interval when all text is typed
            }
        }, typingSpeed);

        return () => clearInterval(intervalId); // Cleanup interval on unmount or when botText changes
    }, [botText]);

    const fetchBotResponse = async (input) => {
        try {
            const response = await fetch("http://localhost:8080/api/bot", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ input }),
            });

            const data = await response.json();
            setBotText(data.response); // Set bot's response for typing
        } catch (error) {
            console.error("Error fetching bot response:", error);
            setBotText("Sorry, I couldn't process your request."); // Handle error case
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!userInput.trim()) return; // Skip empty inputs
        fetchBotResponse(userInput); // Fetch bot's response
        setUserInput(""); // Clear the input field
    };

    return (
        <div className={`speech-bubble-wrapper ${className}`}>
            <div className="speech-bubble">
                <div className="speech-content">
                    <div>{displayedText}</div>
                </div>
            </div>
            <form className="user-input-form" onSubmit={handleSubmit}>
                <input
                    type="text"
                    className="user-input"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Type your message..."
                />
                <button type="submit" className="send-button">
                    Send
                </button>
            </form>
        </div>
    );
};

export default SpeechBubble;
