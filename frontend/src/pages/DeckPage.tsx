import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGetDeckByIdQuery, useGetCardsQuery } from '../services/flashcardsApi';
import { Book, Edit, BrainCircuit, ChevronLeft, Loader, AlertTriangle, Play } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import './DeckPage.css';

const DeckPage = () => {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();

  const { data: deck, isLoading: isDeckLoading, error: deckError } = useGetDeckByIdQuery(deckId!, {
    skip: !deckId,
  });

  const { data: cards = [], isLoading: areCardsLoading, error: cardsError } = useGetCardsQuery(deckId!, {
    skip: !deckId,
  });

  if (isDeckLoading || areCardsLoading) {
    return (
      <div className="deck-page-loading">
        <Loader className="animate-spin" size={48} />
        <p>Loading Deck...</p>
      </div>
    );
  }

  if (deckError || !deck) {
    return (
      <div className="deck-page-error">
        <AlertTriangle size={48} />
        <h3>Deck Not Found</h3>
        <p>{deckError ? 'There was an error loading this deck.' : 'The requested deck does not exist.'}</p>
        <Link to="/practice/flashcards" className="deck-page-back-link">
          <ChevronLeft size={16} /> Go back to my decks
        </Link>
      </div>
    );
  }

  return (
    <div className="deck-page">
      <Link to="/practice/flashcards" className="deck-page-back-link">
        <ChevronLeft size={16} /> Back to My Decks
      </Link>

      <PageHeader
        title={deck.title}
        subtitle={deck.description || 'A collection of flashcards.'}
      />
      
      <div className="deck-page-meta">
        <span className="deck-page-meta-item">
          <Book size={16} /> {cards.length} Cards
        </span>
        <span className="deck-page-meta-item">
          <BrainCircuit size={16} /> {deck.tags.join(', ')}
        </span>
      </div>

      <div className="deck-page-actions">
        <button 
          className="deck-page-action-button primary" 
          onClick={() => navigate(`/practice/flashcards/${deckId}/study`)}
          disabled={cards.length === 0}
        >
          <Play size={20} /> Study Deck
        </button>
        <button 
          className="deck-page-action-button secondary" 
          onClick={() => navigate(`/practice/flashcards/${deckId}/edit`)}
        >
          <Edit size={20} /> Edit Deck
        </button>
      </div>
      
      <div className="deck-page-card-list">
        <h3>Cards in this Deck</h3>
        {cardsError && <p className="deck-page-error-text">Could not load cards.</p>}
        {cards.length > 0 ? (
          <div className="deck-page-cards-grid">
            {cards.map(card => (
              <div key={card.cardId} className="deck-page-card-item">
                <div className="deck-page-card-front">
                  <p>{card.frontText}</p>
                </div>
                <div className="deck-page-card-back">
                  <p>{card.backText}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="deck-page-no-cards">
            <p>This deck has no cards yet. Add some to start studying!</p>
            <button 
              className="deck-page-action-button secondary" 
              onClick={() => navigate(`/practice/flashcards/${deckId}/edit`)}
            >
              <Edit size={20} /> Add Cards
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeckPage; 