import React, { useState, useEffect, useRef } from 'react';
import { Product } from '../../types';
import { compareProducts } from '../../services/geminiService';
import LoadingSpinner from '../LoadingSpinner';
import { X, Scale, Sparkles } from 'lucide-react';
import { useI18n } from '../../i18n/I18nProvider';
import { useCurrency } from '../../hooks/useCurrency';

interface ComparisonModalProps {
    products: Product[];
    onClose: () => void;
}

const ComparisonModal: React.FC<ComparisonModalProps> = ({ products, onClose }) => {
    const { t } = useI18n();
    const { formatPrice } = useCurrency();
    const [comparison, setComparison] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchComparison = async () => {
            if (products.length < 2) return;
            setIsLoading(true);
            setError('');
            try {
                const result = await compareProducts(products);
                setComparison(result);
            } catch (err: any) {
                setError(err.message || t('comparison.error'));
            } finally {
                setIsLoading(false);
            }
        };
        fetchComparison();
    }, [products, t]);
    
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        document.body.style.overflow = 'hidden';
        modalRef.current?.focus();
        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [onClose]);

    return (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="comparison-title"
        >
            <div
                ref={modalRef}
                tabIndex={-1}
                className="bg-white dark:bg-stone-900 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden relative"
                onClick={e => e.stopPropagation()}
            >
                <header className="p-6 border-b dark:border-stone-700 flex-shrink-0">
                    <h2 id="comparison-title" className="text-2xl font-serif text-stone-800 dark:text-stone-200 flex items-center">
                        <Scale size={20} className="me-3 text-sky-600"/>
                        {t('comparison.title')}
                    </h2>
                     <button 
                        onClick={onClose} 
                        className="absolute top-3 right-3 text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 transition-colors hover:scale-110 active:scale-95 focus-ring rounded-full rtl:left-3 rtl:right-auto"
                        aria-label={t('comparison.closeAria')}
                    >
                        <X size={24} />
                    </button>
                </header>
                <div className="p-6 overflow-y-auto">
                    {(isLoading || error) && (
                        <div className="py-8 flex items-center justify-center">
                             {isLoading && <LoadingSpinner />}
                             {error && <p className="text-red-500 text-center">{error}</p>}
                        </div>
                    )}
                    
                    {!isLoading && !error && (
                        <>
                            <div className="mb-8 p-4 bg-stone-50 dark:bg-stone-800 rounded-lg border dark:border-stone-700">
                                <h3 className="font-semibold flex items-center text-stone-800 dark:text-stone-200 mb-2">
                                    <Sparkles size={16} className="me-2 text-yellow-500" />
                                    {t('comparison.aiSummary')}
                                </h3>
                                <p className="text-sm text-stone-600 dark:text-stone-400 whitespace-pre-wrap">{comparison}</p>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr>
                                            <th className="p-2 text-start text-sm font-semibold uppercase text-stone-600 dark:text-stone-400 w-1/4">Feature</th>
                                            {products.map(p => (
                                                <th key={p.id} className="p-2 border-b-2 dark:border-stone-700">
                                                    <img src={p.imageUrls[0]} alt={p.name} className="w-24 h-24 object-cover mx-auto rounded-md" />
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y dark:divide-stone-700">
                                        <tr className="bg-stone-50 dark:bg-stone-800/50">
                                            <td className="p-3 font-semibold">Name</td>
                                            {products.map(p => <td key={p.id} className="p-3 text-center font-serif text-lg">{p.name}</td>)}
                                        </tr>
                                        <tr>
                                            <td className="p-3 font-semibold">Price</td>
                                            {products.map(p => <td key={p.id} className="p-3 text-center text-[--color-gold-dark] font-bold">{formatPrice(p.price)}</td>)}
                                        </tr>
                                         <tr className="bg-stone-50 dark:bg-stone-800/50">
                                            <td className="p-3 font-semibold">Category</td>
                                            {products.map(p => <td key={p.id} className="p-3 text-center">{p.category}</td>)}
                                        </tr>
                                         <tr>
                                            <td className="p-3 font-semibold">Description</td>
                                            {products.map(p => <td key={p.id} className="p-3 text-center text-sm text-stone-600 dark:text-stone-400">{p.description}</td>)}
                                        </tr>
                                        <tr className="bg-stone-50 dark:bg-stone-800/50">
                                            <td className="p-3 font-semibold">Engravable</td>
                                            {products.map(p => <td key={p.id} className="p-3 text-center">{p.isEngravable ? 'Yes' : 'No'}</td>)}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ComparisonModal;
