import React, { useContext, useRef, useEffect } from 'react';
import { AppContext } from '../../App';
import { Story } from '../../types';
import useIntersectionObserver from '../../hooks/useIntersectionObserver';
import { Play } from 'lucide-react';

interface ReelCardProps {
    story: Story;
    onOpen: () => void;
}

const ReelCard: React.FC<ReelCardProps> = ({ story, onOpen }) => {
    const context = useContext(AppContext);
    const videoRef = useRef<HTMLVideoElement>(null);
    const cardRef = useRef<HTMLButtonElement>(null);
    const isVisible = useIntersectionObserver(cardRef, { threshold: 0.5 });
    
    const product = context?.products.find(p => p.id === story.productId);
    const hasVideo = !!product?.videoUrl;

    useEffect(() => {
        const videoElement = videoRef.current;
        if (videoElement) {
            if (isVisible) {
                videoElement.play().catch(e => console.warn("Autoplay was prevented.", e));
            } else {
                videoElement.pause();
                videoElement.currentTime = 0; // Reset video to start when out of view
            }
        }
    }, [isVisible]);
    
    return (
        <button 
            ref={cardRef}
            onClick={onOpen}
            aria-label={`View story: ${story.title}`}
            className="relative group overflow-hidden rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl focus-ring break-inside-avoid w-full"
        >
            {hasVideo ? (
                <video
                    ref={videoRef}
                    src={product.videoUrl}
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    preload="metadata"
                />
            ) : (
                <img src={story.imageUrl} alt={story.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent pointer-events-none"></div>
            
            {!hasVideo && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className="bg-black/40 rounded-full p-3">
                        <Play size={32} className="text-white fill-white"/>
                    </div>
                </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 p-4 text-white text-start pointer-events-none">
                <p className="font-bold text-shadow transform transition-transform duration-300 group-hover:-translate-y-1">{story.title}</p>
                <p className="text-xs text-shadow opacity-90">{story.productName}</p>
            </div>
        </button>
    );
}

export default ReelCard;
