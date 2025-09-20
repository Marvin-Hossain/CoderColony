import React from 'react';
import './FlashcardProgressBar.css';

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
    <div className="flashcard-progress-bar">
      <div className="flashcard-progress-bar-header">
        <div className="flashcard-progress-bar-text">
          <span className="flashcard-progress-bar-current">{current}</span>
          <span className="flashcard-progress-bar-separator"> / </span>
          <span className="flashcard-progress-bar-total">{total}</span>
        </div>
        {showStats && (correctCount + incorrectCount) > 0 && (
          <div className="flashcard-progress-bar-accuracy">
            {accuracy.toFixed(0)}% correct
          </div>
        )}
      </div>
      
      <div className="flashcard-progress-bar-track">
        <div 
          className="flashcard-progress-bar-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {showStats && (
        <div className="flashcard-progress-bar-stats">
          <div className="flashcard-progress-bar-stat correct">
            <span className="flashcard-progress-bar-stat-label">Correct:</span>
            <span className="flashcard-progress-bar-stat-value">{correctCount}</span>
          </div>
          <div className="flashcard-progress-bar-stat incorrect">
            <span className="flashcard-progress-bar-stat-label">Incorrect:</span>
            <span className="flashcard-progress-bar-stat-value">{incorrectCount}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashcardProgressBar; 