import React from 'react';
import { Heart, Eye, Users } from 'lucide-react';
import { Deck } from '../types/flashcards';
import './FlashcardDeckCard.css';

interface FlashcardDeckCardProps {
  deck: Deck;
  onClick?: () => void;
}

const getDifficultyClass = (difficulty: number): string => {
  const classes = ['beginner', 'easy', 'medium', 'hard', 'expert', 'master'];
  return `difficulty--${classes[difficulty] || 'unknown'}`;
};

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
  return (
    <div className="flashcard-deck-card" onClick={onClick}>
      <div className="flashcard-deck-card-header">
        <div className="flashcard-deck-card-badges">
          {deck.isOfficial && (
            <span className="flashcard-deck-card-badge official">Official</span>
          )}
          <span 
            className={`flashcard-deck-card-badge difficulty ${getDifficultyClass(deck.difficulty)}`}
            style={{ 
              backgroundColor: getDifficultyColor(deck.difficulty, 0.2),
              color: getDifficultyColor(deck.difficulty, 1)
            }}
          >
            {getDifficultyLabel(deck.difficulty)}
          </span>
        </div>
      </div>
      
      <div className="flashcard-deck-card-content">
        <h3 className="flashcard-deck-card-title">{deck.title}</h3>
        {deck.description && (
          <p className="flashcard-deck-card-description">{deck.description}</p>
        )}
        
        <div className="flashcard-deck-card-tags">
          {deck.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="flashcard-deck-card-tag">
              {tag}
            </span>
          ))}
          {deck.tags.length > 3 && (
            <span className="flashcard-deck-card-tag-more">
              +{deck.tags.length - 3}
            </span>
          )}
        </div>
      </div>
      
      <div className="flashcard-deck-card-footer">
        <div className="flashcard-deck-card-stats">
          <div className="flashcard-deck-card-stat">
            <Heart size={16} />
            <span>{deck.likeCount}</span>
          </div>
          <div className="flashcard-deck-card-stat">
            <Eye size={16} />
            <span>{deck.viewCount}</span>
          </div>
          <div className="flashcard-deck-card-stat">
            <Users size={16} />
            <span>{deck.isPublic ? 'Public' : 'Private'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashcardDeckCard; 