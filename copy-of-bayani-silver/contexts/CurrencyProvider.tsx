import React, { createContext, useState, useCallback, useMemo } from 'react';
import { IRT_EXCHANGE_RATE } from '../constants';

export type Currency = 'USD' | 'IRT';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (price: number) => string;
}

export const CurrencyContext = createContext<CurrencyContextType | null>(null);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<Currency>('USD');

  const formatPrice = useCallback((price: number) => {
    if (currency === 'USD') {
      return `$${price.toFixed(2)}`;
    } else {
      const tomanPrice = price * IRT_EXCHANGE_RATE;
      return `${Math.round(tomanPrice).toLocaleString('fa-IR')} تومان`;
    }
  }, [currency]);

  const value = useMemo(() => ({
    currency,
    setCurrency,
    formatPrice,
  }), [currency, formatPrice]);

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};
