
import React, { useState, useRef } from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import { editImage } from '../../services/geminiService';
import LoadingSpinner from '../LoadingSpinner';
import { Upload, Wand2, Download, X } from 'lucide-react';

const QUICK_EDITS = [
    "Place on a velvet cushion",
    "Change the background to a marble countertop",
    "Add dramatic, moody lighting",
    "Add a reflection underneath the object",
    "Make the background a solid, light gray",
    "Add a sunbeam hitting the object"
];

const ImageStudio: React.FC = () => {
    const { t } = useI18n();
    const [originalImage, setOriginalImage] = useState<{ file: File, preview: string } | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 4 * 1024 * 1024) { // 4MB limit for gemini
                setError(t('imageStudio.errorSize'));
                return;
            }
            setError('');
            setOriginalImage({ file, preview: URL.createObjectURL(file) });
            setGeneratedImage(null);
        }
    };

    const handleGenerate = async () => {
        if (!originalImage || !prompt) {
            setError(t('imageStudio.errorPrompt'));
            return;
        }
        setIsLoading(true);
        setError('');
        setGeneratedImage(null);

        try {
            const reader = new FileReader();
            reader.readAsDataURL(originalImage.file);
            reader.onloadend = async () => {
                const base64String = (reader.result as string).split(',')[1];
                const mimeType = originalImage.file.type;
                const newImageBase64 = await editImage(base64String, mimeType, prompt);
                if (newImageBase64) {
                    setGeneratedImage(`data:${mimeType};base64,${newImageBase64}`);
                } else {
                    throw new Error("The model did not return an image.");
                }
            };
        } catch (err: any) {
            setError(err.message || t('imageStudio.error'));
        } finally {
            setIsLoading(false);
        }
    };

    const clearImage = () => {
        setOriginalImage(null);
        setGeneratedImage(null);
        setPrompt('');
        setError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg border border-stone-200 animate-fade-in">
            <h2 className="text-2xl font-serif text-stone-800 mb-2">{t('imageStudio.title')}</h2>
            <p className="text-stone-600 mb-6">{t('imageStudio.subtitle')}</p>

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
                    {!originalImage ? (
                        <div
                            className="w-full h-64 border-2 border-dashed border-stone-300 rounded-lg flex flex-col items-center justify-center text-center text-stone-500 cursor-pointer hover:border-stone-400 hover:bg-stone-50 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload size={40} className="mb-2" />
                            <p className="font-semibold">{t('imageStudio.uploadPrompt')}</p>
                            <p className="text-xs mt-1">{t('imageStudio.uploadConstraints')}</p>
                        </div>
                    ) : (
                        <div className="relative">
                            <h3 className="text-lg font-semibold text-stone-700 mb-2">{t('imageStudio.original')}</h3>
                            <img src={originalImage.preview} alt="Original" className="w-full h-auto object-contain rounded-lg shadow-md max-h-80" />
                            <button onClick={clearImage} className="absolute top-0 right-0 m-2 bg-black/50 text-white rounded-full p-1.5 focus-ring transition-opacity hover:opacity-100">
                                <X size={16} />
                            </button>
                        </div>
                    )}
                    
                    {originalImage && (
                        <>
                            <div>
                                <label htmlFor="prompt" className="block text-sm font-medium text-stone-700">{t('imageStudio.promptLabel')}</label>
                                <textarea
                                    id="prompt"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    rows={3}
                                    placeholder={t('imageStudio.promptPlaceholder')}
                                    className="mt-1 w-full form-input focus-ring"
                                />
                                <div className="mt-2">
                                    <p className="text-xs font-semibold text-stone-500 mb-1">{t('imageStudio.quickEdits')}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {QUICK_EDITS.map(p => (
                                            <button key={p} onClick={() => setPrompt(p)} className="text-xs bg-stone-100 hover:bg-stone-200 text-stone-700 px-2 py-1 rounded-full transition-colors">
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleGenerate}
                                disabled={isLoading || !originalImage || !prompt}
                                className="w-full inline-flex items-center justify-center bg-stone-800 text-white font-bold py-3 px-4 rounded-md hover:bg-stone-900 transition-colors disabled:opacity-50"
                            >
                                <Wand2 size={18} className="me-2" />
                                {isLoading ? t('imageStudio.loading') : t('imageStudio.generateButton')}
                            </button>
                        </>
                    )}
                </div>

                {/* Output Column */}
                <div className="space-y-4">
                    {isLoading && (
                        <div className="w-full h-64 border-2 border-dashed border-stone-300 rounded-lg flex flex-col items-center justify-center">
                            <LoadingSpinner />
                            <p className="mt-2 text-stone-500">{t('imageStudio.loading')}</p>
                        </div>
                    )}
                    {generatedImage && !isLoading && (
                        <div className="space-y-4">
                            <div className="relative">
                                <h3 className="text-lg font-semibold text-stone-700 mb-2">{t('imageStudio.generated')}</h3>
                                <img src={generatedImage} alt="Generated" className="w-full h-auto object-contain rounded-lg shadow-md max-h-96" />
                                <a
                                    href={generatedImage}
                                    download="edited-image.png"
                                    className="absolute bottom-2 right-2 inline-flex items-center bg-white/80 text-stone-800 font-bold py-2 px-3 rounded-full text-sm hover:bg-white shadow-md transition-all focus-ring"
                                >
                                    <Download size={16} className="me-2" />
                                    {t('imageStudio.download')}
                                </a>
                            </div>
                        </div>
                    )}
                     {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </div>
            </div>
        </div>
    );
};

export default ImageStudio;
