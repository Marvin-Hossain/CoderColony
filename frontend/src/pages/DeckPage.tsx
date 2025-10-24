import {useParams, useNavigate, Link} from 'react-router-dom';
import {useGetDeckByIdQuery, useGetCardsQuery} from '../services/flashcardsApi';
import {Book, Edit, BrainCircuit, ChevronLeft, Loader, AlertTriangle, Play} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';

const DeckPage = () => {
  const {deckId} = useParams<{ deckId: string }>();
  const navigate = useNavigate();

  const {data: deck, isLoading: isDeckLoading, error: deckError} = useGetDeckByIdQuery(deckId!, {
    skip: !deckId,
  });

  const {data: cards = [], isLoading: areCardsLoading, error: cardsError} = useGetCardsQuery(deckId!, {
    skip: !deckId,
  });

  if (isDeckLoading || areCardsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container flex min-h-screen flex-col items-center justify-center gap-4 text-muted-foreground">
          <Loader className="h-10 w-10 animate-spin" />
          <p className="text-sm">Loading deck...</p>
        </div>
      </div>
    );
  }

  if (deckError || !deck) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container flex min-h-screen flex-col items-center justify-center gap-4 text-center">
          <AlertTriangle className="h-12 w-12 text-danger" />
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-primary">Deck not found</h3>
            <p className="text-sm text-muted-foreground">
              {deckError ? 'There was an error loading this deck.' : 'The requested deck does not exist.'}
            </p>
          </div>
          <Link
            to="/practice/flashcards"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
          >
            <ChevronLeft className="h-4 w-4" />
            Go back to my decks
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-20 space-y-8">
        <Link
          to="/practice/flashcards"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to my decks
        </Link>

        <PageHeader
          title={deck.title}
          subtitle={deck.description || 'A collection of flashcards.'}
        />

        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1">
            <Book className="h-4 w-4" />
            {cards.length} cards
          </span>
          {deck.tags.length > 0 && (
            <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1">
              <BrainCircuit className="h-4 w-4" />
              {deck.tags.join(', ')}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => navigate(`/practice/flashcards/${deckId}/study`)}
            disabled={cards.length === 0}
            className="gap-2"
          >
            <Play className="h-4 w-4" />
            Study deck
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(`/practice/flashcards/${deckId}/edit`)}
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit deck
          </Button>
        </div>

        <section className="space-y-4 rounded-2xl border bg-card p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Cards in this deck</h3>
            {cardsError && (
              <span className="text-sm text-danger">Could not load cards.</span>
            )}
          </div>

          {cards.length > 0 ? (
            <div className="grid gap-4">
              {cards.map(card => (
                <div
                  key={card.cardId}
                  className="grid gap-4 rounded-2xl border bg-muted/20 p-4 text-sm text-muted-foreground md:grid-cols-2"
                >
                  <div
                    className="rounded-xl border border-dashed bg-card p-4"
                    style={{borderColor: 'rgba(77, 107, 254, 0.3)'}}
                  >
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Front
                    </h4>
                    <p className="text-base text-primary">{card.frontText}</p>
                  </div>
                  <div
                    className="rounded-xl border border-dashed bg-card p-4"
                    style={{borderColor: 'rgba(77, 107, 254, 0.3)'}}
                  >
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Back
                    </h4>
                    <p className="text-base text-primary">{card.backText}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed bg-muted/20 px-6 py-12 text-center">
              <p className="text-sm text-muted-foreground">
                This deck has no cards yet. Add some to start studying!
              </p>
              <Button
                variant="outline"
                onClick={() => navigate(`/practice/flashcards/${deckId}/edit`)}
                className="gap-2"
              >
                <Edit className="h-4 w-4" />
                Add cards
              </Button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default DeckPage; 
