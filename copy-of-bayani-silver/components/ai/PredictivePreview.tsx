import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { useI18n } from '../../i18n/I18nProvider';
import { useCurrency } from '../../hooks/useCurrency';
import { ArrowRight, ArrowLeft } from 'lucide-react';

interface PredictivePreviewProps {
    prediction: {
        product: Product;
        headline: string;
    };
    onDismiss: () => void;
}

const PredictivePreview: React.FC<PredictivePreviewProps> = ({ prediction, onDismiss }) => {
    const { product, headline } = prediction;
    const { t, language } = useI18n();
    const { formatPrice } = useCurrency();
    const DirectionalArrow = language === 'fa' ? ArrowLeft : ArrowRight;

    return (
        <section className="h-[75vh] bg-stone-100 dark:bg-stone-800/50 flex items-center justify-center relative overflow-hidden">
            <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="relative predictive-preview-image">
                    <Link to={`/product/${product.id}`}>
                        <img 
                            src={product.imageUrls[0]} 
                            alt={product.name} 
                            className="w-full aspect-square object-cover rounded-lg shadow-2xl transform transition-transform duration-500 hover:scale-105"
                        />
                    </Link>
                </div>
                <div className="text-center md:text-start predictive-preview-content">
                    <p className="text-lg font-semibold text-[--color-gold-dark] mb-2">{t('predictivePreview.intro')}</p>
                    <h1 className="text-4xl lg:text-5xl font-serif font-bold text-stone-800 dark:text-stone-100 mb-4">{headline}</h1>
                    <p className="text-2xl font-serif font-semibold text-stone-700 dark:text-stone-300">{product.name}</p>
                    <p className="text-xl text-stone-500 dark:text-stone-400 mt-2">{formatPrice(product.price)}</p>
                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
                        <Link
                            to={`/product/${product.id}`}
                            className="inline-flex items-center justify-center btn-primary-gradient text-white font-bold py-3 px-8 rounded-md text-lg shadow-lg focus-ring breathing-effect w-full sm:w-auto"
                        >
                            {t('predictivePreview.viewButton')}
                            <DirectionalArrow size={20} className="ms-2"/>
                        </Link>
                        <button
                            onClick={onDismiss}
                            className="font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 transition-colors py-3 px-6 focus-ring rounded-md w-full sm:w-auto"
                        >
                            {t('predictivePreview.dismiss')}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PredictivePreview;