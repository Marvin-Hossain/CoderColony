import React from 'react';
import { buttonStyles } from './ui/button';
import { cn } from '../lib/cn';

interface ButtonProps {
    text?: string;
    onClick?: () => void;
    className?: string;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    children?: React.ReactNode;
    variant?: 'default' | 'outline' | 'ghost';
    size?: 'default' | 'sm' | 'lg';
    style?: React.CSSProperties;
}

const Button = ({
                    onClick,
                    text,
                    className = '',
                    disabled = false,
                    type = 'button',
                    children,
                    variant = 'default',
                    size = 'default',
                    style
                }: ButtonProps) => {
    let cvaSize: 'sm' | 'md' | 'lg';
    if (size === 'lg') {
        cvaSize = 'lg';
    } else if (size === 'sm') {
        cvaSize = 'sm';
    } else {
        cvaSize = 'md';
    }

    return (
        <button
            className={cn(
                buttonStyles({ variant: variant ?? 'default', size: cvaSize }),
                className
            )}
            onClick={onClick}
            disabled={disabled}
            type={type}
            style={style}
        >
            {children || text}
        </button>
    );
};

export default Button;
