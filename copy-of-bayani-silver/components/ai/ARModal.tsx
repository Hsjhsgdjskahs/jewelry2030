import React, { useEffect, useRef, useState } from 'react';
import { X, Camera, AlertTriangle, RefreshCw } from 'lucide-react';
import { useI18n } from '../../i18n/I18nProvider';
import { Product } from '../../types';
import LoadingSpinner from '../LoadingSpinner';

interface ARModalProps {
    product: Product;
    onClose: () => void;
}

const ARModal: React.FC<ARModalProps> = ({ product, onClose }) => {
    const { t } = useI18n();
    const modalRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);

    // State for image interaction
    const [position, setPosition] = useState({ x: 100, y: 100 });
    const [scale, setScale] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });
    
    // Refs for pinch-to-zoom gesture
    const pointers = useRef<PointerEvent[]>([]);
    const initialDistance = useRef<number>(0);
    const initialScale = useRef<number>(1);

    useEffect(() => {
        let stream: MediaStream | null = null;
        const startCamera = async () => {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
                stream = mediaStream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                setIsLoading(false);
            } catch (err) {
                console.error("Camera access denied:", err);
                setError(t('arModal.error'));
                setIsLoading(false);
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

        const firstFocusableElement = modalRef.current?.querySelector('button') as HTMLElement;
        firstFocusableElement?.focus();

        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [onClose]);

    const onPointerDown = (e: React.PointerEvent) => {
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        pointers.current.push(e.nativeEvent);

        if (pointers.current.length === 1) { // Start drag
            setIsDragging(true);
            dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
        } else if (pointers.current.length === 2) { // Start pinch
            setIsDragging(false);
            const [p1, p2] = pointers.current;
            initialDistance.current = Math.hypot(p1.clientX - p2.clientX, p1.clientY - p2.clientY);
            initialScale.current = scale;
        }
    };

    const onPointerMove = (e: React.PointerEvent) => {
        const index = pointers.current.findIndex(p => p.pointerId === e.pointerId);
        if (index > -1) {
            pointers.current[index] = e.nativeEvent;
        }

        if (pointers.current.length === 1 && isDragging) { // Dragging
            setPosition({
                x: e.clientX - dragStart.current.x,
                y: e.clientY - dragStart.current.y,
            });
        } else if (pointers.current.length === 2) { // Pinching
            const [p1, p2] = pointers.current;
            const currentDistance = Math.hypot(p1.clientX - p2.clientX, p1.clientY - p2.clientY);
            if (initialDistance.current > 0) {
                const newScale = initialScale.current * (currentDistance / initialDistance.current);
                setScale(Math.min(Math.max(newScale, 0.5), 3.0));
            }
        }
    };

    const onPointerUp = (e: React.PointerEvent) => {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
        pointers.current = pointers.current.filter(p => p.pointerId !== e.pointerId);
        
        if (pointers.current.length < 2) {
            initialDistance.current = 0;
        }
        if (pointers.current.length < 1) {
            setIsDragging(false);
        } else if (pointers.current.length === 1) {
            // If one finger is lifted during a pinch, reset drag to prevent jumping
            const lastPointer = pointers.current[0];
            setIsDragging(true);
            dragStart.current = { x: lastPointer.clientX - position.x, y: lastPointer.clientY - position.y };
        }
    };

    const handleReset = () => {
        setPosition({ x: 100, y: 100 });
        setScale(1);
    };

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="ar-title"
        >
            <div
                ref={modalRef}
                className="bg-white dark:bg-stone-900 rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden relative"
                onClick={e => e.stopPropagation()}
            >
                <header className="p-4 border-b dark:border-stone-700 flex justify-between items-center flex-shrink-0">
                    <h2 id="ar-title" className="text-lg font-serif text-stone-800 dark:text-stone-200 flex items-center">
                        <Camera size={18} className="me-3 text-sky-600"/>
                        {t('arModal.title')}
                    </h2>
                    <button onClick={onClose} className="text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors focus-ring rounded-full" aria-label={t('arModal.closeAria')}>
                        <X size={24} />
                    </button>
                </header>
                <div className="relative flex-grow bg-stone-900">
                    {isLoading && <div className="absolute inset-0 flex flex-col items-center justify-center text-white"><LoadingSpinner/> <p className="mt-2 text-sm">{t('arModal.placeholder')}</p></div>}
                    {error && <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4"><AlertTriangle className="text-yellow-400 mb-2" size={32}/><p className="text-sm text-center">{error}</p></div>}
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
                    {!isLoading && !error && (
                         <div
                            className="absolute cursor-grab active:cursor-grabbing"
                            style={{ top: position.y, left: position.x, transform: `scale(${scale})`, touchAction: 'none' }}
                            onPointerDown={onPointerDown}
                            onPointerMove={onPointerMove}
                            onPointerUp={onPointerUp}
                            onPointerCancel={onPointerUp}
                         >
                            <img src={product.imageUrls[0]} alt={product.name} className="w-32 h-auto pointer-events-none drop-shadow-lg" />
                        </div>
                    )}
                </div>
                <footer className="p-4 bg-black/40 backdrop-blur-sm flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <label htmlFor="size-slider" className="text-white text-sm font-semibold flex-shrink-0">{t('arModal.sizeLabel')}</label>
                        <input
                            id="size-slider"
                            type="range"
                            min="0.5"
                            max="3"
                            step="0.05"
                            value={scale}
                            onChange={(e) => setScale(Number(e.target.value))}
                            className="w-full h-2 bg-white/30 rounded-lg appearance-none cursor-pointer accent-[--color-gold-dark] focus-ring"
                            aria-label={t('arModal.sizeLabel')}
                        />
                        <button 
                            onClick={handleReset} 
                            className="py-2 px-4 bg-white/20 text-white rounded-md text-sm font-semibold hover:bg-white/40 transition-colors focus-ring flex-shrink-0 inline-flex items-center gap-2"
                            aria-label={t('arModal.reset')}
                        >
                            <RefreshCw size={14} />
                            {t('arModal.reset')}
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default ARModal;