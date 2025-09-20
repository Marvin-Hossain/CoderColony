import { configureStore } from '@reduxjs/toolkit';
import flashcardsSlice from './slices/flashcardsSlice';
import studySlice from './slices/studySlice';
import { flashcardsApi } from '../services/flashcardsApi';

export const store = configureStore({
  reducer: {
    flashcards: flashcardsSlice,
    study: studySlice,
    [flashcardsApi.reducerPath]: flashcardsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(flashcardsApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 