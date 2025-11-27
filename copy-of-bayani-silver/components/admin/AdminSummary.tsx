
import React, { useContext, useState, useEffect, useMemo } from 'react';
import { AppContext } from '../../App';
import { Package, ShoppingCart, MessageSquare, DollarSign, Eye, Users, ArrowRight, PlusCircle } from 'lucide-react';
import AISalesInsights from './AISalesInsights';
import { useI18n } from '../../i18n/I18nProvider';
import SalesChart from './SalesChart';
import { Link } from 'react-router-dom';
import { useCurrency } from '../../hooks/useCurrency';
import CustomerPersonas from './CustomerPersonas';
import TrendForecaster from './TrendForecaster';
import { OrderItem } from '../../types';

// FIX: Added missing 'videoStudio' and 'videoAnalysis' to AdminTab type.
type AdminTab = 'dashboard' | 'products' | 'orders' | 'reviews' | 'marketing' | 'contentStudio' | 'imageStudio' | 'videoStudio' | 'videoAnalysis' | 'stories' | 'settings';

interface AdminSummaryProps {
    setActiveTab: (tab: AdminTab) => void;
}

const AdminSummary: React.FC<AdminSummaryProps> = ({ setActiveTab }) => {
    const context = useContext(AppContext);
    const { t } = useI18n();
    const { formatPrice } = useCurrency();
    const [onlineUsers, setOnlineUsers] = useState(0);

    useEffect(() => {
        const baseUsers = Math.floor(Math.random() * 15) + 5; // Base between 5 and 20
        setOnlineUsers(baseUsers);
        const interval = setInterval(() => {
            const fluctuation = Math.floor(Math.random() * 5) - 2; // -2 to +2
            setOnlineUsers(prev => Math.max(3, prev + fluctuation)); 
        }, 4000); // Update every 4 seconds

        return () => clearInterval(interval);
    }, []);

    const totalProducts = context?.products.length || 0;
    const totalOrders = context?.orders.length || 0;
    const totalReviews = context?.reviews.length || 0;
    const totalRevenue = context?.orders.reduce((sum, order) => sum + order.total, 0) || 0;
    const todayVisits = context?.todayVisits || 0;
    
    const stats = [
        { title: t('summary.totalRevenue'), value: formatPrice(totalRevenue), icon: DollarSign, color: 'bg-green-100 text-green-800' },
        { title: t('summary.totalOrders'), value: totalOrders, icon: ShoppingCart, color: 'bg-indigo-100 text-indigo-800' },
        { title: t('summary.totalProducts'), value: totalProducts, icon: Package, color: 'bg-sky-100 text-sky-800' },
        { title: t('summary.totalReviews'), value: totalReviews, icon: MessageSquare, color: 'bg-pink-100 text-pink-800' },
        { title: t('summary.todayVisits'), value: todayVisits, icon: Eye, color: 'bg-yellow-100 text-yellow-800' },
        { title: t('summary.onlineUsers'), value: onlineUsers, icon: Users, color: 'bg-teal-100 text-teal-800' },
    ];
    
    const recentActivities = [
        ...(context?.orders || []).slice(0, 2).map(o => ({ type: 'order' as const, data: o, date: new Date(o.date) })),
        ...(context?.reviews || []).slice(0, 2).map(r => ({ type: 'review' as const, data: r, date: new Date(r.date) }))
    ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 4);

    const topProducts = useMemo(() => {
        if (!context?.orders) {
            return [];
        }
        // FIX: Refactored to use a Map to ensure correct typing for the accumulator
        // and avoid potential type inference issues with Object.entries and sort.
        const productCounts = context.orders
            .flatMap(o => o.items)
            .reduce((acc, item: OrderItem) => {
                acc.set(item.productName, (acc.get(item.productName) || 0) + item.quantity);
                return acc;
            }, new Map<string, number>());
        
        return Array.from(productCounts.entries())
            .sort(([, countA], [, countB]) => countB - countA)
            .slice(0, 5)
            .map(([name, count]) => ({ name, count }));
    }, [context?.orders]);


    return (
        <div className="animate-fade-in space-y-8">
            <div>
                <h2 className="text-2xl font-serif text-stone-800 mb-6">{t('summary.title')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-white p-6 rounded-lg shadow-lg border border-stone-200 flex items-center">
                            <div className={`p-4 rounded-full me-4 ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-stone-600">{stat.title}</p>
                                <p className="text-3xl font-bold text-stone-800">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-lg border border-stone-200">
                    <h3 className="text-xl font-serif text-stone-800 mb-4">{t('summary.salesChartTitle')}</h3>
                    <div className="h-64">
                         <SalesChart orders={context?.orders || []}/>
                    </div>
                </div>
                <div className="space-y-8">
                    <div className="bg-white p-6 rounded-lg shadow-lg border border-stone-200">
                        <h3 className="text-xl font-serif text-stone-800 mb-4">{t('summary.quickActions')}</h3>
                        <div className="space-y-3">
                             <button onClick={() => setActiveTab('products')} className="w-full group flex items-center justify-between text-start p-3 rounded-md text-sm font-medium bg-stone-100 hover:bg-stone-200 transition-colors">
                                <span><PlusCircle size={16} className="inline me-2"/> {t('summary.addNewProduct')}</span>
                                <ArrowRight size={16} className="text-stone-400 group-hover:translate-x-1 transition-transform" />
                            </button>
                             <button onClick={() => setActiveTab('orders')} className="w-full group flex items-center justify-between text-start p-3 rounded-md text-sm font-medium bg-stone-100 hover:bg-stone-200 transition-colors">
                                <span><ShoppingCart size={16} className="inline me-2"/> {t('summary.manageOrders')}</span>
                                <ArrowRight size={16} className="text-stone-400 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-lg border border-stone-200">
                     <h3 className="text-xl font-serif text-stone-800 mb-4">{t('summary.recentActivityTitle')}</h3>
                     <div className="space-y-4">
                        {recentActivities.length > 0 ? recentActivities.map((activity, index) => (
                            <div key={index} className="flex items-start">
                                <div className="p-2 bg-stone-100 rounded-full me-3 mt-1">
                                    {activity.type === 'order' ? <ShoppingCart size={16} className="text-indigo-600"/> : <MessageSquare size={16} className="text-yellow-600"/>}
                                </div>
                                <div className="text-sm">
                                    {activity.type === 'order' && <p>{t('summary.newOrder', { name: activity.data.customerName })}</p>}
                                    {activity.type === 'review' && <p>{t('summary.newReview', { name: activity.data.author })} <Link to={`/product/${activity.data.productId}`} className="text-indigo-600 hover:underline">({t('summary.viewProduct')})</Link></p>}
                                    <p className="text-xs text-stone-500">{activity.date.toLocaleDateString()}</p>
                                </div>
                            </div>
                        )) : <p className="text-sm text-stone-500">{t('summary.noRecentActivity')}</p>}
                     </div>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <AISalesInsights />
                </div>
                <div className="bg-white p-6 rounded-lg shadow-lg border border-stone-200">
                    <h3 className="text-xl font-serif text-stone-800 mb-4">{t('summary.topProducts')}</h3>
                    <ul className="space-y-3">
                        {topProducts.map(p => (
                            <li key={p.name} className="flex justify-between items-center text-sm">
                                <span className="font-medium text-stone-800">{p.name}</span>
                                <span className="text-stone-500">{p.count} {t('summary.unitsSold')}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            
            <CustomerPersonas />
            <TrendForecaster />

        </div>
    );
};

export default AdminSummary;
