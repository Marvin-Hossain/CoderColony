import React from 'react';

interface MicIconProps {
  isActive?: boolean;
  className?: string;
}

const MicIcon: React.FC<MicIconProps> = ({ isActive = false, className = '' }) => {
  const activeColor = '#4d6bfe';
  const inactiveColor = '#333333';
  const color = isActive ? activeColor : inactiveColor;
  
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      width="24" 
      height="24" 
      fill="none" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
      <line x1="12" y1="19" x2="12" y2="23"></line>
      <line x1="8" y1="23" x2="16" y2="23"></line>
    </svg>
  );
};

export default MicIcon; 