
import React, { useContext, useEffect, useState, useRef, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppContext } from '../App';
import { Product, ProductStyle } from '../types';
import { generateProductStory, generateMetaDescription, classifyProductStyle } from '../services/geminiService';
import LoadingSpinner from '../components/LoadingSpinner';
import { ChevronLeft, Heart, Sparkles, PlayCircle, ChevronRight, Eye, ChevronDown, AlertTriangle, Landmark } from 'lucide-react';
import ReviewList from '../components/reviews/ReviewList';
import ReviewForm from '../components/reviews/ReviewForm';
import ImageZoom from '../components/ImageZoom';
import useIntersectionObserver from '../hooks/useIntersectionObserver';
import StyleAdvisor from '../components/ai/StyleAdvisor';
import EngravingModal from '../components/ai/EngravingModal';
import CareGuide from '../components/ai/CareGuide';
import { useI18n } from '../i18n/I18nProvider';
import { useCurrency } from '../hooks/useCurrency';
import ReviewSummarizer from '../components/ai/ReviewSummarizer';
import HistoricalContext from '../components/ai/HistoricalContext';
import ARModal from '../components/ai/ARModal';
import EthicalSourcingStory from '../components/ai/EthicalSourcingStory';
import GiftWrapAdvisor from '../components/ai/GiftWrapAdvisor';
import ProductPairings from '../components/ai/ProductPairings';
import ProductRecommendations from '../components/ai/ProductRecommendations';


