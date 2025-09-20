import React from 'react';
import './FlashcardToggle.css';

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

  const sizeClass = `flashcard-toggle--${size}`;
  const checkedClass = checked ? 'flashcard-toggle--checked' : '';
  const disabledClass = disabled ? 'flashcard-toggle--disabled' : '';

  return (
    <div className={`flashcard-toggle ${sizeClass} ${checkedClass} ${disabledClass}`}>
      <button
        className="flashcard-toggle-button"
        onClick={handleToggle}
        disabled={disabled}
        aria-pressed={checked}
        aria-label={`${checked ? 'Disable' : 'Enable'} ${label}`}
      >
        <div className="flashcard-toggle-track">
          <div className="flashcard-toggle-thumb" />
        </div>
      </button>
      <div className="flashcard-toggle-label">
        {icon && <span className="flashcard-toggle-icon">{icon}</span>}
        <span className="flashcard-toggle-text">{label}</span>
      </div>
    </div>
  );
};

export default FlashcardToggle; 