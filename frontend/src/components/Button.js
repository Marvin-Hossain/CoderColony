import React from 'react';
import './Button.css';  // Import the CSS file for the button

const Button = ({ onClick, text, className, disabled }) => {
    return (
        <button 
            className={`custom-button ${className}`} 
            onClick={onClick}
            disabled={disabled}
        >
            {text}
        </button>
    );
};

export default Button;
