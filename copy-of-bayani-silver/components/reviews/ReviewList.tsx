import React, { useContext, useMemo } from 'react';
import { AppContext } from '../../App';
import StarRating from './StarRating';
import { User, MessageSquare } from 'lucide-react';
import { useI18n } from '../../i18n/I18nProvider';

interface ReviewListProps {
  productId: string;
}

const ReviewList: React.FC<ReviewListProps> = ({ productId }) => {
  const context = useContext(AppContext);
  const { t } = useI18n();

  const productReviews = useMemo(() => {
    return context?.reviews
      .filter(review => review.productId === productId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) || [];
  }, [context?.reviews, productId]);

  const averageRating = useMemo(() => {
    if (productReviews.length === 0) return 0;
    const total = productReviews.reduce((acc, review) => acc + review.rating, 0);
    return total / productReviews.length;
  }, [productReviews]);

  return (
    <div className="mt-16">
      <h3 className="text-3xl font-serif text-stone-800 mb-8 border-b pb-4">{t('reviewList.title')}</h3>
      
      {productReviews.length > 0 ? (
        <>
          <div className="flex items-center mb-8 bg-stone-100 p-4 rounded-lg">
            <span className="text-xl font-bold text-stone-700 me-4">
              {averageRating.toFixed(1)}
            </span>
            <StarRating rating={averageRating} />
            <span className="ms-4 text-stone-600">
              {t('reviewList.basedOn', { count: productReviews.length })}
            </span>
          </div>
          <div className="space-y-8">
            {productReviews.map(review => (
              <div key={review.id} className="p-6 border border-stone-200 rounded-lg bg-white/50">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                        <User size={16} className="text-stone-500 me-2"/>
                        <p className="font-bold text-stone-800">{review.author}</p>
                    </div>
                  <StarRating rating={review.rating} size={16} />
                </div>
                <p className="text-stone-600 mb-4">{review.comment}</p>
                <p className="text-xs text-stone-500 text-end">
                  {new Date(review.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12 px-6 bg-stone-50/70 rounded-lg border border-dashed">
          <MessageSquare size={40} className="mx-auto text-stone-400 mb-4"/>
          <p className="text-xl font-serif text-stone-700">{t('reviewList.noReviewsTitle')}</p>
          <p className="text-stone-500 mt-1">{t('reviewList.noReviewsSubtitle')}</p>
        </div>
      )}
    </div>
  );
};

export default ReviewList;