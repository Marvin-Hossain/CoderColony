import React from 'react';
import {Heart, Eye, Users} from 'lucide-react';
import {Deck} from '../types/flashcards';

interface FlashcardDeckCardProps {
  deck: Deck;
  onClick?: () => void;
}

const getDifficultyColor = (difficulty: number, opacity: number = 1): string => {
  const colors = [
    '#22c55e', // green-500
    '#10b981', // emerald-500
    '#f59e0b', // amber-500
    '#f97316', // orange-500
    '#ef4444', // red-500
    '#dc2626', // red-600
  ];
  const color = colors[difficulty] || '#6b7280';
  
  if (opacity === 1) return color;

  // Basic hex to rgba conversion
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const getDifficultyLabel = (difficulty: number): string => {
  const labels = ['Beginner', 'Easy', 'Medium', 'Hard', 'Expert', 'Master'];
  return labels[difficulty] || 'Unknown';
};

const FlashcardDeckCard: React.FC<FlashcardDeckCardProps> = ({ deck, onClick }) => {
  const Wrapper: React.ElementType = onClick ? 'button' : 'div';
  const wrapperProps = onClick
    ? {
        type: 'button' as const,
        onClick,
        className: 'w-full text-left',
        style: {background: 'none', border: 'none', padding: 0}
      }
    : {className: 'w-full'};

  return (
    <Wrapper {...wrapperProps}>
      <article
        className="flex h-full flex-col gap-5 rounded-2xl border bg-card p-6 text-left shadow-lg transition-transform"
        style={{transition: 'transform 0.2s ease, box-shadow 0.2s ease'}}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {deck.isOfficial && (
              <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                Official
              </span>
            )}
            <span
              className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
              style={{
                backgroundColor: getDifficultyColor(deck.difficulty, 0.14),
                color: getDifficultyColor(deck.difficulty, 1)
              }}
            >
              {getDifficultyLabel(deck.difficulty)}
            </span>
          </div>
          <span className="inline-flex items-center rounded-full bg-muted/20 px-3 py-1 text-xs font-medium text-muted-foreground">
            <Users size={14} className="mr-1" />
            {deck.isPublic ? 'Public' : 'Private'}
          </span>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold">{deck.title}</h3>
          {deck.description && (
            <p className="text-sm leading-relaxed text-muted-foreground">
              {deck.description}
            </p>
          )}

          {deck.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {deck.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={`${tag}-${index}`}
                  className="inline-flex items-center rounded-full bg-muted/20 px-3 py-1 text-xs font-medium text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
              {deck.tags.length > 3 && (
                <span className="inline-flex items-center rounded-full bg-muted/30 px-3 py-1 text-xs font-medium text-muted-foreground">
                  +{deck.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1">
              <Heart size={16} />
              {deck.likeCount}
            </span>
            <span className="inline-flex items-center gap-1">
              <Eye size={16} />
              {deck.viewCount}
            </span>
          </div>
        </div>
      </article>
    </Wrapper>
  );
};

export default FlashcardDeckCard;
