
// FIX: The original file had duplicate and malformed imports for `React` and `aistudio`. These have been consolidated and corrected.
import React, { useState, useEffect, useRef, useContext } from 'react';
import { AppContext } from '../../App';
import { startChatSession } from '../../services/geminiService';
import { Chat, FunctionCall, GroundingChunk } from '@google/genai';
import { X, Send, User, Sparkles, Link as LinkIcon } from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';
import { Product } from '../../types';
import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nProvider';
import { useCurrency } from '../../hooks/useCurrency';

interface ShoppingAssistantProps {
    onClose: () => void;
}

interface ChatMessage {
    role: 'user' | 'model';
    parts: { text: string; products?: Product[], groundingChunks?: GroundingChunk[] };
}

const ShoppingAssistant: React.FC<ShoppingAssistantProps> = ({ onClose }) => {
    const context = useContext(AppContext);
    const { t } = useI18n();
    const { formatPrice } = useCurrency();
    const [chat, setChat] = useState<Chat | null>(null);
    const [history, setHistory] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        setChat(startChatSession());
        setHistory([{
            role: 'model',
            parts: { text: t('assistant.welcome') }
        }]);
    }, [t]);

    useEffect(() => {
        triggerRef.current = document.activeElement as HTMLElement;

        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        document.body.style.overflow = 'hidden';

        const focusableElements = modalRef.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusableElements || focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        const handleTabKey = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;
            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    e.preventDefault();
                }
            }
        };

        const currentModalRef = modalRef.current;
        firstElement.focus();
        currentModalRef?.addEventListener('keydown', handleTabKey);

        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
            currentModalRef?.removeEventListener('keydown', handleTabKey);
            triggerRef.current?.focus();
        };
    }, [onClose]);
    
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [history]);
    
    const handleSendMessage = async () => {
        if (!userInput.trim() || !chat || isLoading) return;

        const text = userInput;
        setUserInput('');
        setIsLoading(true);

        const userMessage: ChatMessage = { role: 'user', parts: { text } };
        setHistory(prev => [...prev, userMessage]);

        try {
            let response = await chat.sendMessage({ message: text });
            let modelResponseText = response.text;
            let products: Product[] | undefined;
            const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
            
            if (response.functionCalls && response.functionCalls.length > 0) {
                const fc = response.functionCalls[0] as FunctionCall;
                if (fc.name === 'findProducts' && context?.products) {
                    const { category, keywords } = fc.args;
                    const results = context.products.filter(p => {
                        const categoryMatch = category ? p.category.toLowerCase() === (category as string).toLowerCase() : true;
                        const keywordMatch = keywords ? p.name.toLowerCase().includes((keywords as string).toLowerCase()) || p.description.toLowerCase().includes((keywords as string).toLowerCase()) : true;
                        return categoryMatch && keywordMatch;
                    });
                    
                    const functionResponse = {
                        functionResponses: {
                           id: fc.id,
                           name: fc.name,
                           response: { results: results.map(p => ({ name: p.name, category: p.category })) }
                        }
                    };
                    
                    response = await chat.sendMessage(functionResponse);
                    modelResponseText = response.text;

                    if (results.length > 0) {
                         modelResponseText = response.text + t('assistant.hereAreTheItems');
                         products = results;
                    }
                }
            }
            
            setHistory(prev => [...prev, { role: 'model', parts: { text: modelResponseText, products, groundingChunks } }]);
        } catch (error) {
            console.error("Chat error:", error);
            setHistory(prev => [...prev, { role: 'model', parts: { text: t('assistant.error') } }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div 
            ref={modalRef}
            className="fixed bottom-6 right-6 z-[102] w-[calc(100vw-48px)] h-[calc(100vh-48px)] sm:w-96 sm:h-[600px] bg-white dark:bg-stone-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in rtl:right-auto rtl:left-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="assistant-title"
        >
            <header className="flex items-center justify-between p-4 border-b dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50">
                <div className="flex items-center gap-3">
                    <Sparkles size={24} className="text-stone-700 dark:text-amber-300"/>
                    <h3 id="assistant-title" className="font-serif text-xl font-semibold text-stone-800 dark:text-stone-200">{t('assistant.title')}</h3>
                </div>
                <button onClick={onClose} className="text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 transition-colors hover:scale-110 active:scale-95 focus-ring rounded-full" aria-label={t('assistant.closeAria')}>
                    <X size={24} />
                </button>
            </header>

            <div ref={chatContainerRef} className="flex-grow p-4 overflow-y-auto space-y-4">
                {history.map((msg, index) => (
                    <div key={index} className={`flex gap-3 items-start ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'model' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-stone-200 dark:bg-stone-700 flex items-center justify-center"><Sparkles size={18} className="text-stone-600 dark:text-amber-300"/></div>}
                        <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${msg.role === 'user' ? 'bg-stone-800 text-white rounded-br-none rtl:rounded-br-2xl rtl:rounded-bl-none' : 'bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 rounded-bl-none rtl:rounded-bl-2xl rtl:rounded-br-none'}`}>
                            <p className="text-sm whitespace-pre-wrap">{msg.parts.text}</p>
                            {msg.parts.products && (
                                <div className="mt-3 grid grid-cols-1 gap-2">
                                    {msg.parts.products.slice(0, 3).map(p => (
                                        <Link to={`/product/${p.id}`} key={p.id} onClick={onClose} className="flex items-center gap-2 p-2 bg-white dark:bg-stone-700/50 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-700 border dark:border-stone-600/50 transition-colors focus-ring">
                                            <img src={p.imageUrls[0]} alt={p.name} className="w-10 h-10 rounded-md object-cover"/>
                                            <div>
                                                <p className="text-xs font-semibold">{p.name}</p>
                                                <p className="text-xs text-stone-500 dark:text-stone-400">{formatPrice(p.price)}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                             {msg.parts.groundingChunks && msg.parts.groundingChunks.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-stone-200 dark:border-stone-700">
                                    <p className="text-xs font-semibold text-stone-500 dark:text-stone-400 mb-1">{t('assistant.sources')}</p>
                                    <div className="flex flex-col gap-1">
                                        {msg.parts.groundingChunks.map((chunk, i) => chunk.web && (
                                            <a href={chunk.web.uri} key={i} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 truncate">
                                                <LinkIcon size={12} />
                                                <span className="truncate">{chunk.web.title}</span>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        {msg.role === 'user' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center"><User size={18} className="text-white"/></div>}
                    </div>
                ))}
                {isLoading && (
                     <div className="flex gap-3 items-start justify-start">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-stone-200 dark:bg-stone-700 flex items-center justify-center"><Sparkles size={18} className="text-stone-600 dark:text-amber-300"/></div>
                        <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-stone-100 dark:bg-stone-800 rounded-bl-none rtl:rounded-bl-2xl rtl:rounded-br-none">
                            <LoadingSpinner size="sm"/>
                        </div>
                    </div>
                )}
            </div>

            <footer className="p-4 border-t dark:border-stone-700 bg-white dark:bg-stone-900">
                <div className="relative">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder={t('assistant.placeholder')}
                        className="w-full ps-4 pe-12 py-2 border border-stone-300 dark:border-stone-600 rounded-full focus:ring-stone-500 dark:bg-stone-800 focus:border-stone-500 transition focus-ring"
                        disabled={isLoading}
                    />
                    <button 
                        onClick={handleSendMessage} 
                        disabled={isLoading || !userInput.trim()}
                        className="absolute right-1 top-1/2 -translate-y-1/2 bg-stone-800 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-stone-900 transition-all disabled:bg-stone-300 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 focus-ring rtl:left-1 rtl:right-auto"
                        aria-label={t('assistant.sendAria')}
                    >
                        <Send size={16} />
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default ShoppingAssistant;
