import React, {ReactNode} from 'react';
import './Card.css';
import { Badge } from './ui/badge';

interface CardItemProps {
    label: string;
    value?: ReactNode;
    children?: ReactNode;
    className?: string;
    badge?: boolean;
    onClick?: () => void;
}

/**
 * CardItem component for displaying a label-value pair within a Card.
 * Can be used for lists of information, statistics, or settings.
 */
const CardItem: React.FC<CardItemProps> = ({
    label,
    value,
    children,
    className = '',
    badge = false,
    onClick
}) => {
    const itemClasses = [
        'card-item',
        className,
        onClick ? 'card-item-clickable' : ''
    ].filter(Boolean).join(' ');

    return (
        <div 
            className={itemClasses}
            onClick={onClick}
            onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
            style={onClick ? {cursor: 'pointer'} : undefined}
        >
            <span className="card-item-label">{label}</span>
            {value && (
                badge ? <Badge>{value}</Badge> : <span>{value}</span>
            )}
            {children}
        </div>
    );
};

export default CardItem; 