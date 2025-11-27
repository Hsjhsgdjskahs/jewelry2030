import React, { useContext, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { ArrowRight, Eye, Heart, ArrowLeft } from 'lucide-react';
import { AppContext } from '../App';
import { useI18n } from '../i18n/I18nProvider';
import { useCurrency } from '../hooks/useCurrency';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const context = useContext(AppContext);
  const { t, language } = useI18n();
  const { formatPrice } = useCurrency();
  const isInWishlist = context?.wishlist.includes(product.id) ?? false;
  const [isBeating, setIsBeating] = useState(false);
  const DirectionalArrow = language === 'fa' ? ArrowLeft : ArrowRight;
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      cardRef.current.style.setProperty('--mouse-x', `${x}px`);
      cardRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    context?.toggleWishlist(product.id);
    if (!isInWishlist) {
        setIsBeating(true);
        setTimeout(() => setIsBeating(false), 500);
    }
  };

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onQuickView?.(product);
  }

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className="group relative glass-card product-card-interactive-sheen dynamic-shadow"
      onMouseEnter={() => context?.playHoverSound()}
    >
      <div className="absolute top-4 right-4 z-20 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300 rtl:left-4 rtl:right-auto rtl:-translate-x-4 rtl:group-hover:translate-x-0">
        <button
          onClick={handleWishlistToggle}
          className="p-2 bg-white/70 dark:bg-stone-900/50 rounded-full backdrop-blur-sm hover:bg-white dark:hover:bg-stone-700 hover:scale-110 active:scale-95 transition-all duration-200 focus-ring"
          aria-label={isInWishlist ? t('productCard.wishlistRemoveAria', { productName: product.name }) : t('productCard.wishlistAddAria', { productName: product.name })}
        >
          <Heart size={20} className={`transition-all ${isBeating ? 'animate-heartbeat' : ''} ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-stone-600 dark:text-stone-300'}`} />
        </button>
        {onQuickView && (
           <button
            onClick={handleQuickViewClick}
            className="p-2 bg-white/70 dark:bg-stone-900/50 rounded-full backdrop-blur-sm hover:bg-white dark:hover:bg-stone-700 hover:scale-110 active:scale-95 transition-all duration-200 focus-ring"
            aria-label={t('productCard.quickViewAria', { productName: product.name })}
          >
            <Eye size={20} className="text-stone-600 dark:text-stone-300" />
          </button>
        )}
      </div>
      <Link to={`/product/${product.id}`} className="focus-ring rounded-[var(--border-radius-base)] block">
        <div className="w-full h-64 bg-stone-100/50 dark:bg-stone-900/50 overflow-hidden relative">
          <img
            src={product.imageUrls[0]}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 group-hover:saturate-110 transition-transform duration-500"
          />
          <div className="sheen-element" aria-hidden="true"></div>
        </div>
        <div className="p-5 text-start h-28 relative overflow-hidden">
          <h3 className="text-xl font-serif font-semibold text-stone-800 dark:text-stone-200 truncate transition-transform duration-300 group-hover:-translate-y-7">{product.name}</h3>
          <p className="text-[--color-gold-dark] mt-2 text-lg font-semibold transition-transform duration-300 group-hover:-translate-y-7">{formatPrice(product.price)}</p>
          <div className="absolute bottom-5 left-5 right-5 mt-4 flex items-center text-stone-600 dark:text-stone-400 font-semibold opacity-0 transform translate-y-12 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-400 delay-100">
            {t('productCard.viewDetails')} <DirectionalArrow size={16} className="ms-1 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;