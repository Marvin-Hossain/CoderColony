import React from 'react';
import './CategoryTabs.css';

interface Category {
    id: string;
    label: string;
}

interface CategoryTabsProps {
    categories: Category[];
    selectedCategory: string;
    onCategoryChange: (categoryId: string) => void;
}

const CategoryTabs = ({
    categories,
    selectedCategory,
    onCategoryChange
}: CategoryTabsProps) => (
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