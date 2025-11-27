import { useContext } from 'react';
import { CurrencyContext } from '../contexts/CurrencyProvider';

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
