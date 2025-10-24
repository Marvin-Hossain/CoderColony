import React from 'react';
import './DiagonalGoalCard.css';

export interface DiagonalGoalCardProps {
  title: string;
  subtitle: string;
  value: number;
  target: number;
  bgColor: string; // e.g. 'orange', 'purple' token to map to CSS class
  unit?: string;
  onClick?: () => void;
}

function getBgClass(token: string) {
  switch (token) {
    case 'bg-orange-500':
    case 'orange':
      return 'dg-bg-orange';
    case 'bg-purple-600':
    case 'purple':
      return 'dg-bg-purple';
    default:
      return 'dg-bg-blue';
  }
}

export function DiagonalGoalCard({
  title,
  subtitle,
  value,
  target,
  bgColor,
  unit,
  onClick,
}: Readonly<DiagonalGoalCardProps>) {
  const percentage = Math.max(0, Math.min(100, Math.round((value / (target || 1)) * 100)));
  const bgClass = getBgClass(bgColor);
  const interactiveProps = onClick
    ? { role: 'button' as const, tabIndex: 0, onClick, onKeyDown: (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } }
    : {};

  return (
    <div className={`dg-card ${bgClass} ${onClick ? 'dg-interactive' : ''}`} {...interactiveProps}>
      <div className="dg-decor" aria-hidden="true" />
      <div className="dg-content">
        <div className="dg-top">
          <div className="dg-subtitle">{subtitle}</div>
          <h3 className="dg-title">{title}</h3>
        </div>
        <div className="dg-bottom">
          <div className="dg-value">
            <span className="dg-value-number">{value}</span>
            {unit ? <span className="dg-unit"> {unit}</span> : null}
            <span className="dg-target"> / {target}</span>
          </div>
          <div className="dg-progress">
            <div className="dg-progress-fill" style={{ width: `${percentage}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DiagonalGoalCard;


