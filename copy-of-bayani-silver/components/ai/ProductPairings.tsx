import React, { useState, useEffect } from 'react';
import { Product } from '../../types';
import { getProductPairings } from '../../services/geminiService';
import ProductCard from '../ProductCard';
import LoadingSpinner from '../LoadingSpinner';
import { Link as LinkIcon, AlertTriangle } from 'lucide-react';
import { useI18n } from '../../i18n/I18nProvider';

interface ProductPairingsProps {
    product: Product;
    allProducts: Product[];
}

const ProductPairings: React.FC<ProductPairingsProps> = ({ product, allProducts }) => {
    const { t } = useI18n();
    const [pairings, setPairings] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPairings = async () => {
            setIsLoading(true);
            setError('');
            try {
                const pairingNames = await getProductPairings(product, allProducts);
                const pairingProducts = allProducts.filter(p => pairingNames.includes(p.name));
                setPairings(pairingProducts);
            } catch (err: any) {
                setError(err.message || t('productPairings.error'));
            } finally {
                setIsLoading(false);
            }
        };

        if (allProducts.length > 2) {
            fetchPairings();
        } else {
            setIsLoading(false);
        }
    }, [product, allProducts, t]);

    const renderHeader = () => (
        <div className="text-center mb-12">
            <h2 className="text-4xl font-serif text-stone-800 flex items-center justify-center gap-4">
                <LinkIcon size={28} className="text-stone-400" />
                {t('productPairings.title')}
            </h2>
            <p className="text-stone-600 mt-2">{t('productPairings.subtitle')}</p>
        </div>
    );

    if (isLoading) {
        return (
             <div className="mt-24">
                {renderHeader()}
                <LoadingSpinner />
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="mt-24">
                {renderHeader()}
                <div className="text-center p-6 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center justify-center gap-2">
                    <AlertTriangle size={18} />
                    {error}
                </div>
            </div>
        );
    }

    if (pairings.length === 0) {
        return null;
    }

    return (
        <div className="mt-24">
            {renderHeader()}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <ProductCard product={product} />
                {pairings.map(p => (
                    <ProductCard key={p.id} product={p} />
                ))}
            </div>
        </div>
    );
};

export default ProductPairings;