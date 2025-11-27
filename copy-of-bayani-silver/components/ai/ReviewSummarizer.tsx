import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../App';
import { summarizeReviews } from '../../services/geminiService';
import { ReviewSummary } from '../../types';
import LoadingSpinner from '../LoadingSpinner';
import { Sparkles, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useI18n } from '../../i18n/I18nProvider';

interface ReviewSummarizerProps {
    productId: string;
}

const ReviewSummarizer: React.FC<ReviewSummarizerProps> = ({ productId }) => {
    const context = useContext(AppContext);
    const { t } = useI18n();
    const [summary, setSummary] = useState<ReviewSummary | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const productReviews = context?.reviews.filter(r => r.productId === productId) || [];

    useEffect(() => {
        if (productReviews.length > 2) {
            const fetchSummary = async () => {
                setIsLoading(true);
                setError('');
                try {
                    const result = await summarizeReviews(productReviews);
                    setSummary(result);
                } catch (err: any) {
                    setError(err.message || t('reviewSummary.error'));
                } finally {
                    setIsLoading(false);
                }
            };
            fetchSummary();
        } else {
            setSummary(null);
        }
    }, [productId, productReviews.length, t]);


    if (productReviews.length <= 2) {
        return null;
    }

    return (
        <div className="mb-12 bg-white p-6 rounded-lg shadow-lg border border-stone-200">
            <h3 className="text-2xl font-serif text-stone-800 mb-4 flex items-center">
                <Sparkles size={20} className="me-3 text-[--color-gold-dark]" />
                {t('reviewSummary.title')}
            </h3>
            {isLoading && <LoadingSpinner />}
            {error && <p className="text-red-500">{error}</p>}
            {summary && (
                <div className="space-y-4 animate-fade-in">
                    <p className="text-stone-700 italic">{summary.summary}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <h4 className="font-semibold flex items-center text-green-700">
                                <ThumbsUp size={16} className="me-2" /> {t('reviewSummary.pros')}
                            </h4>
                            <ul className="list-disc list-inside text-sm text-stone-600 space-y-1">
                                {summary.pros.map((pro, i) => <li key={i}>{pro}</li>)}
                            </ul>
                        </div>
                         <div className="space-y-2">
                            <h4 className="font-semibold flex items-center text-red-700">
                                <ThumbsDown size={16} className="me-2" /> {t('reviewSummary.cons')}
                            </h4>
                             <ul className="list-disc list-inside text-sm text-stone-600 space-y-1">
                                {summary.cons.map((con, i) => <li key={i}>{con}</li>)}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReviewSummarizer;
