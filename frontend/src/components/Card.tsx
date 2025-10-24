import React, {ReactNode} from 'react';
import './Card.css';
import { cn } from '@/lib/cn';
import { cardStyles } from './ui/card';

interface CardProps {
    /** Card content */
    children: ReactNode;
    className?: string;
    title?: string;
    accent?: 'left' | 'top';
    size?: 'sm' | 'md' | 'lg';
    interactive?: boolean;
    subtle?: boolean;
    loading?: boolean;
    onClick?: () => void;
}

/**
 * Card component for displaying content in a styled container
 * with various style options and hover effects.
 */
const Card: React.FC<CardProps> = ({
    children,
    className = '',
    title,
    accent,
    size = 'md',
    interactive = false,
    subtle = false,
    loading = false,
    onClick
}) => {
    const cardClasses = cn(
        cardStyles({
            size,
            accent,
            interactive,
            subtle,
            loading,
        }),
        className
    );

    return (
        <div 
            className={cardClasses} 
            onClick={onClick}
            onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
            style={onClick ? {cursor: 'pointer'} : undefined}
        >
            {title && <h3 className="card-header">{title}</h3>}
            {children}
            {loading && (
                <div className="card-loading-overlay">
                    <div className="loading-spinner"></div>
                </div>
            )}
        </div>
    );
};

export default Card; 