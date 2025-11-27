import React, { useMemo } from 'react';
import { Order } from '../../types';
import { useI18n } from '../../i18n/I18nProvider';
import { useCurrency } from '../../hooks/useCurrency';
import { IRT_EXCHANGE_RATE } from '../../constants';

interface SalesChartProps {
  orders: Order[];
}

const SalesChart: React.FC<SalesChartProps> = ({ orders }) => {
  const { language } = useI18n();
  const { currency, formatPrice } = useCurrency();

  const salesData = useMemo(() => {
    const data: { [key: string]: number } = {};
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29);

    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo);
      date.setDate(date.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      data[dateString] = 0;
    }

    orders.forEach(order => {
      const orderDate = new Date(order.date);
      if (orderDate >= thirtyDaysAgo) {
        const dateString = orderDate.toISOString().split('T')[0];
        if (data[dateString] !== undefined) {
          const value = currency === 'USD' ? order.total : order.total * IRT_EXCHANGE_RATE;
          data[dateString] += value;
        }
      }
    });

    return Object.entries(data).map(([date, total]) => ({ date, total }));
  }, [orders, currency]);

  const maxSales = useMemo(() => Math.max(...salesData.map(d => d.total), 0), [salesData]);

  const yAxisLabels = useMemo(() => {
    if (maxSales === 0) return [formatPrice(0)];
    const steps = 4;
    const labels = [];
    for (let i = 0; i <= steps; i++) {
        let price = (maxSales / steps) * i;
        if (currency === 'IRT') {
            // Re-convert from IRT for formatting logic
            price = price / IRT_EXCHANGE_RATE;
        }
        labels.push(formatPrice(price));
    }
    return labels;
  }, [maxSales, formatPrice, currency]);

  const formatTooltipPrice = (total: number) => {
      if (currency === 'USD') {
          return formatPrice(total);
      }
      return formatPrice(total / IRT_EXCHANGE_RATE);
  }

  return (
    <div className="w-full h-full flex" dir="ltr">
      <div className="flex flex-col justify-between text-xs text-stone-500 py-4 text-right">
        {yAxisLabels.slice().reverse().map((label, i) => (
          <div key={i}>{label}</div>
        ))}
      </div>
      <div className="flex-grow grid grid-cols-30 gap-px border-l border-b border-stone-200 p-1">
        {salesData.map(({ date, total }, index) => {
           const heightPercentage = maxSales > 0 ? (total / maxSales) * 100 : 0;
           const day = new Date(date).getDate();
           const showLabel = day === 1 || (index+1) % 5 === 0;

           return (
            <div key={date} className="relative flex items-end justify-center group">
              <div
                className="w-full bg-indigo-200 hover:bg-indigo-400 transition-colors rounded-t-sm"
                style={{ height: `${heightPercentage}%` }}
              ></div>
              <div className="absolute -bottom-5 text-xs text-stone-400">{showLabel ? day : ''}</div>
              <div className="absolute bottom-full mb-2 w-max px-2 py-1 bg-stone-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {new Date(date).toLocaleDateString(language === 'fa' ? 'fa-IR' : 'en-US', { month: 'short', day: 'numeric' })}: {formatTooltipPrice(total)}
              </div>
            </div>
           )
        })}
      </div>
       <style>{`.grid-cols-30 { grid-template-columns: repeat(30, minmax(0, 1fr)); }`}</style>
    </div>
  );
};

export default SalesChart;
