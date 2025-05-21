import React from 'react';
import './Button.css';

interface ButtonProps {
    text?: string;
    onClick?: () => void;
    className?: string;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    children?: React.ReactNode;
}

const Button = ({
                    onClick,
                    text,
                    className = '',
                    disabled = false,
                    type = 'button',
                    children
                }: ButtonProps) => {
    return (
        <button
            className={`custom-button ${className}`}
            onClick={onClick}
            disabled={disabled}
            type={type}
        >
            {children || text}
        </button>
    );
};

export default Button;
