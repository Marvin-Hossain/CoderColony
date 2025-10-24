import React from 'react';
import { pillButtonStyles } from '@/components/ui/pillButton';
import { cn } from '@/lib/cn';

interface FlashcardToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  icon?: React.ReactNode;
}

const FlashcardToggle: React.FC<FlashcardToggleProps> = ({
  label,
  checked,
  onChange,
  disabled = false,
  size = 'medium',
  icon
}) => {
  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  let resolvedSize: 'sm' | 'md' | 'lg' = 'md';
  if (size === 'small') resolvedSize = 'sm';
  else if (size === 'large') resolvedSize = 'lg';

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={disabled}
      aria-pressed={checked}
      aria-label={`${checked ? 'Disable' : 'Enable'} ${label}`}
      className={cn(
        pillButtonStyles({
          intent: checked ? 'primary' : 'default',
          size: resolvedSize,
          disabled
        }),
        'tw-font-semibold'
      )}
      style={{transition: 'transform 0.15s ease'}}
    >
      {icon && (
        <span className={checked ? 'text-primary-foreground' : 'text-muted-foreground'}>
          {icon}
        </span>
      )}
      <span>{label}</span>
    </button>
  );
};

export default FlashcardToggle;
