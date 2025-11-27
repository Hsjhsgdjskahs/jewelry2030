import React, { useState } from 'react';
import { getProductCareInfo } from '../../services/geminiService';
import { Send, Sparkles } from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';
import { useI18n } from '../../i18n/I18nProvider';

interface CareGuideProps {
    productName: string;
}

interface CareMessage {
    role: 'user' | 'model';
    text: string;
}

const CareGuide: React.FC<CareGuideProps> = ({ productName }) => {
    const { t } = useI18n();
    const [history, setHistory] = useState<CareMessage[]>([]);
    const [question, setQuestion] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleAskQuestion = async () => {
        if (!question.trim()) return;
        
        const newHistory = [...history, { role: 'user' as const, text: question }];
        setHistory(newHistory);
        setQuestion('');
        setIsLoading(true);

        try {
            const answer = await getProductCareInfo(productName, question);
            setHistory([...newHistory, { role: 'model' as const, text: answer }]);
        } catch (error) {
            setHistory([...newHistory, { role: 'model' as const, text: t('careGuide.error') }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white p-8 rounded-lg shadow-lg border border-stone-200">
            <h3 className="text-2xl font-serif text-stone-800 mb-2 flex items-center">
                <Sparkles size={20} className="me-3 text-[--color-gold-dark]"/>
                {t('careGuide.title')}
            </h3>
            <p className="text-stone-600 mb-6">{t('careGuide.subtitle', { productName })}</p>
            
            <div className="space-y-4 mb-4 max-h-64 overflow-y-auto pr-2">
                {history.length === 0 && (
                    <div className="text-center text-stone-500 p-4">
                        {t('careGuide.exampleQuestions')}
                    </div>
                )}
                {history.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-lg px-4 py-2 ${msg.role === 'user' ? 'bg-stone-800 text-white' : 'bg-stone-100'}`}>
                           {msg.text}
                        </div>
                    </div>
                ))}
                 {isLoading && (
                    <div className="justify-start flex">
                        <div className="bg-stone-100 rounded-lg px-4 py-3">
                            <LoadingSpinner size="sm" />
                        </div>
                    </div>
                 )}
            </div>

            <div className="relative">
                <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
                    placeholder={t('careGuide.placeholder')}
                    className="w-full ps-4 pe-12 py-2 border border-stone-300 rounded-full focus:ring-2 focus:ring-[--color-gold-dark]/50 focus:border-[--color-gold-dark] transition focus-ring"
                    disabled={isLoading}
                />
                <button
                    onClick={handleAskQuestion}
                    disabled={isLoading || !question.trim()}
                    className="absolute right-1 top-1/2 -translate-y-1/2 bg-[--color-gold] text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-[--color-gold-dark] transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 focus-ring rtl:left-1 rtl:right-auto"
                    aria-label={t('careGuide.askAria')}
                >
                    <Send size={16} />
                </button>
            </div>
        </div>
    );
};

export default CareGuide;