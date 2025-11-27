
import React, { useState, useRef, useEffect } from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import { generateVideo } from '../../services/geminiService';
import LoadingSpinner from '../LoadingSpinner';
import { Upload, Film, Download, X, AlertTriangle } from 'lucide-react';

const VideoStudio: React.FC = () => {
    const { t } = useI18n();
    const [image, setImage] = useState<{ file: File, preview: string } | null>(null);
    const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [loadingMessage, setLoadingMessage] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [hasApiKey, setHasApiKey] = useState(false);

    // FIX: Safely handle the return type of `t` function, which might be a string if the translation key is not found.
    const loadingMessagesResult = t('videoStudio.loadingMessages', { returnObjects: true });
    const loadingMessages = Array.isArray(loadingMessagesResult) ? loadingMessagesResult : [];

    useEffect(() => {
        const checkKey = async () => {
            const aistudio = (window as any).aistudio;
            if (aistudio?.hasSelectedApiKey) {
                const keyStatus = await aistudio.hasSelectedApiKey();
                setHasApiKey(keyStatus);
            }
        };
        checkKey();
    }, []);
    
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isLoading && loadingMessages.length > 0) {
            setLoadingMessage(loadingMessages[0]);
            let index = 0;
            interval = setInterval(() => {
                index = (index + 1) % loadingMessages.length;
                setLoadingMessage(loadingMessages[index]);
            }, 5000);
        }
        return () => clearInterval(interval);
    }, [isLoading, loadingMessages]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 4 * 1024 * 1024) {
                setError(t('imageStudio.errorSize'));
                return;
            }
            setError('');
            setImage({ file, preview: URL.createObjectURL(file) });
        }
    };

    const handleGenerate = async () => {
        if (!prompt) {
            setError(t('videoStudio.errorPrompt'));
            return;
        }
        setIsLoading(true);
        setError('');
        setGeneratedVideo(null);

        try {
            let imageParam: { base64: string, mimeType: string } | undefined;
            if (image) {
                const reader = new FileReader();
                const base64String = await new Promise<string>((resolve, reject) => {
                     reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
                     reader.onerror = reject;
                     reader.readAsDataURL(image.file);
                });
                imageParam = { base64: base64String, mimeType: image.file.type };
            }
            
            const videoUrl = await generateVideo(prompt, aspectRatio, imageParam);
            setGeneratedVideo(videoUrl);

        } catch (err: any) {
            if (err.message.includes("Requested entity was not found.")) {
                setError(t('videoStudio.apiKeyError'));
                setHasApiKey(false); // Force re-selection
            } else {
                setError(err.message || t('videoStudio.error'));
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectKey = async () => {
        const aistudio = (window as any).aistudio;
        if (aistudio?.openSelectKey) {
            await aistudio.openSelectKey();
            setHasApiKey(true);
        }
    };

    const clearImage = () => {
        setImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    if (!hasApiKey) {
        return (
             <div className="bg-white p-6 rounded-lg shadow-lg border border-stone-200 animate-fade-in text-center">
                <AlertTriangle size={48} className="mx-auto text-amber-500 mb-4" />
                <h2 className="text-xl font-serif text-stone-800 mb-2">{t('videoStudio.apiKeyPrompt')}</h2>
                <p className="text-stone-600 mb-4 max-w-md mx-auto">{t('videoStudio.apiKeyMessage')}</p>
                <p className="mb-6"><a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{t('videoStudio.apiKeyLink')}</a></p>
                <button onClick={handleSelectKey} className="btn-primary-gradient text-white font-bold py-2 px-6 rounded-md shadow-lg focus-ring">
                    {t('videoStudio.apiKeyButton')}
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg border border-stone-200 animate-fade-in">
            <h2 className="text-2xl font-serif text-stone-800 mb-2">{t('videoStudio.title')}</h2>
            <p className="text-stone-600 mb-6">{t('videoStudio.subtitle')}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Input Column */}
                <div className="space-y-4">
                    <input
                        type="file"
                        accept="image/jpeg, image/png, image/webp"
                        onChange={handleFileChange}
                        className="hidden"
                        ref={fileInputRef}
                    />
                     <div className="relative">
                        <label className="block text-sm font-medium text-stone-700 mb-1">{t('videoStudio.startImageLabel')}</label>
                        {!image ? (
                            <div
                                className="w-full h-48 border-2 border-dashed border-stone-300 rounded-lg flex flex-col items-center justify-center text-center text-stone-500 cursor-pointer hover:border-stone-400 hover:bg-stone-50 transition-colors"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload size={32} className="mb-2" />
                                <p className="font-semibold">{t('videoStudio.uploadPrompt')}</p>
                                <p className="text-xs mt-1">{t('imageStudio.uploadConstraints')}</p>
                            </div>
                        ) : (
                            <div className="relative">
                                <img src={image.preview} alt="Original" className="w-full h-auto object-contain rounded-lg shadow-md max-h-64" />
                                <button onClick={clearImage} className="absolute top-0 right-0 m-2 bg-black/50 text-white rounded-full p-1.5 focus-ring transition-opacity hover:opacity-100">
                                    <X size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                    
                    <div>
                        <label htmlFor="prompt" className="block text-sm font-medium text-stone-700">{t('videoStudio.promptLabel')}</label>
                        <textarea
                            id="prompt"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            rows={3}
                            placeholder={t('videoStudio.promptPlaceholder')}
                            className="mt-1 w-full form-input focus-ring"
                        />
                    </div>

                     <div>
                         <label htmlFor="aspect-ratio-video" className="block text-sm font-medium text-stone-700">{t('marketing.aspectRatio')}</label>
                        <select id="aspect-ratio-video" value={aspectRatio} onChange={e => setAspectRatio(e.target.value as '16:9' | '9:16')} className="mt-1 w-full form-input focus-ring">
                            <option value="16:9">16:9 (Landscape)</option>
                            <option value="9:16">9:16 (Portrait)</option>
                        </select>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !prompt}
                        className="w-full inline-flex items-center justify-center bg-stone-800 text-white font-bold py-3 px-4 rounded-md hover:bg-stone-900 transition-colors disabled:opacity-50"
                    >
                        <Film size={18} className="me-2" />
                        {isLoading ? t('videoStudio.loading') : t('videoStudio.generateButton')}
                    </button>
                </div>

                {/* Output Column */}
                <div className="space-y-4">
                     <h3 className="text-lg font-semibold text-stone-700">Generated Video</h3>
                    {isLoading && (
                        <div className="w-full aspect-video border-2 border-dashed border-stone-300 rounded-lg flex flex-col items-center justify-center">
                            <LoadingSpinner />
                            <p className="mt-4 text-stone-500 text-center text-sm animate-pulse">{loadingMessage}</p>
                        </div>
                    )}
                    {generatedVideo && !isLoading && (
                        <div className="relative">
                            <video src={generatedVideo} controls className="w-full h-auto rounded-lg shadow-md" />
                            <a
                                href={generatedVideo}
                                download="generated-video.mp4"
                                className="absolute bottom-2 right-2 inline-flex items-center bg-white/80 text-stone-800 font-bold py-2 px-3 rounded-full text-sm hover:bg-white shadow-md transition-all focus-ring"
                            >
                                <Download size={16} className="me-2" />
                                {t('videoStudio.download')}
                            </a>
                        </div>
                    )}
                     {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </div>
            </div>
        </div>
    );
};

export default VideoStudio;
