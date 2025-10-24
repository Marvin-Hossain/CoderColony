import {useNavigate} from 'react-router-dom';
import {Plus, Search, BookOpen} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import FlashcardDeckCard from '../components/FlashcardDeckCard';
import Button from '../components/Button';
import {useGetDecksQuery} from '../services/flashcardsApi';

const Flashcards = () => {
  const navigate = useNavigate();
  const {data: myDecks = [], isLoading, error} = useGetDecksQuery({mine: true});

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
    <div className="min-h-screen bg-background">
      <div className="container py-20 space-y-10">
        <PageHeader
          title="My Flashcards"
          subtitle="Create and study your personalized flashcard decks"
        />

        <div className="flex flex-wrap gap-3">
          <Button onClick={handleCreateDeck} className="w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Create New Deck
          </Button>
          <Button
            variant="outline"
            onClick={handleExploreClick}
            className="w-full sm:w-auto"
          >
            <Search className="h-4 w-4" />
            Explore Public Decks
          </Button>
        </div>

        <section className="space-y-6">
          {isLoading && (
            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border bg-card p-8 text-muted-foreground">
              <span
                className="inline-block h-10 w-10 animate-spin rounded-full"
                style={{
                  borderWidth: '4px',
                  borderStyle: 'solid',
                  borderColor: 'rgba(77, 107, 254, 0.2)',
                  borderTopColor: 'var(--color-primary)'
                }}
              />
              <p className="text-sm">Loading your decks...</p>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-danger bg-danger/10 px-4 py-3 text-danger">
              Failed to load decks. Please try again.
            </div>
          )}

          {!isLoading && !error && myDecks.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-6 rounded-2xl border border-dashed bg-muted/20 px-6 py-12 text-center">
              <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <BookOpen className="h-8 w-8" />
              </span>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">No flashcard decks yet</h3>
                <p className="max-w-md text-sm text-muted-foreground">
                  Create your first deck to start studying with flashcards.
                </p>
              </div>
              <Button onClick={handleCreateDeck} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Deck
              </Button>
            </div>
          )}

          {!isLoading && !error && myDecks.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {myDecks.map((deck) => (
                <FlashcardDeckCard
                  key={deck.deckId}
                  deck={deck}
                  onClick={() => handleDeckClick(deck.deckId)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Flashcards;
