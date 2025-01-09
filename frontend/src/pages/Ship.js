import React from 'react';
import './Ship.css';  // Import the Ship.css file
import Button from '../components/Button.js';
import SpeechBubble from '../components/SpeechBubble';

const Ship = () => {
    const handleNavigateBack = () => {
        window.history.back();  // Go back to the previous page
    };
    return (
        <div className="ship-container">
            {/*<h1 className="ship-title">Welcome to the Spaceship!</h1>*/}
            <SpeechBubble text = "Thhis is where your journey through the solar system begins." className={"ship-speech-bubble"}/>
            <Button className="ship-button" text="Go Back to Earth" onClick={handleNavigateBack} />  {/* Reusable Button */}
        </div>
    );
};

export default Ship;