const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const context = useContext(AppContext);
  const { t, language } = useI18n();
  const { formatPrice } = useCurrency();
  const [product, setProduct] = useState<Product | null>(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  
  const [story, setStory] = useState<string | null>(null);
  const [isStoryLoading, setIsStoryLoading] = useState(false);
  const [storyError, setStoryError] = useState('');

  const [metaDescription, setMetaDescription] = useState<string | null>(null);
  const [isMetaLoading, setIsMetaLoading] = useState(false);

  const [isEngravingModalOpen, setIsEngravingModalOpen] = useState(false);
  const [isARModalOpen, setIsARModalOpen] = useState(false);
  const [isBeating, setIsBeating] = useState(false);
  const [isAiFeaturesExpanded, setIsAiFeaturesExpanded] = useState(false);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const [shouldFetchHistory, setShouldFetchHistory] = useState(false);

  const [parallaxOffset, setParallaxOffset] = useState(0);
  const mediaContainerRef = useRef<HTMLDivElement>(null);

  const isInWishlist = product ? context?.wishlist.includes(product.id) ?? false : false;

  const reviewsRef = useRef<HTMLDivElement>(null);
  const isReviewsVisible = useIntersectionObserver(reviewsRef, { threshold: 0.2, triggerOnce: true });
  
  const aiFeaturesRef = useRef<HTMLDivElement>(null);
  const areAiFeaturesVisible = useIntersectionObserver(aiFeaturesRef, { threshold: 0.1, triggerOnce: true });
  
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const DirectionalChevron = language === 'fa' ? ChevronRight : ChevronLeft;

  const allMedia = useMemo(() => {
    if (!product) return [];
    const media: { type: 'image' | 'video'; url: string }[] = product.imageUrls.map(url => ({ type: 'image', url }));
    if (product.videoUrl) {
      media.push({ type: 'video', url: product.videoUrl });
    }
    return media;
  }, [product]);

  useEffect(() => {
    const handleScroll = () => {
      if (mediaContainerRef.current) {
        const rect = mediaContainerRef.current.getBoundingClientRect();
        // Check if the element is in the viewport
        if (rect.top < window.innerHeight && rect.bottom >= 0) {
          // Calculate a subtle offset. Multiplier controls the speed.
          setParallaxOffset(window.pageYOffset);
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    videoRefs.current.forEach((videoEl, index) => {
        if (videoEl) {
            if (index === activeMediaIndex && allMedia[index].type === 'video') {
                videoEl.play().catch(e => console.warn("Autoplay was prevented.", e));
            } else {
                videoEl.pause();
                videoEl.currentTime = 0;
            }
        }
    });
  }, [activeMediaIndex, allMedia]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const foundProduct = context?.products.find((p) => p.id === id);
    if (foundProduct) {
      setProduct(foundProduct);
      setStory(null);
      setStoryError('');
      setMetaDescription(null);
      setActiveMediaIndex(0);
    }
  }, [id, context?.products]);
  
  useEffect(() => {
    const trackAndMorphTheme = async () => {
        if (!product || !context?.setStyleTheme || !context?.trackActivity) return;
        
        context.trackActivity('view');

        // --- Predictive Personalization Tracking ---
        const viewedProducts = JSON.parse(sessionStorage.getItem('viewed_products') || '[]');
        if (!viewedProducts.includes(product.id)) {
            viewedProducts.push(product.id);
        }
        sessionStorage.setItem('viewed_products', JSON.stringify(viewedProducts));

        const categoryViews = JSON.parse(sessionStorage.getItem('category_views') || '{}');
        categoryViews[product.category] = (categoryViews[product.category] || 0) + 1;
        sessionStorage.setItem('category_views', JSON.stringify(categoryViews));
        // --- End Predictive Tracking ---


        // --- Style Morphing Logic ---
        let style: ProductStyle;
        const cachedStyle = sessionStorage.getItem(`style_${product.id}`);

        if (cachedStyle) {
            style = cachedStyle as ProductStyle;
        } else {
            try {
                style = await classifyProductStyle(product.name, product.description);
                sessionStorage.setItem(`style_${product.id}`, style);
            } catch (e) {
                console.error("Failed to classify product style", e);
                return; 
            }
        }

        const trackingData = JSON.parse(sessionStorage.getItem('style_tracking') || '{}');
        trackingData[style] = (trackingData[style] || 0) + 1;
        sessionStorage.setItem('style_tracking', JSON.stringify(trackingData));
        
        const STYLE_THRESHOLD = 3;
        if (trackingData['Classic'] >= STYLE_THRESHOLD) {
            context.setStyleTheme('Classic');
        } else if ((trackingData['Modern'] >= STYLE_THRESHOLD || trackingData['Minimalist'] >= STYLE_THRESHOLD)) {
            context.setStyleTheme('Modern');
        }
        // --- End Style Morphing ---
    };

    if (product) {
        trackAndMorphTheme();
    }
  }, [product, context?.setStyleTheme, context?.trackActivity]);

  useEffect(() => {
    if (product && context?.products && context.setProducts) {
      const fetchMetaDescription = async () => {
        if (product.metaDescription) {
            setMetaDescription(product.metaDescription);
            return;
        }
        
        setIsMetaLoading(true);
        try {
          const desc = await generateMetaDescription(product.name, product.description);
          setMetaDescription(desc);
          context.setProducts(prevProducts =>
              prevProducts.map(p =>
                p.id === product.id ? { ...p, metaDescription: desc } : p
              )
          );
        } catch (err) {
          console.error("Failed to get meta description:", err);
        } finally {
          setIsMetaLoading(false);
        }
      };
      fetchMetaDescription();

    }
  }, [product, t, context?.products, context?.setProducts]);
  
  const handleWishlistToggle = () => {
    if (!product) return;
    context?.toggleWishlist(product.id);
    if (!isInWishlist) {
        setIsBeating(true);
        setTimeout(() => setIsBeating(false), 500);
    }
  };
  
  const handleAddToCart = () => {
    if (product) {
      context?.addToCart(product);
    }
  };

  const handleGenerateStory = async () => {
    if (!product) return;
    setIsStoryLoading(true);
    setStoryError('');
    setStory(null);
    try {
      const generatedStory = await generateProductStory(product.name, product.category);
      setStory(generatedStory);
    } catch (err) {
      setStoryError(t('productDetailPage.storyError'));
      console.error(err);
    } finally {
      setIsStoryLoading(false);
    }
  };
  
  const handleNext = () => {
    setActiveMediaIndex((prevIndex) => (prevIndex + 1) % allMedia.length);
  };

  const handlePrev = () => {
    setActiveMediaIndex((prevIndex) => (prevIndex - 1 + allMedia.length) % allMedia.length);
  };

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 50) {
        handleNext();
    }

    if (touchStartX.current - touchEndX.current < -50) {
        handlePrev();
    }
  };
  
  const getParallaxStyle = (index: number) => {
      if (index !== activeMediaIndex) return { transform: 'scale(1.2)' };
      const elementTop = mediaContainerRef.current?.offsetTop ?? 0;
      const relativeScroll = parallaxOffset - elementTop;
      const translateY = relativeScroll * 0.2;
      return {
          transform: `scale(1.2) translateY(${translateY}px)`,
          willChange: 'transform'
      }
  }


  if (!product) {
    return (
      <div className="flex justify-center items-center h-96">
        <h2 className="text-2xl font-serif">{t('productDetailPage.notFound')}</h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-20">
       <Link to="/products" className="inline-flex items-center text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 mb-8 transition-colors focus-ring rounded-sm">
        <DirectionalChevron size={20} className="me-1"/>
        {t('productDetailPage.backToCollection')}
      </Link>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* Left Column: Media Gallery */}
        <div className="md:sticky md:top-28">
           <div 
            ref={mediaContainerRef}
            className="relative group"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="aspect-square w-full rounded-lg shadow-lg bg-stone-100 dark:bg-stone-800 overflow-hidden">
                <div
                    className="flex h-full transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${activeMediaIndex * 100}%)` }}
                >
                    {allMedia.map((media, index) => (
                        <div key={index} className="w-full h-full flex-shrink-0">
                            {media.type === 'video' ? (
                                <video
                                    ref={el => { videoRefs.current[index] = el; }}
                                    key={media.url}
                                    src={media.url}
                                    controls={false}
                                    muted
                                    loop
                                    playsInline
                                    className="w-full h-full object-cover"
                                    style={getParallaxStyle(index)}
                                />
                            ) : (
                                <ImageZoom
                                    key={media.url}
                                    imageUrl={media.url}
                                    alt={product.name}
                                    imgStyle={getParallaxStyle(index)}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>
             {allMedia.length > 1 && (
                <>
                    <button 
                        onClick={handlePrev} 
                        className="absolute top-1/2 left-3 -translate-y-1/2 bg-white/70 dark:bg-black/50 backdrop-blur-sm rounded-full p-2 text-stone-700 dark:text-stone-200 hover:bg-white dark:hover:bg-black hover:scale-110 transition-all duration-300 opacity-0 group-hover:opacity-100 focus-ring"
                        aria-label="Previous image"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button 
                        onClick={handleNext} 
                        className="absolute top-1/2 right-3 -translate-y-1/2 bg-white/70 dark:bg-black/50 backdrop-blur-sm rounded-full p-2 text-stone-700 dark:text-stone-200 hover:bg-white dark:hover:bg-black hover:scale-110 transition-all duration-300 opacity-0 group-hover:opacity-100 focus-ring"
                        aria-label="Next image"
                    >
                        <ChevronRight size={24} />
                    </button>
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-10">
                      {allMedia.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setActiveMediaIndex(index)}
                          className={`w-3 h-3 rounded-full transition-all duration-300 backdrop-blur-sm focus-ring ${
                            activeMediaIndex === index ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white'
                          }`}
                          aria-label={`Go to slide ${index + 1}`}
                        />
                      ))}
                    </div>
                </>
            )}
          </div>
          <div className="flex overflow-x-auto space-x-3 mt-4 pb-2">
            {product.imageUrls.map((url, index) => (
              <button
                key={index}
                onClick={() => setActiveMediaIndex(index)}
                className={`w-20 h-20 rounded-md overflow-hidden border-2 transition-all duration-300 ease-in-out flex-shrink-0 focus-ring ${activeMediaIndex === index ? 'border-[--color-gold-dark]' : 'border-transparent hover:border-stone-400 dark:hover:border-stone-500 scale-100 hover:scale-105'}`}
                 aria-label={`View image ${index + 1} of ${product.name}`}
              >
                <img src={url} alt={`${product.name} thumbnail ${index + 1}`} className="w-full h-full object-cover" loading="lazy"/>
              </button>
            ))}
             {product.videoUrl && (
              <button
                onClick={() => setActiveMediaIndex(product.imageUrls.length)}
                className={`w-20 h-20 rounded-md overflow-hidden border-2 transition-all duration-300 ease-in-out flex-shrink-0 relative bg-stone-800 focus-ring ${activeMediaIndex === product.imageUrls.length ? 'border-[--color-gold-dark]' : 'border-transparent hover:border-stone-400 dark:hover:border-stone-500 scale-100 hover:scale-105'}`}
                aria-label={`Play video for ${product.name}`}
              >
                <img src={product.imageUrls[0]} alt="Video thumbnail" className="w-full h-full object-cover opacity-50" loading="lazy" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <PlayCircle size={32} className="text-white"/>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Product Details */}
        <div>
          <h1 className="text-4xl lg:text-5xl font-serif font-bold text-stone-800 dark:text-stone-100">{product.name}</h1>
          <p className="text-3xl text-[--color-gold-dark] mt-4 font-bold">{formatPrice(product.price)}</p>
          <div className="w-16 h-1 bg-stone-300 dark:bg-stone-700 my-8"></div>
          <p className="text-lg text-stone-600 dark:text-stone-400 leading-relaxed">{product.description}</p>
          
          <div className="mt-6 border-t border-b border-stone-200 dark:border-stone-700">
            <button
              onClick={() => {
                  if (!shouldFetchHistory) setShouldFetchHistory(true);
                  setIsHistoryVisible(!isHistoryVisible);
              }}
              className="w-full flex justify-between items-center py-4 text-left font-semibold text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 transition-colors focus-ring rounded"
              aria-expanded={isHistoryVisible}
              aria-controls="historical-context-content"
            >
              <span className="flex items-center">
                  <Landmark size={18} className="me-3 text-stone-500" />
                  {t('historicalContext.title')}
              </span>
              <ChevronDown size={20} className={`transition-transform duration-300 ${isHistoryVisible ? 'rotate-180' : ''}`} />
            </button>
            <div
              id="historical-context-content"
              className={`grid overflow-hidden transition-all duration-500 ease-in-out ${isHistoryVisible ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
            >
              <div className="min-h-0 pb-4">
                  {shouldFetchHistory && <HistoricalContext productName={product.name} category={product.category} />}
              </div>
            </div>
          </div>
          
          {isMetaLoading && (
            <div className="mt-6 p-4 border border-dashed rounded-lg bg-stone-50 dark:bg-stone-800/50 animate-pulse">
                <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded w-1/4 mb-3"></div>
                <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded w-full"></div>
                <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded w-5/6 mt-1"></div>
            </div>
          )}
          {metaDescription && !isMetaLoading && (
              <div className="mt-6 p-4 border border-stone-200 dark:border-stone-700 rounded-lg bg-stone-50/50 dark:bg-stone-800/50">
                  <h4 className="text-xs font-semibold uppercase text-stone-500 dark:text-stone-400 tracking-wider">{t('productDetailPage.seoPreview')}</h4>
                  <div className="mt-2">
                      <p className="text-blue-600 dark:text-blue-400 text-lg truncate font-medium">{product.name}</p>
                      <p className="text-green-700 dark:text-green-500 text-sm">https://bayanisilver.com/product/{product.id}</p>
                      <p className="text-stone-600 dark:text-stone-400 text-sm mt-1">{metaDescription}</p>
                  </div>
              </div>
          )}

          <div className="mt-6 flex flex-wrap gap-2">
            {product.isEngravable && (
                <button
                    onClick={() => setIsEngravingModalOpen(true)}
                    className="group inline-flex items-center text-sm text-stone-600 dark:text-stone-300 font-semibold py-2 px-4 rounded-full border border-stone-300 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-500 hover:bg-stone-50 dark:hover:bg-stone-800 transition-all duration-300 focus-ring"
                >
                    <Sparkles size={16} className="me-2 text-yellow-500/80 group-hover:text-yellow-500 transition-colors" />
                    {t('productDetailPage.getEngravingIdeas')}
                </button>
            )}
             <button
                onClick={() => setIsARModalOpen(true)}
                className="group inline-flex items-center text-sm text-stone-600 dark:text-stone-300 font-semibold py-2 px-4 rounded-full border border-stone-300 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-500 hover:bg-stone-50 dark:hover:bg-stone-800 transition-all duration-300 focus-ring"
            >
                <Eye size={16} className="me-2 text-sky-500/80 group-hover:text-sky-500 transition-colors" />
                {t('productDetailPage.arView')}
            </button>
          </div>

          <div className="flex items-center space-x-4 mt-8">
            <button onClick={handleAddToCart} className="btn-primary-gradient text-white font-bold py-3 px-8 rounded-md text-lg flex-grow shadow-lg active:shadow-md active:scale-95 focus-ring animate-gold-glow">
              {t('productDetailPage.addToCart')}
            </button>
            <button 
              onClick={handleWishlistToggle}
              className="flex items-center justify-center p-3 border-2 border-stone-300 dark:border-stone-700 rounded-md hover:bg-stone-100 dark:hover:bg-stone-800 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 focus-ring"
              aria-label={isInWishlist ? t('productCard.wishlistRemoveAria', { productName: product.name }) : t('productCard.wishlistAddAria', { productName: product.name })}
            >
              <Heart size={24} className={`transition-all ${isBeating ? 'animate-heartbeat' : ''} ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-stone-600 dark:text-stone-300'}`} />
            </button>
          </div>

          {/* AI Features Section */}
          <div ref={aiFeaturesRef} className={`mt-12 pt-8 border-t border-stone-200 dark:border-stone-700 scroll-trigger ${areAiFeaturesVisible ? 'visible' : ''}`}>
            <button
              onClick={() => setIsAiFeaturesExpanded(!isAiFeaturesExpanded)}
              className="w-full flex justify-between items-center text-left py-4 focus-ring rounded-md"
              aria-expanded={isAiFeaturesExpanded}
              aria-controls="ai-features-content"
            >
              <h2 className="text-2xl font-serif text-stone-800 dark:text-stone-200 flex items-center">
                <Sparkles size={20} className="me-4 text-[--color-gold-dark]" />
                {t('productDetailPage.aiEnhancementsTitle')}
              </h2>
              <ChevronDown
                size={24}
                className={`text-stone-600 dark:text-stone-400 transition-transform duration-300 ${isAiFeaturesExpanded ? 'rotate-180' : ''}`}
              />
            </button>
            <div
              id="ai-features-content"
              className={`grid overflow-hidden transition-all duration-700 ease-in-out ${isAiFeaturesExpanded ? 'grid-rows-[1fr] opacity-100 pt-6' : 'grid-rows-[0fr] opacity-0'}`}
            >
              <div className="min-h-0 space-y-10"> {/* Wrapper needed for grid-rows transition */}
                 <EthicalSourcingStory productName={product.name} />
                 <StyleAdvisor productName={product.name}/>
                 <GiftWrapAdvisor productName={product.name} />
                 <CareGuide productName={product.name} />
              </div>
            </div>
          </div>

        </div>
      </div>
      
      {/* Sections below the two-column layout */}
      <div className="mt-20 pt-12 border-t border-stone-200 dark:border-stone-800">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-serif text-stone-800 dark:text-stone-200 flex items-center justify-center">
            <Sparkles size={24} className="me-4 text-[--color-gold-dark]" />
            {t('productDetailPage.storyTitle')}
          </h2>
          <div className="mt-8">
            {!story && !isStoryLoading && !storyError && (
              <button
                onClick={handleGenerateStory}
                className="group inline-flex items-center text-stone-600 dark:text-stone-300 font-semibold py-2 px-4 rounded-full border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-solid hover:border-stone-400 dark:hover:border-stone-500 hover:bg-stone-50 dark:hover:bg-stone-800 transition-all duration-300 focus-ring"
              >
                <Sparkles size={18} className="me-2 text-yellow-500/80 group-hover:text-yellow-500 transition-colors" />
                {t('productDetailPage.discoverStory')}
              </button>
            )}
            {isStoryLoading && (
              <div className="flex items-center justify-center space-x-3 text-stone-500 dark:text-stone-400 py-2">
                <LoadingSpinner size="sm" />
                <span>{t('productDetailPage.generatingStory')}</span>
              </div>
            )}
            {storyError && <p className="text-red-500 py-2">{storyError}</p>}
            {story && (
              <div className="mt-4 p-5 rounded-lg bg-stone-100/70 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 animate-fade-in">
                <p className="text-stone-700 dark:text-stone-300 font-serif text-lg/relaxed italic">"{story}"</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-24 border-t border-stone-200 dark:border-stone-800">
         {product && context?.products && <ProductPairings product={product} allProducts={context.products} />}
      </div>
      
      <div ref={reviewsRef} className={`mt-24 scroll-trigger ${isReviewsVisible ? 'visible' : ''}`}>
        {id && (
          <>
            <ReviewSummarizer productId={id} />
            <ReviewList productId={id} />
            <ReviewForm productId={id} />
          </>
        )}
      </div>

      {product && <ProductRecommendations currentProduct={product} />}
      
      {isEngravingModalOpen && product && (
        <EngravingModal productName={product.name} onClose={() => setIsEngravingModalOpen(false)} />
      )}
      {isARModalOpen && product && (
        <ARModal product={product} onClose={() => setIsARModalOpen(false)} />
      )}
    </div>
  );
};

export default ProductDetailPage;
