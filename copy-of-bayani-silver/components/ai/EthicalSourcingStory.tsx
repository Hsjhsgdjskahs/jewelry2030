import React, { useState, useEffect } from 'react';
import { getEthicalSourcingStory } from '../../services/geminiService';
import { ShieldCheck, AlertTriangle } from 'lucide-react';
import { useI18n } from '../../i18n/I18nProvider';

interface EthicalSourcingStoryProps {
    productName: string;
}

const EthicalSourcingStory: React.FC<EthicalSourcingStoryProps> = ({ productName }) => {
    const { t } = useI18n();
    const [story, setStory] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStory = async () => {
            setIsLoading(true);
            setError('');
            try {
                const result = await getEthicalSourcingStory(productName);
                setStory(result);
            } catch (err: any) {
                setError(err.message || t('ethicalSourcing.error'));
            } finally {
                setIsLoading(false);
            }
        };
        fetchStory();
    }, [productName, t]);
    
    if (isLoading) {
        return (
            <div className="space-y-3 animate-pulse">
                <div className="flex items-center">
                    <div className="h-4 w-4 bg-stone-200 rounded-full me-3"></div>
                    <div className="h-6 w-40 bg-stone-200 rounded"></div>
                </div>
                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                    <div className="h-3 bg-stone-200 rounded w-full"></div>
                    <div className="h-3 bg-stone-200 rounded w-5/6 mt-2"></div>
                </div>
            </div>
        );
    }

    if (error || !story) {
        if(error) {
            return (
                <div className="space-y-3">
                    <h4 className="text-xl font-serif text-stone-800 flex items-center">
                        <ShieldCheck size={18} className="me-3 text-green-700"/>
                        {t('ethicalSourcing.title')}
                    </h4>
                    <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center">
                        <AlertTriangle size={16} className="me-2" />
                        <span>{error}</span>
                    </div>
                </div>
            )
        }
        return null;
    }

    return (
        <div className="space-y-3">
            <h4 className="text-xl font-serif text-stone-800 flex items-center">
                <ShieldCheck size={18} className="me-3 text-green-700"/>
                {t('ethicalSourcing.title')}
            </h4>
             <div className="p-4 rounded-lg bg-green-50 border border-green-200 animate-fade-in">
                <p className="text-sm text-green-800">{story}</p>
            </div>
        </div>
    );
};

export default EthicalSourcingStory;
