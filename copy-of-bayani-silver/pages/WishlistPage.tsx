
import React, { useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../App';
import ProductCard from '../components/ProductCard';
import { Heart, ShoppingBag } from 'lucide-react';
import { useI18n } from '../i18n/I18nProvider';

const WishlistPage: React.FC = () => {
  const context = useContext(AppContext);
  const { t } = useI18n();

  const wishlistProducts = useMemo(() => {
    if (!context) return [];
    return context.products.filter(product => context.wishlist.includes(product.id));
  }, [context]);

  return (
    <div className="container mx-auto px-6 py-20">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-serif text-stone-800">{t('wishlist.title')}</h1>
        <p className="text-stone-600 mt-2">{t('wishlist.subtitle')}</p>
      </div>

      {wishlistProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {wishlistProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 px-6 bg-stone-50/70 rounded-lg border border-dashed">
          <Heart size={40} className="mx-auto text-stone-400 mb-4"/>
          <h2 className="text-2xl font-serif text-stone-700">{t('wishlist.emptyTitle')}</h2>
          <p className="text-stone-500 mt-2 mb-8">{t('wishlist.emptySubtitle')}</p>
          <Link
            to="/products"
            className="inline-flex items-center bg-stone-800 text-white font-bold py-3 px-8 rounded-md text-lg transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg hover:shadow-xl focus-ring"
          >
            <ShoppingBag size={20} className="me-2"/>
            {t('wishlist.discoverButton')}
          </Link>
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
