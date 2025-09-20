import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '../types/flashcards';
import { GripVertical, Trash2 } from 'lucide-react';
import './SortableCardItem.css';

interface SortableCardItemProps {
  card: Card;
  onChange: (cardId: string, field: 'frontText' | 'backText', value: string) => void;
  onDelete: (cardId: string) => void;
}

export const SortableCardItem = ({ card, onChange, onDelete }: SortableCardItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: card.cardId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="sortable-card-item">
      <button {...attributes} {...listeners} className="drag-handle">
        <GripVertical size={20} />
      </button>
      <div className="card-inputs">
        <textarea
          placeholder="Front of card"
          value={card.frontText}
          onChange={(e) => onChange(card.cardId, 'frontText', e.target.value)}
          rows={2}
        />
        <textarea
          placeholder="Back of card"
          value={card.backText}
          onChange={(e) => onChange(card.cardId, 'backText', e.target.value)}
          rows={2}
        />
      </div>
      <button onClick={() => onDelete(card.cardId)} className="delete-button">
        <Trash2 size={20} />
      </button>
    </div>
  );
}; 