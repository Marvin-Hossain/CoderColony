
import { useNavigate } from 'react-router-dom';
import { Plus, Search, BookOpen } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import FlashcardDeckCard from '../components/FlashcardDeckCard';
import { useGetDecksQuery } from '../services/flashcardsApi';
import './Flashcards.css';

const Flashcards = () => {
  const navigate = useNavigate();
  const { data: myDecks = [], isLoading, error } = useGetDecksQuery({ mine: true });

  const handleCreateDeck = () => {
    navigate('/practice/flashcards/new');
  };

  const handleDeckClick = (deckId: string) => {
    navigate(`/practice/flashcards/${deckId}`);
  };

  const handleExploreClick = () => {
    navigate('/explore/flashcards');
  };

  return (
    <div className="flashcards-page">
      <PageHeader
        title="My Flashcards"
        subtitle="Create and study your personalized flashcard decks"
      />

      <div className="flashcards-actions">
        <button 
          className="flashcards-action-button primary"
          onClick={handleCreateDeck}
        >
          <Plus size={20} />
          Create New Deck
        </button>
        
        <button 
          className="flashcards-action-button secondary"
          onClick={handleExploreClick}
        >
          <Search size={20} />
          Explore Public Decks
        </button>
      </div>

      <div className="flashcards-content">
        {isLoading && (
          <div className="flashcards-loading">
            <div className="flashcards-loading-spinner" />
            <p>Loading your decks...</p>
          </div>
        )}

        {error && (
          <div className="flashcards-error">
            <p>Failed to load decks. Please try again.</p>
          </div>
        )}

        {!isLoading && !error && myDecks.length === 0 && (
          <div className="flashcards-empty">
            <div className="flashcards-empty-icon">
              <BookOpen size={64} />
            </div>
            <h3>No flashcard decks yet</h3>
            <p>Create your first deck to start studying with flashcards!</p>
            <button 
              className="flashcards-action-button primary large"
              onClick={handleCreateDeck}
            >
              <Plus size={20} />
              Create Your First Deck
            </button>
          </div>
        )}

        {!isLoading && !error && myDecks.length > 0 && (
          <div className="flashcards-grid">
            {myDecks.map((deck) => (
              <FlashcardDeckCard
                key={deck.deckId}
                deck={deck}
                onClick={() => handleDeckClick(deck.deckId)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Flashcards; 