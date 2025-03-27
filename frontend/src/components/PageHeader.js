import React from 'react';
import Button from './Button';
import './PageHeader.css';

const PageHeader = ({ title, subtitle, onBack, rightButton }) => (
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