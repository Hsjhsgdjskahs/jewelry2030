
// FIX: The original file had duplicate and malformed imports for `React` and `aistudio`. These have been consolidated and corrected.
import React, { useState, useRef } from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import { analyzeVideoFrames } from '../../services/geminiService';
import LoadingSpinner from '../LoadingSpinner';
import { Upload, FileSearch, X } from 'lucide-react';

const VideoAnalysisStudio: React.FC = () => {
    const { t } = useI18n();
    const [video, setVideo] = useState<{ file: File, preview: string } | null>(null);
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);
    const [question, setQuestion] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 50 * 1024 * 1024) { // 50MB limit
                setError(t('videoAnalysis.errorSize'));
                return;
            }
            setError('');
            setVideo({ file, preview: URL.createObjectURL(file) });
            setAnalysisResult(null);
        }
    };

    const handleAnalyze = async () => {
        if (!video || !question) {
            setError(t('videoAnalysis.errorPrompt'));
            return;
        }
        setIsLoading(true);
        setError('');
        setAnalysisResult(null);

        try {
            const result = await analyzeVideoFrames(video.file, question);
            setAnalysisResult(result);
        } catch (err: any) {
            setError(err.message || t('videoAnalysis.error'));
        } finally {
            setIsLoading(false);
        }
    };

    const clearVideo = () => {
        setVideo(null);
        setAnalysisResult(null);
        setQuestion('');
        setError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg border border-stone-200 animate-fade-in">
            <h2 className="text-2xl font-serif text-stone-800 mb-2">{t('videoAnalysis.title')}</h2>
            <p className="text-stone-600 mb-6">{t('videoAnalysis.subtitle')}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div className="space-y-4">
                    <input
                        type="file"
                        accept="video/mp4,video/quicktime,video/webm"
                        onChange={handleFileChange}
                        className="hidden"
                        ref={fileInputRef}
                    />
                    {!video ? (
                        <div
                            className="w-full h-64 border-2 border-dashed border-stone-300 rounded-lg flex flex-col items-center justify-center text-center text-stone-500 cursor-pointer hover:border-stone-400 hover:bg-stone-50 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload size={40} className="mb-2" />
                            <p className="font-semibold">{t('videoAnalysis.uploadPrompt')}</p>
                            <p className="text-xs mt-1">{t('videoAnalysis.uploadConstraints')}</p>
                        </div>
                    ) : (
                        <div className="relative">
                            <video src={video.preview} controls className="w-full h-auto rounded-lg shadow-md max-h-80" />
                            <button onClick={clearVideo} className="absolute top-0 right-0 m-2 bg-black/50 text-white rounded-full p-1.5 focus-ring transition-opacity hover:opacity-100">
                                <X size={16} />
                            </button>
                        </div>
                    )}
                    
                    {video && (
                        <>
                            <div>
                                <label htmlFor="question" className="block text-sm font-medium text-stone-700">{t('videoAnalysis.questionLabel')}</label>
                                <textarea
                                    id="question"
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    rows={3}
                                    placeholder={t('videoAnalysis.questionPlaceholder')}
                                    className="mt-1 w-full form-input focus-ring"
                                />
                            </div>
                            <button
                                onClick={handleAnalyze}
                                disabled={isLoading || !video || !question}
                                className="w-full inline-flex items-center justify-center bg-stone-800 text-white font-bold py-3 px-4 rounded-md hover:bg-stone-900 transition-colors disabled:opacity-50"
                            >
                                <FileSearch size={18} className="me-2" />
                                {isLoading ? t('videoAnalysis.loading') : t('videoAnalysis.analyzeButton')}
                            </button>
                        </>
                    )}
                </div>

                <div className="space-y-4">
                    {isLoading && (
                        <div className="w-full h-64 border-2 border-dashed border-stone-300 rounded-lg flex flex-col items-center justify-center">
                            <LoadingSpinner />
                            <p className="mt-2 text-stone-500">{t('videoAnalysis.loading')}</p>
                        </div>
                    )}
                    {analysisResult && !isLoading && (
                        <div>
                            <h3 className="text-lg font-semibold text-stone-700 mb-2">{t('videoAnalysis.resultTitle')}</h3>
                            <div className="p-4 bg-stone-50 border border-stone-200 rounded-md prose prose-stone max-w-none">
                                <p>{analysisResult}</p>
                            </div>
                        </div>
                    )}
                     {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </div>
            </div>
        </div>
    );
};

export default VideoAnalysisStudio;
