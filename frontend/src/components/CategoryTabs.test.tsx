import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CategoryTabs from './CategoryTabs';

describe('CategoryTabs', () => {
  const categories = [
    { id: 'cat1', label: 'Category 1' },
    { id: 'cat2', label: 'Category 2' }
  ];

  it('renders all category tabs', () => {
    render(
      <CategoryTabs 
        categories={categories} 
        selectedCategory="cat1" 
        onCategoryChange={() => {}} 
      />
    );
    
    expect(screen.getByText('Category 1')).toBeInTheDocument();
    expect(screen.getByText('Category 2')).toBeInTheDocument();
  });

  it('applies active class to selected category', () => {
    render(
      <CategoryTabs 
        categories={categories} 
        selectedCategory="cat1" 
        onCategoryChange={() => {}} 
      />
    );
    
    expect(screen.getByText('Category 1').closest('button')).toHaveClass('active');
    expect(screen.getByText('Category 2').closest('button')).not.toHaveClass('active');
  });

  it('calls onCategoryChange with correct ID when clicked', async () => {
    const mockOnChange = vi.fn();
    render(
      <CategoryTabs 
        categories={categories} 
        selectedCategory="cat1" 
        onCategoryChange={mockOnChange} 
      />
    );
    
    await userEvent.click(screen.getByText('Category 2'));
    expect(mockOnChange).toHaveBeenCalledWith('cat2');
  });
});
