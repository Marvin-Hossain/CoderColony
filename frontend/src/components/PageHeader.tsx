import React from 'react';
import './PageHeader.css';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    rightButton?: React.ReactNode;
}

const PageHeader = ({
    title,
    subtitle,
    rightButton
}: PageHeaderProps) => (
    <header className="page-header">
        <div className="page-header-titles">
            <h1>{title}</h1>
            {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
        </div>
        {rightButton && <div className="page-header-right">{rightButton}</div>}
    </header>
);

export default PageHeader; 