import React, { useState, useEffect, useMemo } from 'react';
import AnimatedHeadline from '../components/AnimatedHeadline';
import { useI18n } from '../i18n/I18nProvider';
import { TrendingUp, Calculator } from 'lucide-react';
import AnimatedCounter from '../components/AnimatedCounter';
import { useCurrency } from '../hooks/useCurrency';

const SliderInput: React.FC<{
    label: string;
    id: string;
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    step: number;
    unit: string;
}> = ({ label, id, value, onChange, min, max, step, unit }) => {
    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-stone-700 dark:text-stone-300">
                {label}
            </label>
            <div className="flex items-center gap-4 mt-2">
                <input
                    type="range"
                    id={id}
                    value={value}
                    onChange={e => onChange(parseFloat(e.target.value))}
                    min={min}
                    max={max}
                    step={step}
                    className="w-full cursor-pointer focus-ring"
                />
                <div className="relative w-28">
                    <input
                        type="number"
                        value={value}
                        onChange={e => {
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val)) {
                                onChange(Math.min(max, Math.max(min, val)));
                            }
                        }}
                        min={min}
                        max={max}
                        step={step}
                        className="w-full form-input focus-ring text-center pe-7"
                        aria-label={label}
                    />
                    <span className="absolute inset-y-0 end-0 flex items-center pe-3 text-stone-500 dark:text-stone-400 text-sm">
                        {unit}
                    </span>
                </div>
            </div>
        </div>
    );
};

