import React from 'react';
import { cn } from '../lib/cn';

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
  const isLeft = selectedValue === leftValue;
  const isRight = selectedValue === rightValue;

  return (
    <div
      className={cn(
        'tw-flex tw-items-center tw-justify-center tw-mx-auto tw-mb-[30px] tw-w-fit tw-max-w-full',
        'tw-bg-blue-600 tw-shadow-lg tw-rounded-full tw-p-1'
      )}
      role="tablist"
      aria-label={`${leftOption} / ${rightOption} toggle`}
    >
      <button
        className={cn(
          'tw-cursor-pointer tw-px-5 tw-py-2 tw-text-sm md:tw-text-base tw-rounded-full tw-transition-all tw-duration-200 tw-ease-in-out',
          'tw-font-medium tw-border-0 tw-outline-none focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-white/30',
          isLeft ? [
            'tw-bg-white tw-text-[#1E3A8A] tw-font-semibold',
            'tw-shadow-sm tw-shadow-black/20'
          ] : [
            'tw-bg-transparent tw-text-white tw-font-medium',
            'hover:tw-bg-white/20 hover:tw-text-white'
          ]
        )}
        type="button"
        onClick={() => onChange(leftValue)}
        role="tab"
        aria-selected={isLeft}
        aria-controls={`${id}-panel-left`}
        id={`${id}-tab-left`}
      >
        {leftOption}
      </button>
      <button
        className={cn(
          'tw-cursor-pointer tw-px-5 tw-py-2 tw-text-sm md:tw-text-base tw-rounded-full tw-transition-all tw-duration-200 tw-ease-in-out',
          'tw-font-medium tw-border-0 tw-outline-none focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-white/30',
          isRight ? [
            'tw-bg-white tw-text-[#1E3A8A] tw-font-semibold',
            'tw-shadow-sm tw-shadow-black/20'
          ] : [
            'tw-bg-transparent tw-text-white tw-font-medium',
            'hover:tw-bg-white/20 hover:tw-text-white'
          ]
        )}
        type="button"
        onClick={() => onChange(rightValue)}
        role="tab"
        aria-selected={isRight}
        aria-controls={`${id}-panel-right`}
        id={`${id}-tab-right`}
      >
        {rightOption}
      </button>
    </div>
  );
};

export default ToggleSwitch; 