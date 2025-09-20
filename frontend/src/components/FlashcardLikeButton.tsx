import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { useUpvoteDeckMutation } from '../services/flashcardsApi';
import './FlashcardLikeButton.css';

interface FlashcardLikeButtonProps {
  deckId: string;
  initialLikeCount: number;
  isLiked?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const FlashcardLikeButton: React.FC<FlashcardLikeButtonProps> = ({
  deckId,
  initialLikeCount,
  isLiked = false,
  size = 'medium'
}) => {
  const [liked, setLiked] = useState(isLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [upvoteDeck, { isLoading }] = useUpvoteDeckMutation();

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent parent click handlers
    
    if (isLoading) return;
    
    const newLiked = !liked;
    const newCount = newLiked ? likeCount + 1 : likeCount - 1;
    
    // Optimistic update
    setLiked(newLiked);
    setLikeCount(newCount);
    
    try {
      await upvoteDeck(deckId).unwrap();
    } catch (error) {
      // Revert on error
      setLiked(liked);
      setLikeCount(likeCount);
      console.error('Failed to update like:', error);
    }
  };

  const sizeClass = `flashcard-like-button--${size}`;
  const likedClass = liked ? 'flashcard-like-button--liked' : '';
  const loadingClass = isLoading ? 'flashcard-like-button--loading' : '';

  return (
    <button
      className={`flashcard-like-button ${sizeClass} ${likedClass} ${loadingClass}`}
      onClick={handleLike}
      disabled={isLoading}
      aria-label={liked ? 'Unlike this deck' : 'Like this deck'}
    >
      <Heart 
        size={size === 'small' ? 14 : size === 'large' ? 20 : 16} 
        fill={liked ? 'currentColor' : 'none'}
      />
      <span className="flashcard-like-button-count">{likeCount}</span>
    </button>
  );
};

export default FlashcardLikeButton; 