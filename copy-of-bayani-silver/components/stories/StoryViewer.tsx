
import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Story } from '../../types';
import { X, ChevronLeft, ChevronRight, ShoppingBag, Pause } from 'lucide-react';
import { AppContext } from '../../App';

const STORY_DURATION = 7000; // 7 seconds per story

interface StoryViewerProps {
    stories: Story[];
    startIndex: number;
    onClose: () => void;
}

const StoryViewer: React.FC<StoryViewerProps> = ({ stories, startIndex, onClose }) => {
    const context = useContext(AppContext);
    const [currentIndex, setCurrentIndex] = useState(startIndex);
    const [progress, setProgress] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    // FIX: Explicitly use window.setTimeout and window.setInterval to resolve type ambiguity with Node.js types.
    const timerRef = useRef<ReturnType<typeof window.setTimeout> | undefined>(undefined);
    const progressRef = useRef<ReturnType<typeof window.setInterval> | undefined>(undefined);
    const startTimeRef = useRef(0);
    const remainingTimeRef = useRef(STORY_DURATION);

    const modalRef = useRef<HTMLDivElement>(null);
    const product = context?.products.find(p => p.id === stories[currentIndex]?.productId);
    
    // Refs for swipe detection
    const touchStartX = useRef(0);
    const touchStartY = useRef(0);
    const isSwiping = useRef(false);


    const goToNext = useCallback(() => {
        setCurrentIndex(prev => {
            if (prev < stories.length - 1) {
                return prev + 1;
            }
            onClose(); // Close viewer when last story finishes
            return prev;
        });
    }, [stories.length, onClose]);
    
    const goToPrev = useCallback(() => {
        setCurrentIndex(prev => (prev > 0 ? prev - 1 : prev));
    }, []);
    
    const startTimers = useCallback(() => {
        startTimeRef.current = Date.now();
        
        timerRef.current = setTimeout(goToNext, remainingTimeRef.current);
    
        progressRef.current = setInterval(() => {
            const totalElapsed = (STORY_DURATION - remainingTimeRef.current) + (Date.now() - startTimeRef.current);
            const newProgress = Math.min((totalElapsed / STORY_DURATION) * 100, 100);
            setProgress(newProgress);
            if (newProgress >= 100) {
                clearInterval(progressRef.current);
            }
        }, 50);
    }, [goToNext]);

    const pauseStory = useCallback(() => {
        if (isPaused) return;
        setIsPaused(true);
        clearTimeout(timerRef.current);
        clearInterval(progressRef.current);
        const elapsed = Date.now() - startTimeRef.current;
        remainingTimeRef.current = Math.max(remainingTimeRef.current - elapsed, 0);
    }, [isPaused]);

    const resumeStory = useCallback(() => {
        if (!isPaused) return;
        setIsPaused(false);
        startTimers();
    }, [isPaused, startTimers]);

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.targetTouches[0].clientX;
        touchStartY.current = e.targetTouches[0].clientY;
        isSwiping.current = false;
        pauseStory();
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!touchStartX.current || !touchStartY.current) return;
        const currentX = e.targetTouches[0].clientX;
        const currentY = e.targetTouches[0].clientY;
        const deltaX = Math.abs(currentX - touchStartX.current);
        const deltaY = Math.abs(currentY - touchStartY.current);

        if (deltaX > 10 && deltaX > deltaY) {
            isSwiping.current = true;
        }
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        const touchEndX = e.changedTouches[0].clientX;
        
        if (isSwiping.current) {
            const deltaX = touchEndX - touchStartX.current;
            if (deltaX < -50) { // Swiped left
                goToNext();
            } else if (deltaX > 50) { // Swiped right
                goToPrev();
            }
        } else {
            // It was a tap, not a swipe. Handle tap navigation.
            const tapX = touchStartX.current;
            const screenWidth = (e.currentTarget as HTMLElement).clientWidth;
            if (tapX < screenWidth / 3) {
                goToPrev();
            } else if (tapX > (screenWidth * 2) / 3) {
                goToNext();
            }
        }
        
        resumeStory();
    };


    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') goToNext();
            if (e.key === 'ArrowLeft') goToPrev();
            if (e.key === 'Escape') onClose();
        };

        window.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'auto';
        };
    }, [goToNext, goToPrev, onClose]);
    
    useEffect(() => {
        if (currentIndex >= stories.length) return;

        if (currentIndex < stories.length - 1) {
            const img = new Image();
            img.src = stories[currentIndex + 1].imageUrl;
        }

        clearTimeout(timerRef.current);
        clearInterval(progressRef.current);
        setProgress(0);
        remainingTimeRef.current = STORY_DURATION;
        
        if(!isPaused) startTimers();

        return () => {
            clearTimeout(timerRef.current);
            clearInterval(progressRef.current);
        };
    }, [currentIndex, stories, startTimers, isPaused]);
    
    if (currentIndex >= stories.length) return null;
    const currentStory = stories[currentIndex];

    return (
        <div 
            ref={modalRef}
            className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center animate-fade-in"
            role="dialog"
            aria-modal="true"
            aria-label="Story viewer"
            onClick={onClose}
        >
            <div 
                className="relative w-full h-full max-w-md max-h-[95vh] bg-stone-900 rounded-xl overflow-hidden shadow-2xl flex flex-col story-viewer-container" 
                onClick={e => e.stopPropagation()}
                onMouseDown={pauseStory}
                onMouseUp={resumeStory}
                onMouseLeave={resumeStory}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* Progress Bars */}
                <div className="absolute top-2 left-2 right-2 flex gap-1 z-20">
                    {stories.map((_, index) => (
                        <div key={index} className="flex-1 h-1.5 bg-white/30 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white"
                                style={{ 
                                    width: `${index < currentIndex ? 100 : (index === currentIndex ? progress : 0)}%`,
                                    transition: index === currentIndex && !isPaused ? 'width 100ms linear' : 'none',
                                }}
                            ></div>
                        </div>
                    ))}
                </div>

                {/* Header */}
                <div className="absolute top-5 left-4 right-4 flex justify-between items-center z-20">
                     <p className="text-white font-bold text-shadow">{currentStory.productName}</p>
                     <button onClick={onClose} className="text-white/80 hover:text-white focus-ring rounded-full p-1"><X size={28}/></button>
                </div>
                
                {/* Main Content */}
                <div className="flex-grow relative">
                     <img src={currentStory.imageUrl} alt={currentStory.title} className="w-full h-full object-cover" />
                     {isPaused && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/40 p-4 rounded-full animate-fade-in-scale">
                           <Pause size={32} className="text-white fill-white"/>
                        </div>
                     )}
                </div>
                
                {/* Product Link */}
                {product && (
                     <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-full px-4">
                        <Link to={`/product/${product.id}`} onClick={onClose} className="w-full block bg-white/90 text-stone-900 font-bold text-center py-3 px-6 rounded-lg backdrop-blur-sm hover:bg-white transition-all transform hover:scale-105 active:scale-100 focus-ring">
                            <div className="flex items-center justify-center gap-2">
                                <ShoppingBag size={20} />
                                View Product
                            </div>
                        </Link>
                    </div>
                )}
            </div>

            {/* Desktop Navigation Buttons */}
            <button onClick={(e) => { e.stopPropagation(); goToPrev(); }} className="hidden md:block story-nav-button left focus-ring" disabled={currentIndex === 0}>
                <ChevronLeft size={32} />
            </button>
             <button onClick={(e) => { e.stopPropagation(); goToNext(); }} className="hidden md:block story-nav-button right focus-ring" disabled={currentIndex === stories.length -1}>
                <ChevronRight size={32} />
            </button>
        </div>
    );
};

export default StoryViewer;
