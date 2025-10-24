import React from 'react';
import './WeekStreak.css';
import { cn } from '@/lib/cn';

export interface WeekStreakProps {
  readonly title: string;
  readonly days: readonly boolean[]; // length 7
  readonly streak: number;
  readonly dayLabels?: readonly string[];
  readonly showStreakBadge?: boolean;
  readonly onClick?: () => void;
}

const defaultDayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function WeekStreak({
  title,
  days,
  streak,
  dayLabels = defaultDayLabels,
  showStreakBadge = true,
  onClick,
}: WeekStreakProps) {
  const interactiveProps = onClick
    ? { role: 'button' as const, tabIndex: 0, onClick, onKeyDown: (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } }
    : {};

  return (
    <div className={cn('wstreak', onClick ? 'wstreak-interactive' : '', 'tw-bg-card tw-border tw-rounded-[1rem] tw-p-6')} {...interactiveProps}>
      <div className="wstreak-header tw-flex tw-items-center tw-justify-between tw-mb-4">
        <h3 className="wstreak-title tw-text-[#0f172a] tw-text-lg tw-m-0">{title}</h3>
        {showStreakBadge && (
          <div className="wstreak-badge tw-inline-flex tw-items-center tw-gap-2" aria-label={`${streak} day streak`}>
            <div className="wstreak-badge-circle tw-w-6 tw-h-6 tw-rounded-full tw-bg-[#2563eb] tw-text-white tw-flex tw-items-center tw-justify-center tw-text-xs tw-font-bold">{streak}</div>
            <span className="wstreak-badge-label tw-text-sm text-muted-foreground">day streak</span>
          </div>
        )}
      </div>
      <div className="wstreak-days tw-grid" style={{ gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '0.5rem' }}>
        {days.slice(0, 7).map((done, idx) => (
          <div className="wstreak-day tw-flex" key={`${title}-${idx}`} aria-label={`${dayLabels[idx]} ${done ? 'completed' : 'not completed'}`}>
            <div className={cn('wstreak-day-inner tw-w-full tw-rounded-xl tw-flex tw-items-center tw-justify-center tw-text-xs tw-transition', done ? 'tw-scale-[1.05] tw-bg-[#2563eb] tw-text-white' : 'tw-bg-[#f3f4f6] tw-text-[#9ca3af]')}>{dayLabels[idx]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WeekStreak;


