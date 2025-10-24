import React from 'react';
import { cn } from '@/lib/cn';
import { progressTrackStyles, progressFillStyles } from '@/components/ui/progress';

interface FlashcardProgressBarProps {
  current: number;
  total: number;
  correctCount?: number;
  incorrectCount?: number;
  showStats?: boolean;
}

const FlashcardProgressBar: React.FC<FlashcardProgressBarProps> = ({
  current,
  total,
  correctCount = 0,
  incorrectCount = 0,
  showStats = false
}) => {
  const percentage = total > 0 ? (current / total) * 100 : 0;
  const accuracy = (correctCount + incorrectCount) > 0 
    ? (correctCount / (correctCount + incorrectCount)) * 100 
    : 0;

  return (
    <div className="tw-space-y-3 tw-rounded-2xl tw-border tw-bg-card tw-p-6 tw-shadow-lg">
      <div className="tw-flex tw-items-center tw-justify-between">
        <div className="tw-text-lg tw-font-semibold tw-text-primary">
          {current} <span className="text-muted-foreground">/</span> {total}
        </div>
        {showStats && (correctCount + incorrectCount) > 0 && (
          <div className="tw-inline-flex tw-items-center tw-rounded-full tw-bg-primary/10 tw-px-3 tw-py-1 tw-text-xs tw-font-semibold tw-text-primary">
            {accuracy.toFixed(0)}% correct
          </div>
        )}
      </div>

      <div className={cn(progressTrackStyles({ size: 'sm' }))}>
        <div
          className={cn(progressFillStyles())}
          style={{width: `${percentage}%`}}
        />
      </div>

      {showStats && (
        <div className="tw-flex tw-items-center tw-gap-4 tw-text-xs text-muted-foreground">
          <span>Correct: <strong className="text-success">{correctCount}</strong></span>
          <span>Incorrect: <strong className="text-danger">{incorrectCount}</strong></span>
        </div>
      )}
    </div>
  );
};

export default FlashcardProgressBar;
