
import React, { useContext, useEffect, useState, useRef } from 'react';
import { Product } from '../types';
import { AppContext } from '../App';
import ImageZoom from './ImageZoom';
import { X, Heart, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/I18nProvider';
import { useCurrency } from '../hooks/useCurrency';

interface QuickViewModalProps {
  product: Product;
  onClose: () => void;
}

const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
  const context = useContext(AppContext);
  const { t } = useI18n();
  const { formatPrice } = useCurrency();
  const [activeMedia, setActiveMedia] = useState<{ type: 'image' | 'video', url: string }>({ type: 'image', url: product.imageUrls[0] });
  const modalRef = useRef<HTMLDivElement>(null);
  const [isBeating, setIsBeating] = useState(false);
  
  const isInWishlist = context?.wishlist.includes(product.id) ?? false;

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
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
      
      if (e.shiftKey) { // Shift+Tab
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else { // Tab
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };
    
    firstElement.focus();

    const currentModalRef = modalRef.current;
    currentModalRef?.addEventListener('keydown', handleTabKey);

    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
      currentModalRef?.removeEventListener('keydown', handleTabKey);
    };
  }, [onClose]);

  useEffect(() => {
      if (product.imageUrls && product.imageUrls.length > 0) {
        setActiveMedia({ type: 'image', url: product.imageUrls[0] });
      } else if (product.videoUrl) {
        setActiveMedia({ type: 'video', url: product.videoUrl });
      }
  }, [product]);

  const handleWishlistToggle = () => {
    context?.toggleWishlist(product.id);
    if (!isInWishlist) {
        setIsBeating(true);
        setTimeout(() => setIsBeating(false), 500);
    }
  };
  
  const handleAddToCart = () => {
    context?.addToCart(product);
  };

  const mediaIsVideo = activeMedia.type === 'video';

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-view-title"
    >
      <div
        ref={modalRef}
        className="bg-white dark:bg-stone-900 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden relative"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-full md:w-1/2 p-4 flex flex-col bg-stone-50 dark:bg-stone-800/50">
          <div className="flex-grow flex items-center aspect-square">
             {mediaIsVideo ? (
              <video key={activeMedia.url} src={activeMedia.url} controls autoPlay muted loop className="w-full h-full object-cover rounded-md">
                Your browser does not support the video tag.
              </video>
            ) : (
              <ImageZoom key={activeMedia.url} imageUrl={activeMedia.url} alt={product.name} />
            )}
          </div>
          <div className="flex overflow-x-auto space-x-2 mt-3 pb-1">
            {product.imageUrls.map((url, index) => (
              <button
                key={index}
                onClick={() => setActiveMedia({ type: 'image', url })}
                className={`w-16 h-16 rounded-md overflow-hidden border-2 flex-shrink-0 transition-colors focus-ring ${!mediaIsVideo && activeMedia.url === url ? 'border-stone-800 dark:border-stone-200' : 'border-transparent hover:border-stone-400 dark:hover:border-stone-500'}`}
                aria-label={`View image ${index + 1} of ${product.name}`}
              >
                <img src={url} alt={`${product.name} thumbnail ${index + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
             {product.videoUrl && (
              <button
                onClick={() => setActiveMedia({ type: 'video', url: product.videoUrl! })}
                className={`w-16 h-16 rounded-md overflow-hidden border-2 flex-shrink-0 relative bg-stone-800 focus-ring ${mediaIsVideo ? 'border-stone-800 dark:border-stone-200' : 'border-transparent hover:border-stone-400 dark:hover:border-stone-500'}`}
                aria-label={`Play video for ${product.name}`}
              >
                <img src={product.imageUrls[0]} alt="Video thumbnail" className="w-full h-full object-cover opacity-50" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <PlayCircle size={28} className="text-white"/>
                </div>
              </button>
            )}
          </div>
        </div>
        <div className="w-full md:w-1/2 p-6 flex flex-col overflow-y-auto">
          <div className="flex-grow">
            <h2 id="quick-view-title" className="text-3xl font-serif font-bold text-stone-800 dark:text-stone-100">{product.name}</h2>
            <p className="text-2xl text-[--color-gold-dark] mt-2 font-bold">{formatPrice(product.price)}</p>
            <div className="w-12 h-0.5 bg-stone-300 dark:bg-stone-700 my-6"></div>
            <p className="text-stone-600 dark:text-stone-400 leading-relaxed">{product.description}</p>
          </div>
          <div className="mt-6 pt-6 border-t dark:border-stone-700">
            <div className="flex items-center space-x-3">
              <button onClick={handleAddToCart} className="bg-stone-800 text-white font-bold py-3 px-6 rounded-md text-base flex-grow hover:bg-stone-900 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm active:scale-95 focus-ring">
                {t('productDetailPage.addToCart')}
              </button>
              <button 
                onClick={handleWishlistToggle}
                className="flex items-center justify-center p-3 border-2 border-stone-300 dark:border-stone-700 rounded-md hover:bg-stone-100 dark:hover:bg-stone-800 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 focus-ring"
                aria-label={isInWishlist ? t('productCard.wishlistRemoveAria', {productName: product.name}) : t('productCard.wishlistAddAria', {productName: product.name})}
              >
                <Heart size={22} className={`transition-all ${isBeating ? 'animate-heartbeat' : ''} ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-stone-600 dark:text-stone-300'}`} />
              </button>
            </div>
            <Link 
              to={`/product/${product.id}`} 
              onClick={onClose}
              className="block text-center mt-4 text-sm text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 font-semibold underline focus-ring rounded-sm"
            >
              {t('quickView.viewFullDetails')}
            </Link>
          </div>
        </div>
        <button 
            onClick={onClose} 
            className="absolute top-3 right-3 text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 bg-white/60 dark:bg-stone-900/60 backdrop-blur-sm rounded-full p-1.5 transition-all hover:scale-110 active:scale-95 focus-ring rtl:left-3 rtl:right-auto"
            aria-label={t('quickView.closeAria')}
        >
            <X size={24} />
        </button>
      </div>
    </div>
  );
};

export default QuickViewModal;