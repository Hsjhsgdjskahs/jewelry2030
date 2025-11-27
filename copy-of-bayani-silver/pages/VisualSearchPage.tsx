
import React, { useState, useContext, useMemo } from 'react';
import { AppContext } from '../App';
import { analyzeImageForSearch } from '../services/geminiService';
import { Product } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import ProductCard from '../components/ProductCard';
import { Upload, Search, X } from 'lucide-react';
import AnimatedHeadline from '../components/AnimatedHeadline';
import { useI18n } from '../i18n/I18nProvider';

const VisualSearchPage: React.FC = () => {
    const context = useContext(AppContext);
    const { t } = useI18n();
    const [image, setImage] = useState<{ file: File, previewUrl: string } | null>(null);
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                setError(t('visualSearch.errorSize'));
                return;
            }
            setError('');
            setImage({ file, previewUrl: URL.createObjectURL(file) });
            setDescription(''); // Reset description on new image
        }
    };

    const handleAnalyzeImage = async () => {
        if (!image) {
            setError(t('visualSearch.errorUpload'));
            return;
        }
        setIsLoading(true);
        setError('');
        setDescription('');

        try {
            const reader = new FileReader();
            reader.readAsDataURL(image.file);
            reader.onloadend = async () => {
                const base64String = (reader.result as string).split(',')[1];
                const mimeType = image.file.type;
                const generatedDescription = await analyzeImageForSearch(base64String, mimeType);
                setDescription(generatedDescription);
                setIsLoading(false);
            };
        } catch (err: any) {
            setError(err.message || t('visualSearch.errorAnalyze'));
            setIsLoading(false);
        }
    };

    const clearImage = () => {
        setImage(null);
        setDescription('');
        setError('');
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    const searchResults = useMemo(() => {
        if (!description || !context?.products) return [];
        const searchTerms = description.toLowerCase().split(/[\s,]+/);
        return context.products.filter(product => {
            const productText = `${product.name} ${product.description} ${product.category}`.toLowerCase();
            return searchTerms.some(term => productText.includes(term));
        });
    }, [description, context?.products]);

    return (
        <div className="container mx-auto px-6 py-20">
            <div className="text-center mb-12">
                <AnimatedHeadline text={t('visualSearch.title')} as="h1" className="text-5xl font-serif text-stone-800" />
                <p className="text-stone-600 mt-2">{t('visualSearch.subtitle')}</p>
            </div>

            <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-xl border border-stone-200">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="w-full md:w-1/2">
                        <input
                            type="file"
                            accept="image/jpeg, image/png, image/webp"
                            onChange={handleFileChange}
                            className="hidden"
                            ref={fileInputRef}
                            aria-label={t('visualSearch.uploadAria')}
                        />
                        {image ? (
                             <div className="relative group">
                                <img src={image.previewUrl} alt="Preview" className="w-full h-64 object-cover rounded-lg shadow-md" />
                                <button
                                    onClick={clearImage}
                                    className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity focus-ring"
                                    aria-label={t('visualSearch.removeAria')}
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        ) : (
                            <div
                                className="w-full h-64 border-2 border-dashed border-stone-300 rounded-lg flex flex-col items-center justify-center text-center text-stone-500 cursor-pointer hover:border-stone-400 hover:bg-stone-50 transition-colors"
                                onClick={() => fileInputRef.current?.click()}
                                onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files) { fileInputRef.current!.files = e.dataTransfer.files; handleFileChange({ target: fileInputRef.current } as any); } }}
                                onDragOver={(e) => e.preventDefault()}
                            >
                                <Upload size={40} className="mb-2" />
                                <p className="font-semibold">{t('visualSearch.uploadPrompt')}</p>
                                <p className="text-xs mt-1">{t('visualSearch.uploadConstraints')}</p>
                            </div>
                        )}
                    </div>
                     <div className="w-full md:w-1/2 flex flex-col items-center">
                        <p className="text-stone-600 text-center mb-4">{t('visualSearch.getStarted')}</p>
                         <button
                            onClick={handleAnalyzeImage}
                            disabled={isLoading || !image}
                            className="w-full inline-flex items-center justify-center bg-[--color-gold] text-white font-bold py-3 px-8 rounded-md text-lg transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 shadow-lg hover:shadow-xl hover:bg-[--color-gold-dark] disabled:opacity-50"
                        >
                           {isLoading ? <LoadingSpinner size="sm" /> : <Search size={20} className="me-2"/>}
                           {isLoading ? t('visualSearch.loading') : t('visualSearch.searchButton')}
                        </button>
                    </div>
                </div>
                 {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
            </div>

            {(description || searchResults.length > 0) && (
                <div className="mt-16 animate-fade-in">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-serif text-stone-800">{t('visualSearch.resultsTitle')}</h2>
                         {description && <p className="text-stone-600 mt-2 italic">"{description}"</p>}
                    </div>
                    {searchResults.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {searchResults.map(product => <ProductCard key={product.id} product={product} />)}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-stone-600">{t('visualSearch.noResults')}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
export default VisualSearchPage;
