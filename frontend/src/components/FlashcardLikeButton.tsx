import React, {useState} from 'react';
import {Heart} from 'lucide-react';
import {useUpvoteDeckMutation} from '../services/flashcardsApi';
import { pillButtonStyles } from '@/components/ui/pillButton';
import { cn } from '@/lib/cn';

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
    
    const prevLiked = liked;
    const prevCount = likeCount;
    const newLiked = !prevLiked;
    const newCount = newLiked ? prevCount + 1 : prevCount - 1;
    
    // Optimistic update
    setLiked(() => newLiked);
    setLikeCount(() => newCount);
    
    try {
      await upvoteDeck(deckId).unwrap();
    } catch (error) {
      // Revert on error
      setLiked(prevLiked);
      setLikeCount(prevCount);
    }
  };

  let resolvedSize: 'sm' | 'md' | 'lg' = 'md';
  if (size === 'small') resolvedSize = 'sm';
  else if (size === 'large') resolvedSize = 'lg';

  let heartSize = 16;
  if (size === 'small') heartSize = 14;
  else if (size === 'large') heartSize = 20;

  return (
    <button
      className={cn(
        pillButtonStyles({
          intent: liked ? 'danger' : 'default',
          size: resolvedSize,
          disabled: isLoading
        })
      )}
      onClick={handleLike}
      disabled={isLoading}
      aria-label={liked ? 'Unlike this deck' : 'Like this deck'}
      style={{transition: 'transform 0.15s ease'}}
    >
      <Heart 
        size={heartSize} 
        fill={liked ? 'currentColor' : 'none'}
      />
      <span className="tw-font-mono tw-text-sm">{likeCount}</span>
    </button>
  );
};

export default FlashcardLikeButton; 
