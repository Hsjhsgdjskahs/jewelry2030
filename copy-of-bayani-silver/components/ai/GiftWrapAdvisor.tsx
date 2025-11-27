import React, { useState, useEffect } from 'react';
import { getGiftWrappingSuggestion } from '../../services/geminiService';
import { Gift } from 'lucide-react';
import { useI18n } from '../../i18n/I18nProvider';

interface GiftWrapAdvisorProps {
    productName: string;
}

const GiftWrapAdvisor: React.FC<GiftWrapAdvisorProps> = ({ productName }) => {
    const { t } = useI18n();
    const [suggestion, setSuggestion] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSuggestion = async () => {
            setIsLoading(true);
            setError('');
            try {
                const result = await getGiftWrappingSuggestion(productName);
                setSuggestion(result);
            } catch (err) {
                console.error(err);
                setError(t('giftWrap.defaultSuggestion')); // Use error to hold the fallback
            } finally {
                setIsLoading(false);
            }
        };
        fetchSuggestion();
    }, [productName, t]);

    if (isLoading) {
        return (
            <div className="p-6 bg-white rounded-lg shadow-md border border-stone-200/80 space-y-4 animate-pulse">
                <div className="flex items-center">
                    <div className="h-5 w-5 bg-stone-200 rounded-full me-3"></div>
                    <div className="h-7 w-56 bg-stone-200 rounded"></div>
                </div>
                <div className="h-4 bg-stone-200 rounded w-3/4"></div>
                 <div className="p-4 rounded-lg bg-stone-100/70 border border-stone-200">
                    <div className="h-4 bg-stone-200 rounded w-full"></div>
                </div>
            </div>
        );
    }
    
    const displaySuggestion = suggestion || error;
    if (!displaySuggestion) return null;

    return (
        <div className="p-6 bg-white rounded-lg shadow-md border border-stone-200/80 space-y-4">
            <h3 className="text-2xl font-serif text-stone-800 flex items-center">
                <Gift size={20} className="me-3 text-red-600"/>
                {t('giftWrap.title')}
            </h3>
            <p className="text-stone-600">{t('giftWrap.subtitle')}</p>
            <div className="p-4 rounded-lg bg-stone-100/70 border border-stone-200">
                <p className="text-stone-700 italic">"{displaySuggestion}"</p>
            </div>
        </div>
    );
};

export default GiftWrapAdvisor;