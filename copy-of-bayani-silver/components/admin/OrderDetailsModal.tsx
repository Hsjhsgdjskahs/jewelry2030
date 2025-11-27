
import React from 'react';
import { Order } from '../../types';
import { useI18n } from '../../i18n/I18nProvider';
import { useCurrency } from '../../hooks/useCurrency';
import { X, Package } from 'lucide-react';

interface OrderDetailsModalProps {
    order: Order;
    onClose: () => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, onClose }) => {
    const { t } = useI18n();
    const { formatPrice } = useCurrency();

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-stone-900 rounded-lg shadow-2xl w-full max-w-lg overflow-hidden relative" onClick={e => e.stopPropagation()}>
                <header className="p-6 border-b dark:border-stone-700 flex justify-between items-center bg-stone-50 dark:bg-stone-800">
                    <div>
                        <h2 className="text-xl font-serif text-stone-800 dark:text-stone-200">{t('orderDetails.title')}</h2>
                        <p className="text-sm text-stone-500 font-mono">#{order.id}</p>
                    </div>
                    <button onClick={onClose} className="text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors p-1 rounded-full focus-ring">
                        <X size={24} />
                    </button>
                </header>
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    <div className="space-y-4">
                        {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center p-3 border border-stone-200 dark:border-stone-700 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="bg-stone-100 dark:bg-stone-800 p-2 rounded-md">
                                        <Package size={20} className="text-stone-500" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-stone-800 dark:text-stone-200 text-sm">{item.productName}</p>
                                        <p className="text-xs text-stone-500">Qty: {item.quantity}</p>
                                    </div>
                                </div>
                                <p className="font-bold text-stone-700 dark:text-stone-300 text-sm">{formatPrice(item.price * item.quantity)}</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 pt-4 border-t dark:border-stone-700 flex justify-between items-center">
                        <span className="font-bold text-lg text-stone-800 dark:text-stone-200">{t('orderDetails.total')}</span>
                        <span className="font-bold text-xl text-[--color-gold-dark]">{formatPrice(order.total)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsModal;
