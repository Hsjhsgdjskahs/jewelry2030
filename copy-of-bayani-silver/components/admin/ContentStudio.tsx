
// FIX: The original file had duplicate and malformed imports for `React` and `aistudio`. These have been consolidated and corrected.
import React, { useState } from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import { generateDescription, generateMetaDescription, generateProductStory, generateContentWithThinking } from '../../services/geminiService';
import LoadingSpinner from '../LoadingSpinner';
import { Sparkles, Copy, BrainCircuit } from 'lucide-react';

const ContentStudio: React.FC = () => {
    const { t } = useI18n();
    const [productName, setProductName] = useState('');
    const [category, setCategory] = useState('Tableware');
    const [results, setResults] = useState<{
        description: string;
        metaDescription: string;
        story: string;
    } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [copiedField, setCopiedField] = useState<string | null>(null);
    
    // State for the new feature
    const [thinkingPrompt, setThinkingPrompt] = useState('');
    const [thinkingResult, setThinkingResult] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [thinkingError, setThinkingError] = useState('');


    const handleGenerate = async () => {
        if (!productName.trim()) {
            setError(t('contentStudio.error'));
            return;
        }
        setIsLoading(true);
        setError('');
        setResults(null);
        try {
            // Generate description and story in parallel
            const [description, story] = await Promise.all([
                generateDescription(productName, category),
                generateProductStory(productName, category)
            ]);
            // Generate meta description based on the new description
            const metaDescription = await generateMetaDescription(productName, description);
            
            setResults({ description, metaDescription, story });
        } catch (err: any) {
            setError(err.message || t('contentStudio.errorGeneral'));
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleGenerateWithThinking = async () => {
        if (!thinkingPrompt.trim()) {
            setThinkingError(t('contentStudio.thinkingErrorPrompt'));
            return;
        }
        setIsThinking(true);
        setThinkingError('');
        setThinkingResult('');
        try {
            const result = await generateContentWithThinking(thinkingPrompt);
            setThinkingResult(result);
        } catch (err: any) {
            setThinkingError(err.message || t('contentStudio.errorGeneral'));
        } finally {
            setIsThinking(false);
        }
    };

    const handleCopy = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg border border-stone-200 animate-fade-in">
            <h2 className="text-2xl font-serif text-stone-800 mb-2">{t('contentStudio.title')}</h2>
            <p className="text-stone-600 mb-6">{t('contentStudio.subtitle')}</p>
            
            <div className="space-y-4 p-4 border rounded-md bg-stone-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="productName" className="block text-sm font-medium text-stone-700">{t('contentStudio.productNameLabel')}</label>
                        <input
                            type="text"
                            id="productName"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            placeholder={t('contentStudio.productNamePlaceholder')}
                            className="mt-1 w-full form-input focus-ring"
                        />
                    </div>
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-stone-700">{t('contentStudio.categoryLabel')}</label>
                        <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 w-full form-input focus-ring">
                            <option>Tableware</option>
                            <option>Jewelry</option>
                            <option>Decor</option>
                            <option>Other</option>
                        </select>
                    </div>
                </div>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="w-full mt-2 inline-flex items-center justify-center bg-stone-800 text-white font-bold py-2 px-4 rounded-md hover:bg-stone-900 transition-colors disabled:opacity-50"
                >
                    <Sparkles size={16} className="me-2" />
                    {isLoading ? t('contentStudio.loading') : t('contentStudio.generateButton')}
                </button>
            </div>
            
            {isLoading && <div className="mt-6 text-center"><LoadingSpinner /></div>}
            
            {results && (
                <div className="mt-6 space-y-6 animate-fade-in">
                    <GeneratedField 
                        title={t('contentStudio.descriptionTitle')} 
                        content={results.description}
                        onCopy={() => handleCopy(results.description, 'description')}
                        isCopied={copiedField === 'description'}
                    />
                    <GeneratedField 
                        title={t('contentStudio.metaDescriptionTitle')} 
                        content={results.metaDescription}
                        onCopy={() => handleCopy(results.metaDescription, 'meta')}
                        isCopied={copiedField === 'meta'}
                    />
                    <GeneratedField 
                        title={t('contentStudio.storyTitle')} 
                        content={results.story}
                        onCopy={() => handleCopy(results.story, 'story')}
                        isCopied={copiedField === 'story'}
                    />
                </div>
            )}
            
            {/* Thinking Mode Generator */}
            <div className="mt-8 pt-6 border-t border-stone-200">
                <h3 className="text-xl font-serif text-stone-800 mb-2 flex items-center gap-2"><BrainCircuit size={20} className="text-indigo-500" /> {t('contentStudio.thinkingTitle')}</h3>
                <p className="text-stone-600 mb-4">{t('contentStudio.thinkingSubtitle')}</p>
                <div className="p-4 border rounded-md bg-stone-50">
                     <div>
                        <label htmlFor="thinkingPrompt" className="block text-sm font-medium text-stone-700">{t('contentStudio.thinkingPrompt')}</label>
                        <textarea
                            id="thinkingPrompt"
                            value={thinkingPrompt}
                            onChange={(e) => setThinkingPrompt(e.target.value)}
                            rows={4}
                            placeholder={t('contentStudio.thinkingPlaceholder')}
                            className="mt-1 w-full form-input focus-ring"
                        />
                    </div>
                    {thinkingError && <p className="text-red-500 text-sm mt-2">{thinkingError}</p>}
                    <button
                        onClick={handleGenerateWithThinking}
                        disabled={isThinking}
                        className="w-full mt-2 inline-flex items-center justify-center bg-indigo-600 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                        <Sparkles size={16} className="me-2" />
                        {isThinking ? t('contentStudio.thinkingLoading') : t('contentStudio.thinkingGenerate')}
                    </button>
                </div>

                {isThinking && <div className="mt-6 text-center"><LoadingSpinner /></div>}
                
                {thinkingResult && (
                    <div className="mt-6 animate-fade-in">
                        <GeneratedField 
                            title={t('contentStudio.thinkingResult')} 
                            content={thinkingResult}
                            onCopy={() => handleCopy(thinkingResult, 'thinking')}
                            isCopied={copiedField === 'thinking'}
                            rows={10}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

interface GeneratedFieldProps {
    title: string;
    content: string;
    onCopy: () => void;
    isCopied: boolean;
    rows?: number;
}

const GeneratedField: React.FC<GeneratedFieldProps> = ({ title, content, onCopy, isCopied, rows=5 }) => {
    const { t } = useI18n();
    return (
        <div className="relative">
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-lg text-stone-700">{title}</h3>
                <button 
                    onClick={onCopy} 
                    className="text-stone-500 hover:text-stone-800 p-2 rounded-full hover:bg-stone-100 transition-colors"
                    title="Copy"
                >
                    <Copy size={16} />
                </button>
            </div>
            <textarea
                readOnly
                value={content}
                rows={rows}
                className="w-full whitespace-pre-wrap bg-stone-50 p-3 rounded-md text-stone-800 border form-input resize-y"
            />
            {isCopied && <div className="absolute top-0 right-12 bg-stone-800 text-white text-xs px-2 py-1 rounded-md animate-fade-in">{t('contentStudio.copied')}</div>}
        </div>
    );
};

export default ContentStudio;
