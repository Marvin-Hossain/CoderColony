import React , {useState} from 'react';
import { useNavigate } from 'react-router-dom';  // Import React Router's navigation hook
import './Earth.css';
import Button from '../components/Button.js';
import SpeechBubble from '../components/SpeechBubble';

const Earth = () => {
    const navigate = useNavigate();  // Create the navigate function
    const [promptIndex, setPromptIndex] = useState(0);

    const prompts = [
        "Grreetings, traveler! Welcome aboard the Stellar Voyager. I’m Unit R-47, your companion on this journey through the stars.",
        "TTogether, we’ll explore mysterious planets, each holding a key to unlock your true potential. Every world will challenge and shape you.",
        "BBut beware—dangers lurk in the cosmos. I’ll guide and assist you, traveler. Are you ready to begin?"
    ];

    const handleStartJourney = () => {
        navigate('/ship');  // Navigate to the Ship page when button is clicked
    };

    const handleNext = () => {
        if (promptIndex < prompts.length - 1) {
            setPromptIndex(promptIndex + 1);  // Move to the next prompt
        }
    };

    return (
        <div className="earth-container">
            {/*<h1 className="earth-title">Welcome to Earth - Your Journey Begins</h1>*/}
            <SpeechBubble text={prompts[promptIndex]} onNext={handleNext} className={"earth-speech-bubble"}/>
            <Button text="Start Your Journey" className="earth-button" onClick={handleStartJourney} />  {/* Reusable Button */}
        </div>
    );
};

export default Earth;
