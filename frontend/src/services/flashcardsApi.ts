import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Deck, Card, UserDeckProgress, UserCardProgress } from '../types/flashcards';

// Mock data for development
const mockDecks: Deck[] = [
  {
    id: '1',
    deckId: '1',
    title: 'JavaScript Fundamentals',
    description: 'Essential JavaScript concepts for interviews',
    tags: ['javascript', 'fundamentals', 'interview'],
    difficulty: 2,
    language: 'en',
    isOfficial: true,
    isPublic: true,
    viewCount: 1250,
    likeCount: 89,
    creatorId: 'system',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T15:30:00Z',
  },
  {
    id: '2',
    deckId: '2',
    title: 'React Hooks',
    description: 'Master React Hooks with practical examples',
    tags: ['react', 'hooks', 'frontend'],
    difficulty: 3,
    language: 'en',
    isOfficial: true,
    isPublic: true,
    viewCount: 2100,
    likeCount: 156,
    creatorId: 'system',
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-25T11:45:00Z',
  },
  {
    id: '3',
    deckId: '3',
    title: 'System Design Basics',
    description: 'Fundamental concepts for system design interviews',
    tags: ['system-design', 'scalability', 'architecture'],
    difficulty: 4,
    language: 'en',
    isOfficial: true,
    isPublic: true,
    viewCount: 3200,
    likeCount: 248,
    creatorId: 'system',
    createdAt: '2024-01-05T14:00:00Z',
    updatedAt: '2024-01-30T16:20:00Z',
  },
];

const mockCards: Record<string, Card[]> = {
  '1': [
    {
      cardId: '1-1',
      deckId: '1',
      frontText: 'What is hoisting in JavaScript?',
      backText: 'Hoisting is JavaScript\'s default behavior of moving declarations to the top of their scope. Variables declared with var and function declarations are hoisted.',
      hint: 'Think about what happens during the execution context creation phase',
      sortOrder: 1,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
    },
    {
      cardId: '1-2',
      deckId: '1',
      frontText: 'Explain the difference between == and === in JavaScript',
      backText: '== performs type coercion before comparison, while === performs strict equality comparison without type coercion.',
      hint: 'One is loose equality, the other is strict equality',
      sortOrder: 2,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
    },
    {
      cardId: '1-3',
      deckId: '1',
      frontText: 'What is a closure in JavaScript?',
      backText: 'A closure is a function that retains access to variables from its outer (enclosing) scope even after the outer function has finished executing.',
      hint: 'Think about scope and function execution context',
      sortOrder: 3,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
    },
  ],
  '2': [
    {
      cardId: '2-1',
      deckId: '2',
      frontText: 'What is the useEffect hook used for?',
      backText: 'useEffect is used to perform side effects in functional components, such as data fetching, subscriptions, or manually changing the DOM.',
      hint: 'Think about what happens after render',
      sortOrder: 1,
      createdAt: '2024-01-10T09:00:00Z',
      updatedAt: '2024-01-10T09:00:00Z',
    },
    {
      cardId: '2-2',
      deckId: '2',
      frontText: 'How do you prevent unnecessary re-renders with React.memo?',
      backText: 'React.memo is a higher-order component that memoizes the result and only re-renders if its props have changed.',
      hint: 'Think about performance optimization',
      sortOrder: 2,
      createdAt: '2024-01-10T09:00:00Z',
      updatedAt: '2024-01-10T09:00:00Z',
    },
  ],
  '3': [
    {
      cardId: '3-1',
      deckId: '3',
      frontText: 'What is load balancing?',
      backText: 'Load balancing distributes incoming network traffic across multiple servers to ensure no single server becomes overwhelmed.',
      hint: 'Think about distributing work across multiple resources',
      sortOrder: 1,
      createdAt: '2024-01-05T14:00:00Z',
      updatedAt: '2024-01-05T14:00:00Z',
    },
  ],
};

