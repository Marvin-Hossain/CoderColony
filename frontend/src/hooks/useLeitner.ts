import { useCallback } from 'react';
import { UserCardProgress } from '../types/flashcards';

// Leitner box intervals in days [0,1,3,7,14,30]
const LEITNER_INTERVALS = [0, 1, 3, 7, 14, 30];
const MAX_BOX_LEVEL = 5;

export interface LeitnerResult {
  newBoxLevel: number;
  nextReviewDate: string;
}

export const useLeitner = () => {
  const processAnswer = useCallback((
    cardProgress: Partial<UserCardProgress>,
    isCorrect: boolean
  ): LeitnerResult => {
    const currentBox = cardProgress.boxLevel || 0;
    
    let newBoxLevel: number;
    if (isCorrect) {
      // Move to next box (up to max level)
      newBoxLevel = Math.min(currentBox + 1, MAX_BOX_LEVEL);
    } else {
      // Reset to box 0 for incorrect answers
      newBoxLevel = 0;
    }
    
    // Calculate next review date based on new box level
    const intervalDays = LEITNER_INTERVALS[newBoxLevel];
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + intervalDays);
    
    return {
      newBoxLevel,
      nextReviewDate: nextReviewDate.toISOString(),
    };
  }, []);

  const getDueCards = useCallback((
    allCards: Array<{ cardId: string; progress?: UserCardProgress }>
  ): string[] => {
    const now = new Date();
    
    return allCards
      .filter(({ progress }) => {
        if (!progress || !progress.nextReview) {
          // New cards are always due
          return true;
        }
        
        const nextReviewDate = new Date(progress.nextReview);
        return nextReviewDate <= now;
      })
      .map(({ cardId }) => cardId);
  }, []);

  const getBoxDistribution = useCallback((
    cardProgresses: UserCardProgress[]
  ): Record<number, number> => {
    const distribution: Record<number, number> = {};
    
    // Initialize all boxes with 0
    for (let i = 0; i <= MAX_BOX_LEVEL; i++) {
      distribution[i] = 0;
    }
    
    // Count cards in each box
    cardProgresses.forEach(progress => {
      const box = progress.boxLevel || 0;
      distribution[box] = (distribution[box] || 0) + 1;
    });
    
    return distribution;
  }, []);

  return {
    processAnswer,
    getDueCards,
    getBoxDistribution,
    LEITNER_INTERVALS,
    MAX_BOX_LEVEL,
  };
}; 