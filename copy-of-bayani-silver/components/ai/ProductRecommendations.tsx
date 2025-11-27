import React, { useState, useEffect, useRef, useContext } from 'react';
import { AppContext } from '../../App';
import { Product } from '../../types';
import { getRecommendations } from '../../services/geminiService';
import ProductCard from '../ProductCard';
import LoadingSpinner from '../LoadingSpinner';
import { useI18n } from '../../i18n/I18nProvider';
import useIntersectionObserver from '../../hooks/useIntersectionObserver';

interface ProductRecommendationsProps {
    currentProduct: Product;
}

const ProductRecommendations: React.FC<ProductRecommendationsProps> = ({ currentProduct }) => {
    const context = useContext(AppContext);
    const { t } = useI18n();
    const [recommendations, setRecommendations] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    const recsRef = useRef<HTMLDivElement>(null);
    const isRecsVisible = useIntersectionObserver(recsRef, { threshold: 0.2, triggerOnce: true });

    useEffect(() => {
        const allProducts = context?.products || [];
        const fetchRecs = async () => {
            if (!currentProduct || allProducts.length <= 1) return;
            setIsLoading(true);
            setError('');
            try {
                const recommendedNames = await getRecommendations(currentProduct, allProducts);
                const recommendedProducts = allProducts.filter(p => recommendedNames.includes(p.name));
                setRecommendations(recommendedProducts);
            } catch (err) {
                setError(t('productDetailPage.recommendationsError'));
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRecs();
    }, [currentProduct, context?.products, t]);
    
    if (!isLoading && !error && recommendations.length === 0) {
        return null;
    }

    return (
        <div ref={recsRef} className="mt-24">
            <div className={`text-center mb-12 scroll-trigger ${isRecsVisible ? 'visible' : ''}`}>
                <h2 className="text-4xl font-serif text-stone-800 dark:text-stone-200">{t('productDetailPage.recommendationsTitle')}</h2>
            </div>
            {isLoading && <LoadingSpinner />}
            {error && <p className="text-center text-red-500">{error}</p>}
            {!isLoading && !error && recommendations.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {recommendations.map((rec, index) => (
                      <div
                        key={rec.id}
                        className={`scroll-trigger ${isRecsVisible ? 'visible' : ''}`}
                        style={{ transitionDelay: `${index * 150}ms` }}
                      >
                        <ProductCard product={rec} />
                      </div>
                    ))}
                </div>
            )}
      </div>
    );
};

export default ProductRecommendations;