// TODO: Replace with real API base URL when backend is ready
export const flashcardsApi = createApi({
  reducerPath: 'flashcardsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api', // TODO: link to backend
  }),
  tagTypes: ['Deck', 'Card', 'Progress'],
  endpoints: (builder) => ({
    getDecks: builder.query<Deck[], { mine?: boolean }>({
      queryFn: async ({ mine } = {}) => {
        // Mock implementation
        await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay
        let filteredDecks = mockDecks;
        
        if (mine) {
          // Filter for user's decks - for now, return empty array as user hasn't created any
          filteredDecks = [];
        }
        
        return { data: filteredDecks };
      },
      providesTags: ['Deck'],
    }),
    
    getDeckById: builder.query<Deck, string>({
      queryFn: async (deckId) => {
        await new Promise((resolve) => setTimeout(resolve, 300));
        const deck = mockDecks.find(d => d.deckId === deckId);
        if (!deck) {
          return { error: { status: 404, data: 'Deck not found' } };
        }
        return { data: deck };
      },
      providesTags: (_result, _error, id) => [{ type: 'Deck', id }],
    }),
    
    createDeck: builder.mutation<Deck, Omit<Deck, 'id' | 'deckId' | 'createdAt' | 'updatedAt' | 'viewCount' | 'likeCount'>>({
      queryFn: async (newDeck) => {
        await new Promise((resolve) => setTimeout(resolve, 800));
        const deck: Deck = {
          ...newDeck,
          id: Date.now().toString(),
          deckId: Date.now().toString(),
          viewCount: 0,
          likeCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return { data: deck };
      },
      invalidatesTags: ['Deck'],
    }),
    
    updateDeck: builder.mutation<Deck, { id: string; updates: Partial<Deck> }>({
      queryFn: async ({ id, updates }) => {
        await new Promise((resolve) => setTimeout(resolve, 600));
        const existingDeck = mockDecks.find(d => d.id === id);
        if (!existingDeck) {
          return { error: { status: 404, data: 'Deck not found' } };
        }
        const updatedDeck = { ...existingDeck, ...updates, updatedAt: new Date().toISOString() };
        return { data: updatedDeck };
      },
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Deck', id }],
    }),
    
    deleteDeck: builder.mutation<void, string>({
      queryFn: async (_id) => {
        await new Promise((resolve) => setTimeout(resolve, 400));
        return { data: undefined };
      },
      invalidatesTags: ['Deck'],
    }),
    
    getCards: builder.query<Card[], string>({
      queryFn: async (deckId) => {
        await new Promise((resolve) => setTimeout(resolve, 300));
        const cards = mockCards[deckId] || [];
        return { data: cards };
      },
      providesTags: (result, _error, deckId) => [
        { type: 'Card', id: deckId },
        ...(result?.map(({ cardId }) => ({ type: 'Card' as const, id: cardId })) || []),
      ],
    }),
    
    createCard: builder.mutation<Card, Omit<Card, 'cardId' | 'createdAt' | 'updatedAt'>>({
      queryFn: async (newCard) => {
        await new Promise((resolve) => setTimeout(resolve, 600));
        const card: Card = {
          ...newCard,
          cardId: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return { data: card };
      },
      invalidatesTags: (_result, _error, { deckId }) => [{ type: 'Card', id: deckId }],
    }),
    
    updateCard: builder.mutation<Card, { cardId: string; updates: Partial<Card> }>({
      queryFn: async ({ cardId, updates }) => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        // Find the card in mockCards
        let foundCard: Card | undefined;
        for (const deckCards of Object.values(mockCards)) {
          foundCard = deckCards.find(c => c.cardId === cardId);
          if (foundCard) break;
        }
        
        if (!foundCard) {
          return { error: { status: 404, data: 'Card not found' } };
        }
        
        const updatedCard = { ...foundCard, ...updates, updatedAt: new Date().toISOString() };
        return { data: updatedCard };
      },
      invalidatesTags: (_result, _error, { cardId }) => [{ type: 'Card', id: cardId }],
    }),
    
    deleteCard: builder.mutation<void, string>({
      queryFn: async (_cardId) => {
        await new Promise((resolve) => setTimeout(resolve, 400));
        return { data: undefined };
      },
      invalidatesTags: (_result, _error, cardId) => [{ type: 'Card', id: cardId }],
    }),
    
    upvoteDeck: builder.mutation<void, string>({
      queryFn: async (_deckId) => {
        await new Promise((resolve) => setTimeout(resolve, 200));
        return { data: undefined };
      },
      invalidatesTags: (_result, _error, deckId) => [{ type: 'Deck', id: deckId }],
    }),
    
    logView: builder.mutation<void, string>({
      queryFn: async (_deckId) => {
        // Fire-and-forget analytics call
        return { data: undefined };
      },
    }),

    getUserDeckProgress: builder.query<UserDeckProgress, string>({
        query: (deckId) => `/progress/deck/${deckId}`,
        providesTags: (_result, _error, deckId) => [{ type: 'Progress', id: deckId }],
    }),

    getUserCardProgress: builder.query<UserCardProgress[], string>({
        query: (deckId) => `/progress/deck/${deckId}/cards`,
        providesTags: (_result, _error, deckId) => [{ type: 'Progress', id: `cards-${deckId}` }],
    }),

    updateCardProgress: builder.mutation<UserCardProgress, {
        cardId: string;
        deckId: string;
        isCorrect: boolean;
        boxLevel?: number;
        nextReview?: string;
    }>({
        query: ({ cardId, ...body }) => ({
            url: `/progress/card/${cardId}`,
            method: 'POST',
            body,
        }),
        invalidatesTags: (_result, _error, { deckId }) => [{ type: 'Progress', id: deckId }, { type: 'Progress', id: `cards-${deckId}` }],
    }),

    saveStudySession: builder.mutation<void, {
        deckId: string;
        sessionStats: {
            totalCards: number;
            correctCount: number;
            incorrectCount: number;
            duration: number; // in minutes
            startTime: string;
            endTime: string;
        };
    }>({
        query: ({ deckId, sessionStats }) => ({
            url: `/progress/deck/${deckId}/session`,
            method: 'POST',
            body: sessionStats,
        }),
        invalidatesTags: (_result, _error, { deckId }) => [{ type: 'Progress', id: deckId }],
    }),

    getDueCards: builder.query<{cardId: string; dueDate: string}[], string>({
        query: (deckId) => `/progress/deck/${deckId}/due`,
        providesTags: (_result, _error, deckId) => [{ type: 'Progress', id: `due-${deckId}` }],
    }),
  }),
});

export const {
  useGetDecksQuery,
  useGetDeckByIdQuery,
  useCreateDeckMutation,
  useUpdateDeckMutation,
  useDeleteDeckMutation,
  useGetCardsQuery,
  useCreateCardMutation,
  useUpdateCardMutation,
  useDeleteCardMutation,
  useUpvoteDeckMutation,
  useLogViewMutation,
  useGetUserDeckProgressQuery,
  useGetUserCardProgressQuery,
  useUpdateCardProgressMutation,
  useSaveStudySessionMutation,
  useGetDueCardsQuery,
} = flashcardsApi; 