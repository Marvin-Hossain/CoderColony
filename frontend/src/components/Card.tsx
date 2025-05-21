import React, {ReactNode} from 'react';
import './Card.css';

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
    // Generate the appropriate CSS classes based on props
    const cardClasses = [
        'card',
        size === 'sm' ? 'card-sm' : '',
        size === 'lg' ? 'card-lg' : '',
        accent === 'left' ? 'card-accent-left' : '',
        accent === 'top' ? 'card-accent-top' : '',
        interactive ? 'card-interactive' : '',
        subtle ? 'card-subtle' : '',
        loading ? 'card-loading' : '',
        className
    ].filter(Boolean).join(' ');

    return (
        <div 
            className={cardClasses} 
            onClick={onClick}
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