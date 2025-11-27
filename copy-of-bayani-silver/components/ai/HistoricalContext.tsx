import React, { useState, useEffect } from 'react';
import { getHistoricalContext } from '../../services/geminiService';
import { Landmark, AlertTriangle } from 'lucide-react';
import { useI18n } from '../../i18n/I18nProvider';

interface HistoricalContextProps {
    productName: string;
    category: string;
}

const HistoricalContext: React.FC<HistoricalContextProps> = ({ productName, category }) => {
    const { t } = useI18n();
    const [context, setContext] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchContext = async () => {
            setIsLoading(true);
            setError('');
            try {
                const result = await getHistoricalContext(productName, category);
                setContext(result);
            } catch (err: any) {
                setError(err.message || t('historicalContext.error'));
            } finally {
                setIsLoading(false);
            }
        };
        fetchContext();
    }, [productName, category, t]);

    const renderLoading = () => (
        <div className="space-y-3 animate-pulse">
            <div className="flex items-center">
                <div className="h-4 w-4 bg-stone-200 rounded-full me-3"></div>
                <div className="h-6 w-40 bg-stone-200 rounded"></div>
            </div>
            <div className="p-4 rounded-lg bg-stone-100/70 border border-stone-200">
                <div className="h-3 bg-stone-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-stone-200 rounded w-5/6"></div>
            </div>
        </div>
    );
    
    if (isLoading) {
        return renderLoading();
    }
    
    if (error || !context) {
        if (error) {
             return (
                 <div className="space-y-3">
                    <h4 className="text-xl font-serif text-stone-800 flex items-center">
                        <Landmark size={18} className="me-3 text-stone-600"/>
                        {t('historicalContext.title')}
                    </h4>
                    <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center">
                        <AlertTriangle size={16} className="me-2" />
                        <span className="text-sm">{error}</span>
                    </div>
                </div>
             );
        }
        return null;
    }

    return (
        <div className="space-y-3">
            <h4 className="text-xl font-serif text-stone-800 flex items-center">
                <Landmark size={18} className="me-3 text-stone-600"/>
                {t('historicalContext.title')}
            </h4>
            <div className="p-4 rounded-lg bg-stone-100/70 border border-stone-200 animate-fade-in">
                <p className="text-sm text-stone-700">{context}</p>
            </div>
        </div>
    );
};

export default HistoricalContext;
