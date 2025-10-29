import {useState, useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {useGetDeckByIdQuery, useGetCardsQuery, useCreateDeckMutation, useUpdateDeckMutation, useCreateCardMutation, useUpdateCardMutation, useDeleteCardMutation} from '../services/flashcardsApi';
import {DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors} from '@dnd-kit/core';
import {arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy} from '@dnd-kit/sortable';
import {SortableCardItem} from '../components/SortableCardItem';
import {Plus, Save} from 'lucide-react';
import {Card} from '../types/flashcards';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';

const DeckEditor = () => {
  const {deckId} = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const isCreating = !deckId;

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  
  // API hooks
  const {data: existingDeck} = useGetDeckByIdQuery(deckId!, {skip: isCreating});
  const {data: existingCards} = useGetCardsQuery(deckId!, {skip: isCreating});
  const [createDeck, {isLoading: isCreatingDeck}] = useCreateDeckMutation();
  const [updateDeck, {isLoading: isUpdatingDeck}] = useUpdateDeckMutation();
  const [createCard] = useCreateCardMutation();
  const [updateCard] = useUpdateCardMutation();
  const [deleteCard] = useDeleteCardMutation();

  useEffect(() => {
    if (existingDeck) {
      setTitle(existingDeck.title);
      setDescription(existingDeck.description || '');
      setTags(existingDeck.tags);
    }
    if (existingCards) {
      setCards(existingCards);
    }
  }, [existingDeck, existingCards]);

  const handleAddNewCard = () => {
    const newCard: Card = {
      cardId: `new-${Date.now()}`,
      deckId: deckId!,
      frontText: '',
      backText: '',
      sortOrder: cards.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCards(prev => [...prev, newCard]);
  };
  
  const handleCardChange = (cardId: string, field: 'frontText' | 'backText', value: string) => {
    setCards(prev => prev.map(c => c.cardId === cardId ? { ...c, [field]: value } : c));
  };
  
  const handleCardDelete = (cardId: string) => {
    setCards(prev => prev.filter(c => c.cardId !== cardId));
    if (!cardId.startsWith('new-')) {
        deleteCard(cardId);
    }
  };
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setCards((items) => {
        const oldIndex = items.findIndex(item => item.cardId === active.id);
        const newIndex = items.findIndex(item => item.cardId === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };
  
  const handleSave = async () => {
    try {
        let currentDeckId = deckId;
        if (isCreating) {
            const newDeck = await createDeck({ title, description, tags, difficulty: 0, language: 'en', isOfficial: false, isPublic: false, creatorId: 'user-123' }).unwrap();
            currentDeckId = newDeck.deckId;
            navigate(`/practice/flashcards/${currentDeckId}/edit`, { replace: true });
        } else {
            await updateDeck({ id: deckId!, updates: { title, description, tags } });
        }

        // Save all cards
        for (const [index, card] of cards.entries()) {
            const cardData = { ...card, sortOrder: index };
            if (card.cardId.startsWith('new-')) {
                await createCard({ ...cardData, deckId: currentDeckId! });
            } else {
                await updateCard({ cardId: card.cardId, updates: cardData });
            }
        }
        // Could add a success notification here
    } catch (error) {
      console.error('Failed to save deck and cards:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-20 space-y-8">
        <PageHeader
          title={isCreating ? 'Create a new deck' : 'Edit deck'}
          subtitle="Organize your cards and keep your study material up to date."
        />

        <section className="space-y-6 rounded-2xl border bg-card p-6 shadow-lg">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-semibold text-muted-foreground">Title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., React Hooks"
              className="form-field"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-semibold text-muted-foreground">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A short summary of the deck's content"
              className="form-field"
              style={{minHeight: '120px', resize: 'vertical'}}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="tags" className="text-sm font-semibold text-muted-foreground">Tags (comma-separated)</label>
            <input
              id="tags"
              type="text"
              value={tags.join(', ')}
              onChange={(e) => setTags(e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
              placeholder="e.g., react, javascript, frontend"
              className="form-field"
            />
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              {tags.map(tag => (
                <span key={tag} className="inline-flex items-center rounded-full bg-muted/20 px-3 py-1 font-medium">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4 rounded-2xl border bg-card p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Cards</h3>
            <Button variant="outline" onClick={handleAddNewCard} className="gap-2">
              <Plus className="h-4 w-4" />
              Add card
            </Button>
          </div>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={cards.map(c => c.cardId)} strategy={verticalListSortingStrategy}>
              <div className="space-y-4">
                {cards.map(card => (
                  <SortableCardItem
                    key={card.cardId}
                    card={card}
                    onDelete={handleCardDelete}
                    onChange={handleCardChange}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          {cards.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Add your first card to start building this deck.
            </p>
          )}
        </section>

        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            className="gap-2"
            disabled={isCreatingDeck || isUpdatingDeck}
          >
            <Save className="h-4 w-4" />
            {isCreatingDeck || isUpdatingDeck ? 'Saving...' : 'Save deck & cards'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeckEditor; 
