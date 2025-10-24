import React from 'react';
// legacy CSS removed after Tailwind/CVA migration
import { categoryTabStyles } from './ui/category-tabs';
import { cn } from '../lib/cn';

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
    <div
        className={cn(
            // default mobile layout: row with small gap; md+ switches to column
            'tw-flex tw-w-full tw-mb-5 tw-text-center',
            'tw-flex-row tw-gap-[10px] md:tw-flex-col md:tw-gap-0'
        )}
    >
        {categories.map((category) => {
            const isActive = selectedCategory === category.id;
            return (
                <button
                    key={category.id}
                    className={cn(
                        categoryTabStyles({ active: isActive }),
                        // mobile-specific sizing
                        'tw-p-[10px] md:tw-py-2 md:tw-px-4'
                    )}
                    onClick={() => onCategoryChange(category.id)}
                    data-category={category.id}
                    type="button"
                >
                    {category.label}
                </button>
            );
        })}
    </div>
);

export default React.memo(CategoryTabs); 