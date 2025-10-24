import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import {Card} from '../types/flashcards';
import {GripVertical, Trash2} from 'lucide-react';

interface SortableCardItemProps {
  card: Card;
  onChange: (cardId: string, field: 'frontText' | 'backText', value: string) => void;
  onDelete: (cardId: string) => void;
}

export const SortableCardItem = ({card, onChange, onDelete}: SortableCardItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({id: card.cardId});

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-lg md:flex-row md:items-start"
    >
      <button
        {...attributes}
        {...listeners}
        type="button"
        className="flex h-10 w-10 items-center justify-center rounded-full border bg-muted/20 text-muted-foreground"
        style={{cursor: 'grab'}}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="flex flex-1 flex-col gap-3 md:flex-row">
        <textarea
          placeholder="Front of card"
          value={card.frontText}
          onChange={(e) => onChange(card.cardId, 'frontText', e.target.value)}
          rows={2}
          className="form-field flex-1"
          style={{minHeight: '80px'}}
        />
        <textarea
          placeholder="Back of card"
          value={card.backText}
          onChange={(e) => onChange(card.cardId, 'backText', e.target.value)}
          rows={2}
          className="form-field flex-1"
          style={{minHeight: '80px'}}
        />
      </div>
      <button
        type="button"
        onClick={() => onDelete(card.cardId)}
        className="flex h-10 w-10 items-center justify-center rounded-full border bg-danger/10 text-danger"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
};
