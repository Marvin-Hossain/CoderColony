import React from 'react';
import Button from './Button';
import './PageHeader.css';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    onBack: () => void;
    rightButton?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    subtitle,
    onBack,
    rightButton
}) => (
    <header className="page-header">
        <Button 
            text="Back" 
            onClick={onBack} 
            className="back-button"
        />
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
        {rightButton}
    </header>
);

export default PageHeader; 