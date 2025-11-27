import React, { useState, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AppContext } from '../../App';
import { Review } from '../../types';
import StarRating from './StarRating';
import { useI18n } from '../../i18n/I18nProvider';

interface ReviewFormProps {
  productId: string;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ productId }) => {
  const context = useContext(AppContext);
  const { t } = useI18n();
  const [author, setAuthor] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!author || rating === 0 || !comment) {
      setError(t('reviewForm.error'));
      return;
    }
    setError('');

    const newReview: Review = {
      id: uuidv4(),
      productId,
      author,
      rating,
      comment,
      date: new Date().toISOString(),
    };

    context?.setReviews(prevReviews => [newReview, ...prevReviews]);

    // Reset form
    setAuthor('');
    setRating(0);
    setComment('');
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg border border-stone-200 mt-12">
      <h3 className="text-2xl font-serif text-stone-800 mb-6">{t('reviewForm.title')}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="author" className="block text-sm font-medium text-stone-700">{t('reviewForm.nameLabel')}</label>
          <input
            type="text"
            id="author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="mt-1 w-full form-input focus-ring"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">{t('reviewForm.ratingLabel')}</label>
          <StarRating rating={rating} onRatingChange={setRating} size={24} />
        </div>
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-stone-700">{t('reviewForm.reviewLabel')}</label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="mt-1 w-full form-input focus-ring"
            required
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="text-end">
          <button
            type="submit"
            className="py-2 px-6 bg-stone-800 text-white font-bold rounded-md hover:bg-stone-900 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 focus-ring"
          >
            {t('reviewForm.submitButton')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;