import React, { useState, useRef } from 'react';
import { getStyleAdvice } from '../../services/geminiService';
import LoadingSpinner from '../LoadingSpinner';
import { Sparkles, Paperclip, X } from 'lucide-react';
import { useI18n } from '../../i18n/I18nProvider';

interface StyleAdvisorProps {
    productName: string;
}

const StyleAdvisor: React.FC<StyleAdvisorProps> = ({ productName }) => {
    const { t } = useI18n();
    const [styleDesc, setStyleDesc] = useState('');
    const [advice, setAdvice] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [image, setImage] = useState<{file: File, preview: string} | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage({ file, preview: URL.createObjectURL(file) });
        }
    };

    const handleGetAdvice = async () => {
        if (!styleDesc.trim() && !image) {
            setError(t('styleAdvisor.error'));
            return;
        }
        setError('');
        setIsLoading(true);
        setAdvice('');

        try {
            let base64Image: string | undefined;
            let mimeType: string | undefined;

            if (image) {
                const reader = new FileReader();
                await new Promise<void>((resolve, reject) => {
                    reader.onloadend = () => {
                        base64Image = (reader.result as string).split(',')[1];
                        mimeType = image.file.type;
                        resolve();
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(image.file);
                });
            }

            const result = await getStyleAdvice(productName, styleDesc, base64Image, mimeType);
            setAdvice(result);
        } catch (err: any) {
            setError(err.message || t('styleAdvisor.fetchError'));
        } finally {
            setIsLoading(false);
        }
    };
    
    const clearImage = () => {
        setImage(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow-md border border-stone-200/80 space-y-4">
            <h3 className="text-2xl font-serif text-stone-800">{t('styleAdvisor.title')}</h3>
            <p className="text-stone-600">{t('styleAdvisor.subtitle')}</p>
            
            <textarea
                value={styleDesc}
                onChange={(e) => setStyleDesc(e.target.value)}
                rows={3}
                placeholder={t('styleAdvisor.placeholder')}
                className="w-full form-input focus-ring"
            />
            
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

            {image && (
                <div className="relative w-32 h-32">
                    <img src={image.preview} alt="Style preview" className="rounded-md w-full h-full object-cover"/>
                    <button onClick={clearImage} className="absolute -top-2 -right-2 bg-stone-700 text-white rounded-full p-1 focus-ring">
                        <X size={14}/>
                    </button>
                </div>
            )}
            
             <div className="flex items-center gap-4">
                <button 
                    onClick={handleGetAdvice}
                    disabled={isLoading}
                    className="inline-flex items-center bg-[--color-gold] text-white font-bold py-2 px-6 rounded-md hover:bg-[--color-gold-dark] transition-colors shadow-sm disabled:opacity-50 focus-ring"
                >
                    <Sparkles size={16} className="me-2"/>
                    {isLoading ? t('styleAdvisor.loading') : t('styleAdvisor.getAdviceButton')}
                </button>
                 <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center text-sm text-stone-600 font-semibold py-2 px-4 rounded-md border border-stone-300 hover:bg-stone-50 transition-colors focus-ring"
                >
                    <Paperclip size={14} className="me-2"/>
                    {image ? t('styleAdvisor.changePhoto') : t('styleAdvisor.uploadPhoto')}
                </button>
            </div>

            {error && <p className="text-red-500">{error}</p>}

            {isLoading && (
                <div className="flex items-center space-x-3 text-stone-500 py-2">
                    <LoadingSpinner size="sm" />
                    <span>{t('styleAdvisor.thinking')}</span>
                </div>
            )}

            {advice && (
                 <div className="mt-4 p-5 rounded-lg bg-stone-100/70 border border-stone-200 animate-fade-in">
                    <p className="text-stone-700 whitespace-pre-wrap">{advice}</p>
                </div>
            )}
        </div>
    );
};

export default StyleAdvisor;