import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../App';
import { getTrendForecast } from '../../services/geminiService';
import LoadingSpinner from '../LoadingSpinner';
import { TrendingUp, Sparkles } from 'lucide-react';
import { useI18n } from '../../i18n/I18nProvider';

const TrendForecaster: React.FC = () => {
    const context = useContext(AppContext);
    const { t } = useI18n();
    const [forecast, setForecast] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchForecast = async () => {
            if (!context?.products || context.products.length === 0) return;
            setIsLoading(true);
            setError('');
            try {
                const result = await getTrendForecast(context.products);
                setForecast(result);
            } catch (err: any) {
                setError(err.message || t('trendForecaster.error'));
            } finally {
                setIsLoading(false);
            }
        };
        fetchForecast();
    }, [context?.products, t]);
    
    return (
        <div className="bg-white p-8 rounded-lg shadow-lg border border-stone-200">
            <h2 className="text-2xl font-serif text-stone-800 mb-4 flex items-center">
                <TrendingUp size={24} className="me-3 text-[--color-gold-dark]" />
                {t('trendForecaster.title')}
            </h2>
            {isLoading && (
                <div className="flex items-center space-x-3 text-stone-500 py-6">
                    <LoadingSpinner size="sm" />
                    <span>{t('trendForecaster.loading')}</span>
                </div>
            )}
            {error && <p className="text-red-500 py-6">{error}</p>}
            {!isLoading && !error && forecast && (
                 <div className="prose prose-stone max-w-none text-stone-700">
                    <p className="flex">
                        <Sparkles size={16} className="me-3 mt-1 text-yellow-500/80 flex-shrink-0" />
                        <span>{forecast}</span>
                    </p>
                 </div>
            )}
        </div>
    );
};

export default TrendForecaster;