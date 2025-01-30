import React from "react";
import { useNavigate } from "react-router-dom"; // Import the navigation hook
import "./Intro.css";
import Button from "../components/Button"; // Reusable Button component
import Message from "../components/Message"; // New Message component

const Intro = () => {
    const navigate = useNavigate(); // Initialize the navigation function

    const handleGetStarted = () => {
        navigate("/dashboard"); // Navigate to the dashboard page
    };

    return (
        <div className="intro">
            <div className="intro-container">
                <Message
                    text="Welcome to your AI-Powered Daily Progress! Organize your day, optimize your time, and stay productive!"
                    className="intro-message"
                />
                <Button
                    onClick={handleGetStarted}
                    text="Get Started"
                    className="intro-button"
                />
            </div>
        </div>
    );
};

export default Intro;
