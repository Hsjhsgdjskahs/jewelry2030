
import React, { useState, useContext } from 'react';
import { AppContext } from '../App';
import { findGift } from '../services/geminiService';
import { Product } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import ProductCard from '../components/ProductCard';
import AnimatedHeadline from '../components/AnimatedHeadline';
import { Gift, Sparkles } from 'lucide-react';
import { useI18n } from '../i18n/I18nProvider';

const GiftFinderPage: React.FC = () => {
    const context = useContext(AppContext);
    const { t } = useI18n();
    const [occasion, setOccasion] = useState('');
    const [recipient, setRecipient] = useState('');
    const [priceRange, setPriceRange] = useState('');
    const [results, setResults] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [hasSearched, setHasSearched] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        context?.playHapticFeedback();
        if (!occasion || !recipient || !priceRange) {
            setError(t('giftFinder.error'));
            return;
        }
        setError('');
        setIsLoading(true);
        setHasSearched(true);
        try {
            const giftResults = await findGift(occasion, recipient, priceRange, context?.products || []);
            setResults(giftResults);
        } catch (err: any) {
            setError(err.message || t('giftFinder.searchError'));
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const occasions = ['Anniversary', 'Birthday', 'Wedding', 'Thank You', 'Just Because'];
    const recipients = ['Partner / Spouse', 'Friend', 'Family Member', 'Colleague'];
    const priceRanges = ['under $200', '$200 - $500', 'over $500'];

    return (
        <div className="container mx-auto px-6 py-20">
            <div className="text-center mb-12">
                <AnimatedHeadline text={t('giftFinder.title')} as="h1" className="text-5xl font-serif text-stone-800" />
                <p className="text-stone-600 mt-2">{t('giftFinder.subtitle')}</p>
            </div>
            
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-xl border border-stone-200">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="occasion" className="block text-sm font-medium text-stone-700">{t('giftFinder.occasionLabel')}</label>
                        <select id="occasion" value={occasion} onChange={e => setOccasion(e.target.value)} className="mt-1 w-full form-input focus-ring">
                            <option value="" disabled>{t('giftFinder.selectOccasion')}</option>
                            {occasions.map(o => <option key={o} value={o}>{t(`giftFinder.occasions.${o.replace(' ', '')}`)}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="recipient" className="block text-sm font-medium text-stone-700">{t('giftFinder.recipientLabel')}</label>
                        <select id="recipient" value={recipient} onChange={e => setRecipient(e.target.value)} className="mt-1 w-full form-input focus-ring">
                             <option value="" disabled>{t('giftFinder.selectRecipient')}</option>
                             {recipients.map(r => <option key={r} value={r}>{t(`giftFinder.recipients.${r.replace(' / ', '').replace(' ', '')}`)}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="priceRange" className="block text-sm font-medium text-stone-700">{t('giftFinder.priceRangeLabel')}</label>
                        <select id="priceRange" value={priceRange} onChange={e => setPriceRange(e.target.value)} className="mt-1 w-full form-input focus-ring">
                            <option value="" disabled>{t('giftFinder.selectPriceRange')}</option>
                            {priceRanges.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full inline-flex items-center justify-center btn-primary-gradient text-white font-bold py-3 px-8 rounded-md text-lg transform active:translate-y-0 shadow-lg disabled:opacity-50 focus-ring"
                    >
                       <Sparkles size={20} className="me-2"/>
                       {isLoading ? t('giftFinder.searching') : t('giftFinder.findButton')}
                    </button>
                </form>
            </div>

            {hasSearched && (
                <div className="mt-16">
                    <h2 className="text-3xl font-serif text-center mb-8">{t('giftFinder.resultsTitle')}</h2>
                    {isLoading ? (
                        <LoadingSpinner />
                    ) : results.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {results.map(product => <ProductCard key={product.id} product={product} />)}
                        </div>
                    ) : (
                         <div className="text-center py-20 px-6 bg-stone-50/70 rounded-lg border border-dashed">
                            <Gift size={40} className="mx-auto text-stone-400 mb-4"/>
                            <h3 className="text-2xl font-serif text-stone-700">{t('giftFinder.noResultsTitle')}</h3>
                            <p className="text-stone-500 mt-2">{t('giftFinder.noResultsSubtitle')}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default GiftFinderPage;
