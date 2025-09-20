import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetDeckByIdQuery, useGetCardsQuery, useCreateDeckMutation, useUpdateDeckMutation, useCreateCardMutation, useUpdateCardMutation, useDeleteCardMutation } from '../services/flashcardsApi';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableCardItem } from '../components/SortableCardItem';
import { Plus, Save } from 'lucide-react';
import { Card } from '../types/flashcards';
import './DeckEditor.css';

const DeckEditor = () => {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const isCreating = !deckId;

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  
  // API hooks
  const { data: existingDeck } = useGetDeckByIdQuery(deckId!, { skip: isCreating });
  const { data: existingCards } = useGetCardsQuery(deckId!, { skip: isCreating });
  const [createDeck, { isLoading: isCreatingDeck }] = useCreateDeckMutation();
  const [updateDeck, { isLoading: isUpdatingDeck }] = useUpdateDeckMutation();
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
    <div className="deck-editor-page">
      <h2>{isCreating ? 'Create New Deck' : 'Edit Deck'}</h2>
      
      <div className="deck-editor-form">
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., React Hooks"
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A short summary of the deck's content"
          />
        </div>
        <div className="form-group">
          <label htmlFor="tags">Tags (comma-separated)</label>
          <input
            id="tags"
            type="text"
            value={tags.join(', ')}
            onChange={(e) => setTags(e.target.value.split(',').map(t => t.trim()))}
            placeholder="e.g., react, javascript, frontend"
          />
        </div>
      </div>
      
      <div className="deck-editor-card-manager">
        <h3>Cards</h3>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={cards.map(c => c.cardId)} strategy={verticalListSortingStrategy}>
            {cards.map(card => (
              <SortableCardItem 
                key={card.cardId}
                card={card}
                onDelete={handleCardDelete}
                onChange={handleCardChange}
              />
            ))}
          </SortableContext>
        </DndContext>
        <button className="add-card-button" onClick={handleAddNewCard}>
          <Plus size={16} /> Add Card
        </button>
      </div>

      <div className="deck-editor-actions">
        <button className="save-button" onClick={handleSave} disabled={isCreatingDeck || isUpdatingDeck}>
          <Save size={16} />
          {isCreatingDeck || isUpdatingDeck ? 'Saving...' : 'Save Deck & Cards'}
        </button>
      </div>
    </div>
  );
};

export default DeckEditor; 