const GoldPricePage: React.FC = () => {
    const { t } = useI18n();
    const { currency } = useCurrency();

    // Mock live prices in USD
    const [livePrices, setLivePrices] = useState({
        gram: 75.80,
        ounce: 2358.30,
        mesghal: 349.38, // 1 mesghal = 4.6083g
        tola: 884.25, // 1 tola = 11.6638g
    });

    useEffect(() => {
        const interval = setInterval(() => {
            setLivePrices(prev => ({
                gram: prev.gram + (Math.random() - 0.5) * 0.1,
                ounce: prev.ounce + (Math.random() - 0.5) * 0.5,
                mesghal: prev.mesghal + (Math.random() - 0.5) * 0.4,
                tola: prev.tola + (Math.random() - 0.5) * 1,
            }));
        }, 3000);
        return () => clearInterval(interval);
    }, []);
    
    const { formatPrice } = useCurrency();
    const priceFormatter = (val: number) => formatPrice(val);

    const priceData = [
        { label: t('goldPrice.gram'), value: livePrices.gram },
        { label: t('goldPrice.ounce'), value: livePrices.ounce },
        { label: t('goldPrice.mesghal'), value: livePrices.mesghal },
        { label: t('goldPrice.tola'), value: livePrices.tola },
    ];

    // Calculator state
    const [weight, setWeight] = useState(10);
    const [purity, setPurity] = useState(0.750); // 18 Karat
    const [feePercent, setFeePercent] = useState(7);
    const [taxPercent, setTaxPercent] = useState(9);

    const { rawGoldValue, feeAmount, taxAmount, finalPrice } = useMemo(() => {
        const rawGoldValue = weight * livePrices.gram * purity;
        const feeAmount = rawGoldValue * (feePercent / 100);
        const valueWithFee = rawGoldValue + feeAmount;
        const taxAmount = valueWithFee * (taxPercent / 100);
        const finalPrice = valueWithFee + taxAmount;
        return { rawGoldValue, feeAmount, taxAmount, finalPrice };
    }, [weight, purity, feePercent, taxPercent, livePrices.gram]);

    return (
        <div className="container mx-auto px-6 py-20">
            <div className="text-center mb-16">
                <AnimatedHeadline text={t('goldPrice.title')} as="h1" className="text-5xl font-serif text-stone-800 dark:text-stone-200" />
                <p className="text-stone-600 dark:text-stone-400 mt-2 max-w-2xl mx-auto">{t('goldPrice.subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                {/* Live Prices */}
                <div className="lg:col-span-2">
                    <h2 className="text-3xl font-serif text-stone-800 dark:text-stone-200 mb-6 flex items-center gap-3">
                        <TrendingUp className="text-[--color-gold-dark]" /> {t('goldPrice.livePrices')}
                    </h2>
                    <div className="space-y-4">
                        {priceData.map(item => (
                            <div key={item.label} className="flex justify-between items-center p-4 bg-stone-50 dark:bg-stone-800/50 rounded-lg border border-stone-200 dark:border-stone-700/50">
                                <span className="text-lg font-semibold text-stone-700 dark:text-stone-300">{item.label}</span>
                                <span className="text-lg font-mono font-bold text-stone-900 dark:text-stone-100">
                                    <AnimatedCounter value={item.value} formatter={priceFormatter} />
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Calculator */}
                <div className="lg:col-span-3">
                     <h2 className="text-3xl font-serif text-stone-800 dark:text-stone-200 mb-6 flex items-center gap-3">
                        <Calculator className="text-[--color-gold-dark]" /> {t('goldPrice.calculator')}
                    </h2>
                    <div className="bg-white dark:bg-stone-800 p-8 rounded-lg shadow-xl border border-stone-200 dark:border-stone-700">
                        <div className="space-y-6">
                            <SliderInput 
                                label={t('goldPrice.weight')}
                                id="weight"
                                value={weight}
                                onChange={setWeight}
                                min={0}
                                max={100}
                                step={0.1}
                                unit="g"
                            />
                             <div>
                                <label htmlFor="purity" className="block text-sm font-medium text-stone-700 dark:text-stone-300">{t('goldPrice.purity')}</label>
                                <select id="purity" value={purity} onChange={e => setPurity(parseFloat(e.target.value))} className="mt-1 w-full form-input focus-ring form-select">
                                    <option value="0.999">24 Karat (99.9%)</option>
                                    <option value="0.916">22 Karat (91.6%)</option>
                                    <option value="0.750">18 Karat (75.0%)</option>
                                    <option value="0.585">14 Karat (58.5%)</option>
                                </select>
                            </div>
                             <SliderInput 
                                label={t('goldPrice.fee')}
                                id="fee"
                                value={feePercent}
                                onChange={setFeePercent}
                                min={0}
                                max={25}
                                step={0.5}
                                unit="%"
                            />
                            <SliderInput 
                                label={t('goldPrice.tax')}
                                id="tax"
                                value={taxPercent}
                                onChange={setTaxPercent}
                                min={0}
                                max={25}
                                step={0.1}
                                unit="%"
                            />
                            
                            <div className="pt-6 border-t border-stone-200 dark:border-stone-700 space-y-3">
                                <div className="flex justify-between items-center text-sm text-stone-600 dark:text-stone-400">
                                    <span>Raw Gold Value</span>
                                    <AnimatedCounter value={rawGoldValue} formatter={priceFormatter} />
                                </div>
                                <div className="flex justify-between items-center text-sm text-stone-600 dark:text-stone-400">
                                    <span>+ {t('goldPrice.fee')} ({feePercent}%)</span>
                                    <AnimatedCounter value={feeAmount} formatter={priceFormatter} />
                                </div>
                                <div className="flex justify-between items-center text-sm text-stone-600 dark:text-stone-400">
                                    <span>+ {t('goldPrice.tax')} ({taxPercent}%)</span>
                                    <AnimatedCounter value={taxAmount} formatter={priceFormatter} />
                                </div>
                            </div>
                            
                            <div className="p-6 mt-4 rounded-lg bg-gradient-to-br from-stone-100 to-stone-200 dark:from-stone-700/50 dark:to-stone-800/50">
                                <p className="text-lg font-semibold text-stone-700 dark:text-stone-300 text-center">{t('goldPrice.finalPrice')}</p>
                                <p className="text-4xl font-bold text-center mt-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-amber-400 dark:from-yellow-500 dark:to-amber-300">
                                    <AnimatedCounter value={finalPrice} formatter={priceFormatter} />
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default GoldPricePage;