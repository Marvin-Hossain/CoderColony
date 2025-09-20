import { createSlice, createEntityAdapter, PayloadAction } from '@reduxjs/toolkit';
import { Deck } from '../../types/flashcards';
import { RootState } from '../store';

const decksAdapter = createEntityAdapter<Deck>({
  sortComparer: (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
});

interface FlashcardsState {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: FlashcardsState & ReturnType<typeof decksAdapter.getInitialState> = decksAdapter.getInitialState({
  status: 'idle',
  error: null,
});

const flashcardsSlice = createSlice({
  name: 'flashcards',
  initialState,
  reducers: {
    setLoading: (state) => {
      state.status = 'loading';
      state.error = null;
    },
    setSuccess: (state) => {
      state.status = 'succeeded';
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.status = 'failed';
      state.error = action.payload;
    },
    deckAdded: decksAdapter.addOne,
    deckUpdated: decksAdapter.updateOne,
    deckRemoved: decksAdapter.removeOne,
    decksReceived: decksAdapter.setAll,
  },
});

export const {
  setLoading,
  setSuccess,
  setError,
  deckAdded,
  deckUpdated,
  deckRemoved,
  decksReceived,
} = flashcardsSlice.actions;

export const {
  selectAll: selectAllDecks,
  selectById: selectDeckById,
  selectIds: selectDeckIds,
} = decksAdapter.getSelectors((state: RootState) => state.flashcards);

export default flashcardsSlice.reducer; 