import React, { useContext } from 'react';
import { AppContext } from '../../App';
import { Review } from '../../types';
import { Trash2, User } from 'lucide-react';
import StarRating from '../reviews/StarRating';
import { useI18n } from '../../i18n/I18nProvider';

const ReviewManagement: React.FC = () => {
    const context = useContext(AppContext);
    const { t } = useI18n();

    const handleDelete = (reviewId: string) => {
        if (window.confirm(t('reviewManagement.deleteConfirm'))) {
            context?.setReviews(prev => prev.filter(r => r.id !== reviewId));
        }
    };

    const reviews = context?.reviews.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()) || [];

    const getProductName = (productId: string) => {
        return context?.products.find(p => p.id === productId)?.name || t('reviewManagement.unknownProduct');
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg border border-stone-200 animate-fade-in">
            <h2 className="text-2xl font-serif text-stone-800 mb-6 border-b pb-4">{t('reviewManagement.title')}</h2>
            {reviews.length > 0 ? (
                <div className="space-y-6">
                    {reviews.map(review => (
                        <div key={review.id} className="p-4 border border-stone-200 rounded-lg bg-stone-50/50">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center mb-2">
                                        <StarRating rating={review.rating} size={16} />
                                        <p className="ms-3 font-bold text-stone-800">{review.author}</p>
                                    </div>
                                    <p className="text-stone-600 text-sm italic">"{review.comment}"</p>
                                </div>
                                <button
                                    onClick={() => handleDelete(review.id)}
                                    className="text-red-600 hover:text-red-900 transition-colors p-2 rounded-full hover:bg-red-100"
                                    aria-label={t('reviewManagement.deleteAria', { author: review.author })}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                            <div className="text-end mt-3">
                                <p className="text-xs text-stone-500">
                                    {t('reviewManagement.forProduct')} <span className="font-semibold">{getProductName(review.productId)}</span> {t('reviewManagement.onDate')} {new Date(review.date).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-stone-600 text-center py-8">{t('reviewManagement.noReviews')}</p>
            )}
        </div>
    );
};

export default ReviewManagement;