
import React, { useState, useContext } from 'react';
import { createDreamPiece } from '../services/geminiService';
import LoadingSpinner from '../components/LoadingSpinner';
import AnimatedHeadline from '../components/AnimatedHeadline';
import { Wand2, Sparkles } from 'lucide-react';
import { useI18n } from '../i18n/I18nProvider';
import { useCurrency } from '../hooks/useCurrency';
import { AppContext } from '../App';

interface DreamPieceResult {
    name: string;
    description: string;
    category: string;
    price: number;
}

const DreamPiecePage: React.FC = () => {
    const { t } = useI18n();
    const { formatPrice } = useCurrency();
    const context = useContext(AppContext);
    const [description, setDescription] = useState('');
    const [result, setResult] = useState<DreamPieceResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleCreate = async () => {
        context?.playHapticFeedback();
        if (!description.trim()) {
            setError(t('dreamPiece.error'));
            return;
        }
        setError('');
        setIsLoading(true);
        setResult(null);
        try {
            const piece = await createDreamPiece(description);
            setResult(piece);
        } catch (err: any) {
            setError(err.message || t('dreamPiece.errorGeneral'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-6 py-20">
            <div className="text-center mb-12">
                <AnimatedHeadline text={t('dreamPiece.title')} as="h1" className="text-5xl font-serif text-stone-800" />
                <p className="text-stone-600 mt-2 max-w-2xl mx-auto">{t('dreamPiece.subtitle')}</p>
            </div>

            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-xl border border-stone-200">
                <div className="space-y-4">
                    <label htmlFor="dream-description" className="block text-lg font-semibold text-stone-700">{t('dreamPiece.label')}</label>
                    <textarea
                        id="dream-description"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        rows={5}
                        className="w-full form-input focus-ring"
                        placeholder={t('dreamPiece.placeholder')}
                    />
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button
                        onClick={handleCreate}
                        disabled={isLoading}
                        className="w-full inline-flex items-center justify-center btn-primary-gradient text-white font-bold py-3 px-8 rounded-md text-lg transform active:translate-y-0 shadow-lg disabled:opacity-50 focus-ring"
                    >
                        {isLoading ? <LoadingSpinner size="sm" /> : <><Wand2 size={20} className="me-2"/>{t('dreamPiece.button')}</>}
                    </button>
                </div>
            </div>

            {result && (
                <div className="mt-12 max-w-2xl mx-auto bg-stone-50 p-8 rounded-lg border border-dashed animate-fade-in">
                     <h2 className="text-3xl font-serif text-stone-800 flex items-center gap-3">
                        <Sparkles size={24} className="text-yellow-500" />
                        {t('dreamPiece.resultTitle')}
                    </h2>
                    <div className="mt-6 space-y-4">
                        <h3 className="text-2xl font-serif font-semibold text-stone-900">{result.name}</h3>
                        <p className="text-2xl font-bold text-[--color-gold-dark]">{formatPrice(result.price)}</p>
                        <p className="text-stone-700 italic">"{result.description}"</p>
                        <p className="text-sm text-stone-500 font-semibold uppercase tracking-wider">{result.category}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DreamPiecePage;
