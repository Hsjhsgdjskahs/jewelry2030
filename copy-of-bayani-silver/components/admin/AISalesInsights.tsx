import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../App';
import { getSalesInsights } from '../../services/geminiService';
import LoadingSpinner from '../LoadingSpinner';
import { Lightbulb, Sparkles } from 'lucide-react';
import { useI18n } from '../../i18n/I18nProvider';

const AISalesInsights: React.FC = () => {
    const context = useContext(AppContext);
    const { t } = useI18n();
    const [insights, setInsights] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchInsights = async () => {
            if (!context?.orders || !context?.products) return;
            setIsLoading(true);
            setError('');
            try {
                const result = await getSalesInsights(context.orders, context.products);
                setInsights(result);
            } catch (err: any) {
                setError(err.message || t('salesInsights.error'));
            } finally {
                setIsLoading(false);
            }
        };

        fetchInsights();
    }, [context?.orders, context?.products, t]);

    return (
        <div className="bg-white p-8 rounded-lg shadow-lg border border-stone-200">
             <h2 className="text-2xl font-serif text-stone-800 mb-4 flex items-center">
                <Lightbulb size={24} className="me-3 text-[--color-gold-dark]" />
                {t('salesInsights.title')}
            </h2>
            {isLoading && (
                <div className="flex items-center space-x-3 text-stone-500 py-6">
                    <LoadingSpinner size="sm" />
                    <span>{t('salesInsights.loading')}</span>
                </div>
            )}
            {error && <p className="text-red-500 py-6">{error}</p>}
            {!isLoading && !error && insights && (
                 <div className="prose prose-stone max-w-none text-stone-700">
                    <ul className="space-y-3">
                    {insights.split('\n').filter(line => line.trim().startsWith('-') || line.trim().startsWith('*')).map((line, index) => (
                        <li key={index} className="flex items-start">
                           <Sparkles size={16} className="me-3 mt-1 text-yellow-500/80 flex-shrink-0" />
                           <span>{line.replace(/[-*]\s*/, '')}</span>
                        </li>
                    ))}
                    </ul>
                 </div>
            )}
        </div>
    );
};

export default AISalesInsights;