import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from './Button';

describe('Button', () => {
  it('renders with the correct text', () => {
    render(<Button text="Click me" />);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', async () => {
    const handleClick = vi.fn();
    render(<Button text="Click me" onClick={handleClick} />);
    
    await userEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies custom className correctly', () => {
    render(<Button text="Click me" className="test-class" />);
    const button = screen.getByText('Click me');
    
    expect(button).toHaveClass('custom-button');
    expect(button).toHaveClass('test-class');
  });

  it('can be disabled', () => {
    render(<Button text="Click me" disabled={true} />);
    expect(screen.getByText('Click me')).toBeDisabled();
  });

  it('applies the correct button type', () => {
    render(<Button text="Submit" type="submit" />);
    expect(screen.getByText('Submit')).toHaveAttribute('type', 'submit');
  });
});
