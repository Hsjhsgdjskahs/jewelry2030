
import React, { useState, useEffect, useRef } from 'react';
import { suggestEngraving } from '../../services/geminiService';
import LoadingSpinner from '../LoadingSpinner';
import { X, Sparkles, Type, Eye } from 'lucide-react';
import { useI18n } from '../../i18n/I18nProvider';

interface EngravingModalProps {
    productName: string;
    onClose: () => void;
}

const EngravingModal: React.FC<EngravingModalProps> = ({ productName, onClose }) => {
    const { t } = useI18n();
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const modalRef = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState<'ideas' | 'preview'>('ideas');
    
    // Preview State
    const [customText, setCustomText] = useState('');
    const [selectedFont, setSelectedFont] = useState('font-serif');

    useEffect(() => {
        const fetchSuggestions = async () => {
            setIsLoading(true);
            setError('');
            try {
                const result = await suggestEngraving(productName);
                setSuggestions(result);
            } catch (err: any) {
                setError(err.message || t('engraving.error'));
            } finally {
                setIsLoading(false);
            }
        };
        fetchSuggestions();
    }, [productName, t]);
    
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        document.body.style.overflow = 'hidden';

        const firstFocusableElement = modalRef.current?.querySelector('button') as HTMLElement;
        firstFocusableElement?.focus();

        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [onClose]);

    const handleSelectSuggestion = (text: string) => {
        setCustomText(text);
        setActiveTab('preview');
    };

    return (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="engraving-title"
        >
            <div
                ref={modalRef}
                className="bg-white dark:bg-stone-900 rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden relative p-6"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 id="engraving-title" className="text-2xl font-serif text-stone-800 dark:text-stone-200 flex items-center">
                        <Sparkles size={20} className="me-3 text-[--color-gold-dark]"/>
                        {t('engraving.title')}
                    </h2>
                     <button 
                        onClick={onClose} 
                        className="text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors hover:scale-110 active:scale-95 focus-ring rounded-full"
                        aria-label={t('engraving.closeAria')}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-lg mb-6">
                    <button
                        onClick={() => setActiveTab('ideas')}
                        className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium transition-all ${activeTab === 'ideas' ? 'bg-white dark:bg-stone-700 shadow-sm text-stone-900 dark:text-stone-100' : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'}`}
                    >
                        <Sparkles size={16} className="me-2" />
                        {t('engraving.tabIdeas')}
                    </button>
                    <button
                        onClick={() => setActiveTab('preview')}
                        className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium transition-all ${activeTab === 'preview' ? 'bg-white dark:bg-stone-700 shadow-sm text-stone-900 dark:text-stone-100' : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'}`}
                    >
                        <Eye size={16} className="me-2" />
                        {t('engraving.tabPreview')}
                    </button>
                </div>

                <div className="overflow-y-auto flex-grow custom-scrollbar px-1">
                    {activeTab === 'ideas' ? (
                        <>
                            <p className="text-stone-600 dark:text-stone-400 mb-6">{t('engraving.subtitle', { productName })}</p>
                            {isLoading && <div className="py-8"><LoadingSpinner /></div>}
                            {error && <p className="text-red-500 py-8 text-center">{error}</p>}
                            {!isLoading && !error && (
                                <ul className="space-y-3">
                                    {suggestions.map((s, i) => (
                                        <li key={i}>
                                            <button 
                                                onClick={() => handleSelectSuggestion(s)}
                                                className="w-full text-center p-4 bg-stone-50 dark:bg-stone-800/50 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 hover:border-stone-300 rounded-md text-stone-700 dark:text-stone-300 font-serif italic text-lg transition-all focus-ring"
                                            >
                                                "{s}"
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </>
                    ) : (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">{t('engraving.enterText')}</label>
                                <input
                                    type="text"
                                    value={customText}
                                    onChange={(e) => setCustomText(e.target.value)}
                                    placeholder={t('engraving.placeholder')}
                                    className="w-full form-input focus-ring text-center text-lg font-serif"
                                    maxLength={20}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">{t('engraving.chooseFont')}</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { id: 'font-serif', label: 'Serif', style: { fontFamily: "'Playfair Display', serif" } },
                                        { id: 'font-sans', label: 'Sans', style: { fontFamily: "'Inter', sans-serif" } },
                                        { id: 'font-mono', label: 'Mono', style: { fontFamily: "monospace" } },
                                    ].map((font) => (
                                        <button
                                            key={font.id}
                                            onClick={() => setSelectedFont(font.id)}
                                            className={`py-2 border rounded-md transition-all ${selectedFont === font.id ? 'bg-stone-800 text-white border-stone-800 dark:bg-stone-100 dark:text-stone-900' : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-600 hover:border-stone-400'}`}
                                            style={font.style}
                                        >
                                            Aa
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="relative w-full aspect-video rounded-lg shadow-inner overflow-hidden bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 flex items-center justify-center border-4 border-gray-400">
                                {/* Metallic Texture Overlay */}
                                <div className="absolute inset-0 opacity-50" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%239C92AC\' fill-opacity=\'0.2\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")' }}></div>
                                
                                {/* Etched Text Effect */}
                                <p 
                                    className={`relative z-10 text-4xl text-gray-600 ${selectedFont}`}
                                    style={{ 
                                        textShadow: '1px 1px 0px rgba(255,255,255,0.8), -1px -1px 1px rgba(0,0,0,0.6)',
                                        opacity: 0.8
                                    }}
                                >
                                    {customText || t('engraving.previewPlaceholder')}
                                </p>
                            </div>
                            <p className="text-xs text-center text-stone-500 italic">{t('engraving.previewDisclaimer')}</p>
                        </div>
                    )}
                </div>

                 <button 
                    onClick={onClose}
                    className="w-full mt-6 bg-stone-800 text-white font-bold py-2 px-6 rounded-md hover:bg-stone-900 transition-colors shadow-sm focus-ring"
                >
                    {t('engraving.closeButton')}
                </button>
            </div>
        </div>
    );
};

export default EngravingModal;
