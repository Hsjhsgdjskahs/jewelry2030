import React from 'react';
import { useCurrency } from '../hooks/useCurrency';

const CurrencySwitcher: React.FC = () => {
    const { currency, setCurrency } = useCurrency();

    const currencies = [
        { code: 'USD', name: 'USD' },
        { code: 'IRT', name: 'IRT' }
    ];

    return (
        <div className="flex items-center space-x-1 bg-stone-100 rounded-full p-1">
            {currencies.map(c => (
                 <button
                    key={c.code}
                    onClick={() => setCurrency(c.code as 'USD' | 'IRT')}
                    className={`px-3 py-1 text-sm font-bold rounded-full transition-all duration-300 focus-ring ${
                        currency === c.code 
                        ? 'bg-white text-stone-800 shadow-sm' 
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                    aria-label={`Switch to ${c.name}`}
                >
                    {c.name}
                </button>
            ))}
        </div>
    );
};

export default CurrencySwitcher;
