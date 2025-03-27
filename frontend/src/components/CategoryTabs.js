import React from 'react';
import './CategoryTabs.css';

const CategoryTabs = ({ categories, selectedCategory, onCategoryChange }) => (
    <div className="category-tabs">
        {categories.map((category) => (
            <button
                key={category.id}
                className={`category-tab ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => onCategoryChange(category.id)}
            >
                {category.label}
            </button>
        ))}
    </div>
);

export default React.memo(CategoryTabs); 