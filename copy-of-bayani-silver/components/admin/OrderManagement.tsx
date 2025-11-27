
import React, { useContext, useState } from 'react';
import { AppContext } from '../../App';
import { Order, OrderStatus } from '../../types';
import { useI18n } from '../../i18n/I18nProvider';
import { useCurrency } from '../../hooks/useCurrency';
import OrderDetailsModal from './OrderDetailsModal';
import { Eye } from 'lucide-react';

const OrderManagement: React.FC = () => {
    const context = useContext(AppContext);
    const { t } = useI18n();
    const { formatPrice } = useCurrency();
    const [highlightedRowId, setHighlightedRowId] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
        context?.setOrders(prevOrders =>
            prevOrders.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            )
        );
        setHighlightedRowId(orderId);
        setTimeout(() => {
            setHighlightedRowId(null);
        }, 1500); // Highlight lasts for 1.5 seconds
    };

    const orders = context?.orders.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()) || [];

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg border border-stone-200 animate-fade-in">
            <h2 className="text-2xl font-serif text-stone-800 mb-6 border-b pb-4">{t('orderManagement.title')}</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-stone-200">
                    <thead className="bg-stone-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-stone-500 uppercase tracking-wider">{t('orderManagement.orderId')}</th>
                            <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-stone-500 uppercase tracking-wider">{t('orderManagement.customer')}</th>
                            <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-stone-500 uppercase tracking-wider">{t('orderManagement.date')}</th>
                            <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-stone-500 uppercase tracking-wider">{t('orderManagement.total')}</th>
                            <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-stone-500 uppercase tracking-wider">{t('orderManagement.status')}</th>
                            <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-stone-500 uppercase tracking-wider">{t('productList.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-stone-200">
                        {orders.map(order => {
                            const isHighlighted = highlightedRowId === order.id;
                            return (
                                <tr 
                                    key={order.id} 
                                    className={`transition-colors duration-1000 ease-out ${isHighlighted ? 'bg-yellow-100' : ''}`}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-stone-700">{order.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-stone-900">{order.customerName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-600">{new Date(order.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-800 font-semibold">{formatPrice(order.total)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <select
                                            value={order.status}
                                            onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                                            className="form-input form-select focus-ring block w-full py-1 text-xs"
                                        >
                                            {Object.values(OrderStatus).map(status => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <button
                                            onClick={() => setSelectedOrder(order)}
                                            className="text-stone-500 hover:text-stone-800 transition-colors p-1"
                                            title={t('orderManagement.viewDetails')}
                                        >
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {selectedOrder && (
                <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
            )}
        </div>
    );
};

export default OrderManagement;
