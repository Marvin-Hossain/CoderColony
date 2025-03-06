import React from "react";
import { useNavigate } from "react-router-dom"; // Import the navigation hook
import "./Intro.css";
import Button from "../components/Button"; // Reusable Button component
import Message from "../components/Message"; // New Message component

const Intro = () => {
    const navigate = useNavigate();
    
    // Function to handle GitHub login
    const handleGithubLogin = () => {
        window.location.href = 'http://localhost:8080/oauth2/authorization/github';
    };
    
    return (
        <div className="intro">
            <div className="intro-container">
                <Message
                    text="Welcome to your AI-Powered Daily Progress! Organize your day, optimize your time, and stay productive!"
                    className="intro-message"
                />
                <Button 
                className="github-login-btn" 
                onClick={handleGithubLogin}
                text="Login with GitHub"
                />
            </div>
        </div>
    );
};

export default Intro;
