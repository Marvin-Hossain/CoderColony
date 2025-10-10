import React from 'react';
import './Button.css';

interface ButtonProps {
    text?: string;
    onClick?: () => void;
    className?: string;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    children?: React.ReactNode;
    variant?: 'default' | 'outline' | 'ghost';
    size?: 'default' | 'sm' | 'lg';
}

const Button = ({
                    onClick,
                    text,
                    className = '',
                    disabled = false,
                    type = 'button',
                    children,
                    variant = 'default',
                    size = 'default'
                }: ButtonProps) => {
    const variantClass = variant === 'outline' ? 'outline' : variant === 'ghost' ? 'ghost' : '';
    const sizeClass = size === 'lg' ? 'lg' : size === 'sm' ? 'sm' : '';

    return (
        <button
            className={`custom-button ${variantClass} ${sizeClass} ${className}`}
            onClick={onClick}
            disabled={disabled}
            type={type}
        >
            {children || text}
        </button>
    );
};

export default Button;
