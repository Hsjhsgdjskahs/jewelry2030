
import React, { useContext, useMemo } from 'react';
import { AppContext } from '../App';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/I18nProvider';
import { useCurrency } from '../hooks/useCurrency';
import { CartItem } from '../types';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import AnimatedHeadline from '../components/AnimatedHeadline';

const CartPage: React.FC = () => {
    const context = useContext(AppContext);
    const { t } = useI18n();
    const { formatPrice } = useCurrency();

    const cartTotal = useMemo(() => {
        return context?.cart.reduce((total, item) => total + item.price * item.quantity, 0) || 0;
    }, [context?.cart]);

    if (!context || context.cart.length === 0) {
        return (
            <div className="container mx-auto px-6 py-20 text-center">
                <ShoppingBag size={48} className="mx-auto text-stone-300 dark:text-stone-600 mb-4" />
                <h1 className="text-3xl font-serif text-stone-800 dark:text-stone-200">{t('cartPage.emptyTitle')}</h1>
                <p className="text-stone-600 dark:text-stone-400 mt-2 mb-8">{t('cartPage.emptySubtitle')}</p>
                <Link
                    to="/products"
                    className="btn-primary-gradient text-white font-bold py-3 px-8 rounded-md text-lg shadow-lg focus-ring"
                >
                    {t('cartPage.continueShopping')}
                </Link>
            </div>
        );
    }

    const { cart, updateCartQuantity, removeFromCart } = context;

    return (
        <div className="container mx-auto px-6 py-20">
            <div className="text-center mb-12">
                <AnimatedHeadline text={t('cartPage.title')} as="h1" className="text-5xl font-serif text-stone-800 dark:text-stone-200" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    {cart.map(item => (
                        <div key={item.id} className="flex items-center bg-white dark:bg-stone-800/50 p-4 rounded-lg shadow-sm border border-stone-200 dark:border-stone-700/50">
                            <img src={item.imageUrls[0]} alt={item.name} className="w-24 h-24 object-cover rounded-md" />
                            <div className="flex-grow ms-4">
                                <Link to={`/product/${item.id}`} className="font-semibold text-lg font-serif hover:underline">{item.name}</Link>
                                <p className="text-sm text-stone-600 dark:text-stone-400">{formatPrice(item.price)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                                    className="p-1 rounded-full bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 focus-ring"
                                    aria-label={`Decrease quantity of ${item.name}`}
                                >
                                    <Minus size={16} />
                                </button>
                                <span className="w-8 text-center font-semibold">{item.quantity}</span>
                                <button
                                    onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                                    className="p-1 rounded-full bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 focus-ring"
                                    aria-label={`Increase quantity of ${item.name}`}
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                            <div className="ms-4 text-lg font-semibold w-24 text-end">
                                {formatPrice(item.price * item.quantity)}
                            </div>
                            <button
                                onClick={() => removeFromCart(item.id)}
                                className="ms-4 text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 focus-ring"
                                aria-label={t('cartPage.removeAria', { productName: item.name })}
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    ))}
                </div>
                <div className="lg:col-span-1">
                    <div className="bg-stone-50 dark:bg-stone-800/50 p-6 rounded-lg shadow-sm border border-stone-200 dark:border-stone-700/50 sticky top-28">
                        <h2 className="text-2xl font-serif mb-4">{t('cartPage.total')}</h2>
                        <div className="flex justify-between items-center text-lg">
                            <span className="font-semibold">{t('cartPage.subtotal')}</span>
                            <span className="font-bold">{formatPrice(cartTotal)}</span>
                        </div>
                        <Link
                            to="/checkout"
                            className="mt-6 block w-full text-center btn-primary-gradient text-white font-bold py-3 px-8 rounded-md text-lg shadow-lg focus-ring"
                        >
                            {t('cartPage.proceedToCheckout')}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
