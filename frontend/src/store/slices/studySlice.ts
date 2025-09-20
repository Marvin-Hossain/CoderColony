import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { StudySession, Card } from '../../types/flashcards';

interface StudyState {
  currentSession: StudySession | null;
  isFlipped: boolean;
  sessionStats: {
    totalCards: number;
    correctCount: number;
    incorrectCount: number;
    startTime: string | null;
  };
}

const initialState: StudyState = {
  currentSession: null,
  isFlipped: false,
  sessionStats: {
    totalCards: 0,
    correctCount: 0,
    incorrectCount: 0,
    startTime: null,
  },
};

const studySlice = createSlice({
  name: 'study',
  initialState,
  reducers: {
    startSession: (state, action: PayloadAction<{ deckId: string; cards: Card[] }>) => {
      const { deckId, cards } = action.payload;
      state.currentSession = {
        deckId,
        currentCardIndex: 0,
        queue: cards,
        settings: {
          shuffle: false,
          showHints: true,
        },
        boxMap: {},
      };
      state.sessionStats = {
        totalCards: cards.length,
        correctCount: 0,
        incorrectCount: 0,
        startTime: new Date().toISOString(),
      };
      state.isFlipped = false;
    },
    flipCard: (state) => {
      state.isFlipped = !state.isFlipped;
    },
    nextCard: (state) => {
      if (state.currentSession && state.currentSession.currentCardIndex < state.currentSession.queue.length - 1) {
        state.currentSession.currentCardIndex += 1;
        state.isFlipped = false;
      }
    },
    previousCard: (state) => {
      if (state.currentSession && state.currentSession.currentCardIndex > 0) {
        state.currentSession.currentCardIndex -= 1;
        state.isFlipped = false;
      }
    },
    markAnswer: (state, action: PayloadAction<{ isCorrect: boolean }>) => {
      if (action.payload.isCorrect) {
        state.sessionStats.correctCount += 1;
      } else {
        state.sessionStats.incorrectCount += 1;
      }
    },
    updateSettings: (state, action: PayloadAction<Partial<StudySession['settings']>>) => {
      if (state.currentSession) {
        state.currentSession.settings = {
          ...state.currentSession.settings,
          ...action.payload,
        };
      }
    },
    shuffleCards: (state) => {
      if (state.currentSession) {
        const cards = [...state.currentSession.queue];
        for (let i = cards.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [cards[i], cards[j]] = [cards[j], cards[i]];
        }
        state.currentSession.queue = cards;
        state.currentSession.currentCardIndex = 0;
        state.isFlipped = false;
      }
    },
    endSession: (state) => {
      state.currentSession = null;
      state.isFlipped = false;
      state.sessionStats = {
        totalCards: 0,
        correctCount: 0,
        incorrectCount: 0,
        startTime: null,
      };
    },
  },
});

export const {
  startSession,
  flipCard,
  nextCard,
  previousCard,
  markAnswer,
  updateSettings,
  shuffleCards,
  endSession,
} = studySlice.actions;

export default studySlice.reducer; 