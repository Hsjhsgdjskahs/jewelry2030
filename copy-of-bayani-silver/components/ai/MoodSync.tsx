
import React, { useEffect, useRef, useState, useContext } from 'react';
import { X, Camera, AlertTriangle, Smile } from 'lucide-react';
import { useI18n } from '../../i18n/I18nProvider';
import LoadingSpinner from '../LoadingSpinner';
import { detectUserEmotion } from '../../services/geminiService';
import { AppContext } from '../../App';

interface MoodSyncProps {
    onClose: () => void;
}

const MoodSync: React.FC<MoodSyncProps> = ({ onClose }) => {
    const { t } = useI18n();
    const context = useContext(AppContext);
    const modalRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [error, setError] = useState<string>('');
    const [isCameraLoading, setIsCameraLoading] = useState(true);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    useEffect(() => {
        let stream: MediaStream | null = null;
        const startCamera = async () => {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
                stream = mediaStream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                setIsCameraLoading(false);
            } catch (err) {
                console.error("Camera access denied:", err);
                setError(t('moodSync.error'));
                setIsCameraLoading(false);
            }
        };

        startCamera();

        return () => {
            stream?.getTracks().forEach(track => track.stop());
        };
    }, [t]);

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        document.body.style.overflow = 'hidden';
        const firstFocusable = modalRef.current?.querySelector('button');
        firstFocusable?.focus();
        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [onClose]);

    const handleCaptureAndAnalyze = async () => {
        if (!videoRef.current || !canvasRef.current || !context) return;
        setIsAnalyzing(true);
        setError('');

        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            setError(t('moodSync.error'));
            setIsAnalyzing(false);
            return;
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const base64Image = canvas.toDataURL('image/jpeg').split(',')[1];

        try {
            const emotion = await detectUserEmotion(base64Image, 'image/jpeg');
            if (emotion === 'Happy') {
                context.setMoodTheme('joyful');
            } else {
                // For other emotions, we can reset to default or do nothing
                context.setMoodTheme('default');
            }
            onClose();
        } catch (err) {
            setError(t('moodSync.error'));
            setIsAnalyzing(false);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="mood-sync-title"
        >
            <div
                ref={modalRef}
                className="bg-white dark:bg-stone-900 rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden relative"
                onClick={e => e.stopPropagation()}
            >
                <header className="p-4 border-b dark:border-stone-700 flex justify-between items-center flex-shrink-0">
                    <h2 id="mood-sync-title" className="text-lg font-serif text-stone-800 dark:text-stone-200 flex items-center">
                        <Smile size={18} className="me-3 text-yellow-500"/>
                        {t('moodSync.title')}
                    </h2>
                    <button onClick={onClose} className="text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors focus-ring rounded-full" aria-label="Close">
                        <X size={24} />
                    </button>
                </header>

                <div className="p-6 flex-grow flex flex-col items-center">
                    <p className="text-sm text-stone-600 dark:text-stone-400 text-center mb-4">{t('moodSync.subtitle')}</p>
                    <div className="relative w-full aspect-square bg-stone-200 dark:bg-stone-800 rounded-lg overflow-hidden flex items-center justify-center">
                        {isCameraLoading && <LoadingSpinner />}
                        {error && <div className="p-4 text-center"><AlertTriangle className="text-red-500 mx-auto mb-2" size={32}/><p className="text-sm text-red-600">{error}</p></div>}
                        <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover transition-opacity ${isCameraLoading || error ? 'opacity-0' : 'opacity-100'}`} style={{ transform: 'scaleX(-1)' }} />
                        <canvas ref={canvasRef} className="hidden" />
                        {isAnalyzing && (
                            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
                                <LoadingSpinner />
                                <p className="mt-2 text-sm">{t('moodSync.analyzing')}</p>
                            </div>
                        )}
                    </div>
                </div>
                
                <footer className="p-4 border-t dark:border-stone-700 flex-shrink-0">
                    <button 
                        onClick={handleCaptureAndAnalyze}
                        disabled={isCameraLoading || !!error || isAnalyzing}
                        className="w-full inline-flex items-center justify-center bg-stone-800 text-white font-bold py-3 px-4 rounded-md hover:bg-stone-900 transition-colors disabled:opacity-50 focus-ring"
                    >
                        <Camera size={18} className="me-2"/>
                        {t('moodSync.captureButton')}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default MoodSync;
