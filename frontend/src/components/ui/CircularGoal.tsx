import React from 'react';
import './CircularGoal.css';

export type CircularGoalSize = 'sm' | 'md' | 'lg';

export interface CircularGoalProps {
  title: string;
  current: number;
  total: number;
  color: string;
  disabled?: boolean;
  size?: CircularGoalSize;
  onClick?: () => void;
}

function getSizeMetrics(size: CircularGoalSize) {
  switch (size) {
    case 'sm':
      return { width: 80, height: 80, radius: 35, textSizeClass: 'text-lg' };
    case 'lg':
      return { width: 144, height: 144, radius: 55, textSizeClass: 'text-3xl' };
    case 'md':
    default:
      return { width: 112, height: 112, radius: 45, textSizeClass: 'text-2xl' };
  }
}

export function CircularGoal({
  title,
  current,
  total,
  color,
  disabled = false,
  size = 'md',
  onClick,
}: CircularGoalProps) {
  const { width, height, radius, textSizeClass } = getSizeMetrics(size);
  const clampedTotal = total > 0 ? total : 1;
  const percentage = Math.max(0, Math.min(100, (current / clampedTotal) * 100));
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const interactiveProps = onClick
    ? { role: 'button' as const, tabIndex: 0, onClick, onKeyDown: (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } }
    : {};

  return (
    <div
      className={`cgoal ${disabled ? 'cgoal-disabled' : ''} ${onClick ? 'cgoal-interactive' : ''}`}
      aria-label={`${title} ${Math.round(percentage)} percent`}
      {...interactiveProps}
    >
      <div className="cgoal-ring" style={{ width, height }}>
        <svg
          className="cgoal-svg"
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          aria-hidden="true"
        >
          <g transform={`translate(${width / 2}, ${height / 2}) rotate(-90)`}>
            <circle
              className="cgoal-track"
              r={radius}
              cx={0}
              cy={0}
              strokeWidth={8}
              fill="none"
            />
            <circle
              className="cgoal-progress"
              r={radius}
              cx={0}
              cy={0}
              strokeWidth={8}
              stroke={color}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="none"
            />
          </g>
        </svg>
        <div className="cgoal-center">
          <div className={`cgoal-value ${textSizeClass}`}>{current}/{clampedTotal}</div>
        </div>
      </div>
      <div className="cgoal-title">{title}</div>
      {disabled && <div className="cgoal-soon">Soon</div>}
    </div>
  );
}

export default CircularGoal;


