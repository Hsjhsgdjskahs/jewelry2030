
import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  size?: number;
  className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, onRatingChange, size = 20, className = '' }) => {
  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const isInteractive = !!onRatingChange;
        return (
          <button
            key={star}
            type="button"
            disabled={!isInteractive}
            onClick={() => onRatingChange && onRatingChange(star)}
            className={`transition-colors duration-200 ${isInteractive ? 'cursor-pointer' : 'cursor-default'}`}
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
          >
            <Star
              size={size}
              className={star <= rating ? 'text-yellow-500 fill-current' : 'text-stone-300'}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;