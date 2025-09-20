export interface Deck {
  id: string; // Required by RTK Entity Adapter
  deckId: string; // UUID
  title: string;
  description?: string;
  tags: string[];
  difficulty: 0 | 1 | 2 | 3 | 4 | 5;
  language: string;
  isOfficial: boolean;
  isPublic: boolean;
  viewCount: number;
  likeCount: number; // derived
  creatorId: string;
  createdAt: string; // ISO
  updatedAt: string;
}

export interface Card {
  cardId: string;
  deckId: string;
  frontText: string;
  backText: string;
  hint?: string;
  mediaUrl?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserDeckProgress {
  deckId: string;
  status: 'new' | 'in_progress' | 'completed';
  percentComplete: number; // 0‑100
  nextReview: string | null; // ISO
}

export interface UserCardProgress {
  cardId: string;
  deckId: string;
  boxLevel: number; // 0-5 for Leitner system
  nextReview: string; // ISO
  reviewCount: number;
  correctCount: number;
  incorrectCount: number;
}

export interface StudySession {
  deckId: string;
  currentCardIndex: number;
  queue: Card[];
  settings: {
    shuffle: boolean;
    showHints: boolean;
    autoFlipDelay?: number;
  };
  boxMap: Record<string, number>; // cardId -> boxLevel
} 