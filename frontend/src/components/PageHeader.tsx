import React from 'react';
import Button from './Button';
import './PageHeader.css';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    onBack: () => void;
    rightButton?: React.ReactNode;
}

const PageHeader = ({
    title,
    subtitle,
    onBack,
    rightButton
}: PageHeaderProps) => (
    <header className="page-header">
        <Button 
            text="Back" 
            onClick={onBack} 
            className="back-button"
        />
        <div className="page-header-titles">
            <h1>{title}</h1>
            {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
        </div>
        {rightButton && <div className="page-header-right">{rightButton}</div>}
    </header>
);

export default PageHeader; 