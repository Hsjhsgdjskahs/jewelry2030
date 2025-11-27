
import React, { useContext, useState, useMemo, useEffect, useRef } from 'react';
import { AppContext } from '../App';
import ProductCard from '../components/ProductCard';
import { Search, X, Scale } from 'lucide-react';
import { Product } from '../types';
import QuickViewModal from '../components/QuickViewModal';
import useIntersectionObserver from '../hooks/useIntersectionObserver';
import AnimatedHeadline from '../components/AnimatedHeadline';
import { useI18n } from '../i18n/I18nProvider';
import { useCurrency } from '../hooks/useCurrency';
import { IRT_EXCHANGE_RATE } from '../constants';
import ComparisonModal from '../components/ai/ComparisonModal';

const ProductsPage: React.FC = () => {
  const context = useContext(AppContext);
  const { t } = useI18n();
  const { currency, formatPrice } = useCurrency();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [comparisonList, setComparisonList] = useState<string[]>([]);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);

  const maxPrice = useMemo(() => {
    if (!context?.products || context.products.length === 0) return currency === 'USD' ? 1000 : 58000000;
    const maxUsdPrice = Math.max(...context.products.map(p => p.price));
    if (currency === 'USD') {
      return Math.ceil(maxUsdPrice / 100) * 100;
    } else {
      return Math.ceil((maxUsdPrice * IRT_EXCHANGE_RATE) / 1000000) * 1000000;
    }
  }, [context?.products, currency]);
  
  const [priceRange, setPriceRange] = useState(maxPrice);

  const gridRef = useRef<HTMLDivElement>(null);
  const isGridVisible = useIntersectionObserver(gridRef, { threshold: 0.1, triggerOnce: true });

  useEffect(() => {
    setPriceRange(maxPrice);
  }, [maxPrice]);

  const categories = useMemo(() => {
    if (!context?.products) return ['All'];
    const allCategories = context.products.map(p => p.category);
    return ['All', ...Array.from(new Set(allCategories))];
  }, [context?.products]);

  const filteredProducts = useMemo(() => {
    return context?.products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const currentPrice = currency === 'USD' ? product.price : product.price * IRT_EXCHANGE_RATE;
      const matchesPrice = currentPrice <= priceRange;
      return matchesSearch && matchesCategory && matchesPrice;
    }) || [];
  }, [context?.products, searchTerm, selectedCategory, priceRange, currency]);
  
  const handleQuickView = (product: Product) => {
    triggerRef.current = document.activeElement as HTMLElement;
    setSelectedProduct(product);
  };
  
  const closeQuickView = () => {
    setSelectedProduct(null);
    setTimeout(() => {
        triggerRef.current?.focus();
    }, 0);
  };

  const getPriceLabel = () => {
    if (currency === 'USD') {
        return `$${priceRange}`;
    } else {
        return `${(priceRange / 1000000).toLocaleString('fa-IR')} میلیون تومان`;
    }
  };

  const handleToggleCompareMode = () => {
    setIsCompareMode(!isCompareMode);
    setComparisonList([]);
  };

  const toggleProductInComparison = (productId: string) => {
    setComparisonList(prev => {
        if (prev.includes(productId)) {
            return prev.filter(id => id !== productId);
        }
        if (prev.length < 3) {
            return [...prev, productId];
        }
        return prev; // Max 3 items
    });
  };
  
  const comparisonProducts = useMemo(() => {
    return context?.products.filter(p => comparisonList.includes(p.id)) || [];
  }, [comparisonList, context?.products]);

  return (
    <div className="container mx-auto px-6 py-20">
      <div className="text-center mb-12">
        <AnimatedHeadline text={t('productsPage.title')} as="h1" className="text-5xl font-serif text-stone-800" />
        <p className="text-stone-600 mt-2">{t('productsPage.subtitle')}</p>
      </div>
      
      {/* Filters */}
      <div className="mb-12 p-6 bg-white/50 dark:bg-stone-900/80 rounded-lg shadow-sm border border-stone-200/80 dark:border-stone-700/50 sticky top-[81px] z-40 backdrop-blur-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          {/* Search */}
          <div className="relative md:col-span-2">
            <label htmlFor="search" className="sr-only">{t('productsPage.searchPlaceholder')}</label>
            <input
              type="text"
              id="search"
              placeholder={t('productsPage.searchPlaceholder')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full ps-10 pe-4 py-2 border border-stone-300 dark:border-stone-600 dark:bg-stone-800 rounded-full hover:border-stone-400 dark:hover:border-stone-500 focus:ring-2 focus:ring-[--color-gold-dark]/50 focus:border-[--color-gold-dark] transition-all duration-300 focus-ring"
            />
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
          </div>
          {/* Category */}
          <div className="md:col-span-2">
            <label htmlFor="category" className="block text-sm font-medium text-stone-700 dark:text-stone-300">{t('productsPage.categoryLabel')}</label>
            <select
              id="category"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[--color-gold-dark]/50 focus:border-[--color-gold-dark] sm:text-sm focus-ring"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'All' ? t('productsPage.allCategory') : category}
                </option>
              ))}
            </select>
          </div>
          {/* Price Range */}
          <div className="md:col-span-4">
            <label htmlFor="priceRange" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">{t('productsPage.priceLabel')}<span className="font-bold text-stone-900 dark:text-stone-100">{getPriceLabel()}</span></label>
            <input
              type="range"
              id="priceRange"
              min="0"
              max={maxPrice}
              step={currency === 'USD' ? 10 : 100000}
              value={priceRange}
              onChange={e => setPriceRange(Number(e.target.value))}
              className="w-full cursor-pointer focus-ring"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-center border-t border-stone-200/80 dark:border-stone-700/50 pt-6">
          <button
            onClick={handleToggleCompareMode}
            className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-300 focus-ring flex items-center gap-2 ${isCompareMode ? 'bg-sky-600 text-white shadow-md' : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 border dark:border-stone-600'}`}
          >
            <Scale size={16} />
            {isCompareMode ? t('comparison.cancel') : t('comparison.compareProducts')}
          </button>
        </div>
        {isCompareMode && <p className="text-center text-sm text-sky-800 dark:text-sky-300 mt-4 animate-fade-in">{t('comparison.instructions')}</p>}
      </div>
      
      {/* Product Grid */}
      <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredProducts.map((product, index) => (
          <div
            key={product.id}
            className={`scroll-trigger ${isGridVisible ? 'visible' : ''} relative rounded-lg transition-all duration-300 ${isCompareMode ? 'cursor-pointer' : ''} ${isCompareMode && comparisonList.includes(product.id) ? 'ring-4 ring-offset-2 ring-sky-500' : ''}`}
            style={{ transitionDelay: `${index * 100}ms` }}
            onClick={(e) => {
              if (isCompareMode) {
                e.preventDefault();
                toggleProductInComparison(product.id);
              }
            }}
          >
            <ProductCard product={product} onQuickView={!isCompareMode ? handleQuickView : undefined} />
             {isCompareMode && (
                <div className={`absolute inset-0 bg-sky-100/50 dark:bg-sky-900/50 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${comparisonList.includes(product.id) ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="p-2 bg-white dark:bg-stone-800 rounded-full shadow-lg">
                        <Scale size={24} className="text-sky-600 dark:text-sky-400"/>
                    </div>
                </div>
            )}
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
          <div className="text-center py-20 col-span-full">
              <h2 className="text-2xl font-serif text-stone-700 dark:text-stone-300">{t('productsPage.noProductsTitle')}</h2>
              <p className="text-stone-500 dark:text-stone-400 mt-2">{t('productsPage.noProductsSubtitle')}</p>
          </div>
      )}

      {selectedProduct && <QuickViewModal product={selectedProduct} onClose={closeQuickView} />}
      
       {comparisonList.length > 1 && (
            <div className="fixed bottom-6 right-6 z-50 animate-fade-in rtl:right-auto rtl:left-6">
                <button
                    onClick={() => setIsComparisonModalOpen(true)}
                    className="flex items-center gap-3 bg-sky-600 text-white font-bold py-3 px-6 rounded-full shadow-2xl hover:bg-sky-700 transition-all transform hover:scale-105"
                >
                    <Scale size={20} />
                    {t('comparison.compareNow')} ({comparisonList.length})
                </button>
            </div>
        )}

      {isComparisonModalOpen && (
          <ComparisonModal products={comparisonProducts} onClose={() => setIsComparisonModalOpen(false)} />
      )}
    </div>
  );
};

export default ProductsPage;