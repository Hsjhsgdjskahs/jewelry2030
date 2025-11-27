import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../App';
import { generateCustomerPersonas } from '../../services/geminiService';
import { CustomerPersona } from '../../types';
import LoadingSpinner from '../LoadingSpinner';
import { Users, Sparkles } from 'lucide-react';
import { useI18n } from '../../i18n/I18nProvider';

const CustomerPersonas: React.FC = () => {
    const context = useContext(AppContext);
    const { t } = useI18n();
    const [personas, setPersonas] = useState<CustomerPersona[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPersonas = async () => {
            if (!context?.orders || context.orders.length < 3) return;
            setIsLoading(true);
            setError('');
            try {
                const result = await generateCustomerPersonas(context.orders);
                setPersonas(result);
            } catch (err: any) {
                setError(err.message || t('customerPersonas.error'));
            } finally {
                setIsLoading(false);
            }
        };
        fetchPersonas();
    }, [context?.orders, t]);

    if (!context?.orders || context.orders.length < 3) {
        return null; // Don't show if not enough data
    }
    
    return (
        <div className="bg-white p-8 rounded-lg shadow-lg border border-stone-200">
            <h2 className="text-2xl font-serif text-stone-800 mb-4 flex items-center">
                <Users size={24} className="me-3 text-[--color-gold-dark]" />
                {t('customerPersonas.title')}
            </h2>
            {isLoading && (
                <div className="flex items-center space-x-3 text-stone-500 py-6">
                    <LoadingSpinner size="sm" />
                    <span>{t('customerPersonas.loading')}</span>
                </div>
            )}
            {error && <p className="text-red-500 py-6">{error}</p>}
            {!isLoading && !error && personas.length > 0 && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {personas.map((persona, index) => (
                        <div key={index} className="p-4 border rounded-md bg-stone-50">
                            <h3 className="font-semibold text-lg text-stone-800 flex items-center">
                                <Sparkles size={16} className="me-2 text-yellow-500" />
                                {persona.name}
                            </h3>
                            <p className="text-sm text-stone-600 mt-2">{persona.description}</p>
                            <div className="mt-3">
                                <h4 className="text-xs font-bold uppercase text-stone-500">{t('customerPersonas.topCategories')}</h4>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {persona.topCategories.map(cat => (
                                        <span key={cat} className="text-xs bg-stone-200 text-stone-700 px-2 py-1 rounded-full">{cat}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                 </div>
            )}
        </div>
    );
};

export default CustomerPersonas;