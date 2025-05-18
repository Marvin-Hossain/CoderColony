import React from 'react';
import './ToggleSwitch.css';

interface ToggleSwitchProps {
  leftOption: string;
  rightOption: string;
  leftValue: string;
  rightValue: string;
  selectedValue: string;
  onChange: (value: string) => void;
  id?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  leftOption,
  rightOption,
  leftValue,
  rightValue,
  selectedValue,
  onChange,
  id = 'toggle-switch'
}) => {
  return (
    <div className="toggle-switch-container">
      <div 
        className={`toggle-option left-option ${selectedValue === leftValue ? 'active' : ''}`}
        onClick={() => onChange(leftValue)}
      >
        {leftOption}
      </div>
      <div className="toggle-switch">
        <input
          type="checkbox"
          checked={selectedValue === rightValue}
          onChange={() => onChange(selectedValue === leftValue ? rightValue : leftValue)}
          className="toggle-switch-checkbox"
          id={id}
        />
        <label className="toggle-switch-label" htmlFor={id}>
          <span className="toggle-switch-inner"></span>
          <span className="toggle-switch-switch"></span>
        </label>
      </div>
      <div 
        className={`toggle-option right-option ${selectedValue === rightValue ? 'active' : ''}`}
        onClick={() => onChange(rightValue)}
      >
        {rightOption}
      </div>
    </div>
  );
};

export default ToggleSwitch; 