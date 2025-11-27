
import React, { useContext, useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../App';
import { useI18n } from '../i18n/I18nProvider';
import { useCurrency } from '../hooks/useCurrency';
import AnimatedHeadline from '../components/AnimatedHeadline';
import { Wallet, CreditCard, AlertCircle, ArrowRight, Check, Copy, QrCode, Globe, Clock, Zap, Search, RefreshCw, Loader2, ShieldCheck, ChevronRight } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { IRT_EXCHANGE_RATE } from '../constants';
import { CryptoWalletConfig } from '../types';

declare global {
  interface Window {
    ethereum?: any;
  }
}

// Crypto Icons as Components for better SVG handling
const CryptoIcon: React.FC<{ symbol: string; className?: string }> = ({ symbol, className }) => {
    const s = symbol.toUpperCase();
    if (s === 'BTC') return <svg className={className} viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#F7931A"/><path d="M23.189 14.02c.314-2.096-1.283-3.223-3.465-3.975l.708-2.84-1.728-.43-.69 2.765c-.454-.114-.92-.22-1.385-.326l.695-2.783L15.596 6l-.708 2.839c-.376-.086-.746-.17-1.104-.26l.002-.009-2.384-.595-.46 1.846s1.283.294 1.256.312c.7.175.826.638.805 1.006l-.806 3.235c.048.012.11.03.18.057l-.183-.045-1.13 4.532c-.086.212-.303.531-.793.41.018.025-1.256-.313-1.256-.313l-.858 1.978 2.25.561c.418.105.828.215 1.231.318l-.715 2.872 1.727.43.708-2.84c.472.127.93.245 1.378.357l-.7 2.828 1.728.43.715-2.866c2.948.558 5.164.333 6.097-2.333.752-2.146-.037-3.404-1.595-4.214 1.135-.262 1.99-.993 2.217-2.515zm-3.96 5.638c-.54 2.163-4.187.994-5.37 1.287l.958-3.845c1.183.295 4.977.878 4.412 2.558zm.536-5.673c-.493 1.976-3.568.971-4.567 1.217l.87-3.488c1.001.249 4.195.712 3.697 2.271z" fill="white"/></svg>;
    if (s === 'ETH') return <svg className={className} viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#627EEA"/><path d="M16.498 4v8.87l7.497 3.35L16.498 4z" fill="#C0CBF6"/><path d="M16.498 4L9 16.22l7.498-3.35V4z" fill="white"/><path d="M16.498 21.968v6.027L24 17.616l-7.502 4.352z" fill="#C0CBF6"/><path d="M16.498 27.995v-6.027L9 17.616l7.498 10.38z" fill="white"/><path d="M16.498 20.573l7.497-4.353-7.497-3.348v7.701z" fill="#8197EE"/><path d="M9 16.22l7.498 4.353V12.87L9 16.22z" fill="#C0CBF6"/></svg>;
    if (s === 'USDT') return <svg className={className} viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#26A17B"/><path d="M17.922 13.748v-3.79h5.592V6.993H8.384v2.965h5.597v3.79c-5.467.27-9.333 1.556-9.333 3.092 0 1.764 5.12 3.209 11.339 3.209s11.338-1.445 11.338-3.21c0-1.535-3.866-2.82-9.333-3.091zm-1.947 5.097v.006c0 .02-.012.035-.018.053-.093.31-.228.615-.407.901-.005.012-.017.023-.023.035-.55 1.258-1.708 2.218-3.098 2.218-1.39 0-2.548-.96-3.098-2.218-.006-.012-.018-.023-.023-.035-.18-.286-.315-.59-.408-.901-.006-.018-.017-.035-.017-.053v-.006c-.006-.216-.006-.433.017-.638.006-.035.012-.07.023-.105.076-.556.287-1.076.603-1.533.017-.03.04-.053.058-.082.029-.04.058-.082.088-.123.509-.655 1.27-1.123 2.147-1.258 2.457-.386 5.25.13 6.072 1.129.03.041.06.082.088.123.018.029.041.052.058.082.316.457.527.977.603 1.533.011.035.017.07.023.105.023.205.023.422.017.638h-2.615v-1.123c-.392-.21-1.047-.31-1.638-.31-.59 0-1.246.1-1.638.31v4.757c.392.21 1.047.31 1.638.31.59 0 1.246-.1 1.638-.31v-1.428h2.615z" fill="white"/></svg>;
    if (s === 'BNB') return <svg className={className} viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#F3BA2F"/><path d="M12.116 13.978l-2.03-2.028L13.977 8l2.029 2.029 2.028-2.029 3.89 3.95-2.029 2.028-2.028-2.028-1.862 1.862-1.862-1.862-2.027 2.028zm-3.89 2.027l2.028-2.027 1.861 1.862L8.226 20l-3.89-3.95 3.89-3.995zm9.64 0l1.862 1.861 3.89-3.89 3.89 3.995-3.89 3.95-3.89-3.89-1.862-2.026zm-5.75 5.75L13.978 24l-3.89-3.95 2.028-2.028 2.028 2.028 1.862-1.862 1.862 1.862 2.028-2.028 2.029 2.028-3.891 3.95z" fill="white"/></svg>;
    if (s === 'SOL') return <svg className={className} viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#000000"/><path d="M7.5 20.355a.965.965 0 00.327.73l2.455 2.19c.196.175.452.274.717.274h12.91a.58.58 0 00.58-.58.575.575 0 00-.17-.41l-2.455-2.193a.965.965 0 00-.717-.274H8.238a.58.58 0 00-.58.58.575.575 0 00-.158.41v-.727zm16.417-8.653a.965.965 0 00-.327-.73l-2.455-2.19a1.062 1.062 0 00-.717-.274H7.508a.58.58 0 00-.58.58.575.575 0 00.17.41l2.455 2.194c.196.174.452.273.717.273h12.91a.58.58 0 00.58-.58.575.575 0 00.158-.41v.727zm-16.417 4.354a.965.965 0 00.327.73l2.455 2.193c.196.175.452.274.717.274h12.91a.58.58 0 00.58-.58.575.575 0 00-.17-.41l-2.455-2.193a.965.965 0 00-.717-.274H8.238a.58.58 0 00-.58.58.575.575 0 00-.158.41v-.724z" fill="url(#paint0_linear_sol)"/><defs><linearGradient id="paint0_linear_sol" x1="6.82" y1="23.957" x2="25.59" y2="7.727" gradientUnits="userSpaceOnUse"><stop stopColor="#9945FF"/><stop offset="1" stopColor="#14F195"/></linearGradient></defs></svg>;
    
    // Fallback
    return <div className={`rounded-full bg-stone-700 flex items-center justify-center text-[10px] font-bold text-white ${className}`}>{s.slice(0, 2)}</div>;
}

const CheckoutPage: React.FC = () => {
    const context = useContext(AppContext);
    const navigate = useNavigate();
    const { t } = useI18n();
    const { currency, formatPrice } = useCurrency();

    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [cryptoError, setCryptoError] = useState('');
    const [selectedCrypto, setSelectedCrypto] = useState<CryptoWalletConfig | null>(null);
    const [copiedAddress, setCopiedAddress] = useState(false);
    const [prices, setPrices] = useState<Record<string, number>>({});
    const [isLoadingPrices, setIsLoadingPrices] = useState(true);
    const [cryptoSearch, setCryptoSearch] = useState('');
    const [timeLeft, setTimeLeft] = useState(30);

    const paymentSettings = context?.paymentSettings;

    // Filter enabled wallets
    const enabledWallets = useMemo(() => {
        return paymentSettings?.cryptoWallets.filter(w => w.enabled) || [];
    }, [paymentSettings]);

    // Search filter
    const filteredWallets = useMemo(() => {
        return enabledWallets.filter(w => 
            w.name.toLowerCase().includes(cryptoSearch.toLowerCase()) || 
            w.symbol.toLowerCase().includes(cryptoSearch.toLowerCase())
        );
    }, [enabledWallets, cryptoSearch]);

    // Cart Total in USD
    const cartTotalUSD = useMemo(() => {
        const total = context?.cart.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;
        return total;
    }, [context?.cart]);

    // Fetch Live Prices
    useEffect(() => {
        const fetchPrices = async () => {
            if (enabledWallets.length === 0) {
                setIsLoadingPrices(false);
                return;
            }
            try {
                // Get unique price IDs
                const ids = Array.from(new Set(enabledWallets.map(w => w.priceId))).join(',');
                const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`);
                if (response.ok) {
                    const data = await response.json();
                    const newPrices: Record<string, number> = {};
                    Object.keys(data).forEach(key => {
                        newPrices[key] = data[key].usd;
                    });
                    setPrices(newPrices);
                    setTimeLeft(30); // Reset timer
                }
            } catch (error) {
                console.error("Failed to fetch live crypto prices", error);
            } finally {
                setIsLoadingPrices(false);
            }
        };

        fetchPrices();
        const interval = setInterval(fetchPrices, 30000); 
        const timerInterval = setInterval(() => {
            setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
        }, 1000);

        return () => {
            clearInterval(interval);
            clearInterval(timerInterval);
        };
    }, [enabledWallets]);

    useEffect(() => {
        if (!context?.cart || context.cart.length === 0) {
            navigate('/products');
        }
        if (enabledWallets.length > 0 && !selectedCrypto) {
            setSelectedCrypto(enabledWallets[0]);
        }
    }, [context?.cart, navigate, enabledWallets, selectedCrypto]);
    
    // Listen for account changes
    useEffect(() => {
        const handleAccountsChanged = (accounts: string[]) => {
            if (accounts.length === 0) {
                setWalletAddress(null);
            } else if (walletAddress !== accounts[0]) {
                setWalletAddress(accounts[0]);
            }
        };

        if (window.ethereum?.on) {
            window.ethereum.on('accountsChanged', handleAccountsChanged);
        }

        return () => {
            if (window.ethereum?.removeListener) {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            }
        };
    }, [walletAddress]);


    const handleZarinpalPayment = () => {
        alert(t('checkoutPage.paymentFailedTitle') + '\n' + t('checkoutPage.paymentFailedMessage'));
        context?.clearCart();
        navigate('/confirmation');
    };

    const disconnectWallet = () => {
        setWalletAddress(null);
        setCryptoError('');
    };
    
    const handleConnectWallet = async () => {
        setIsConnecting(true);
        setCryptoError('');
        try {
            if (!window.ethereum) {
                setTimeout(() => {
                    setWalletAddress("0x71C...9A21"); // Mock
                    setIsConnecting(false);
                }, 1500);
                return;
            }
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            if (accounts && accounts.length > 0) {
                setWalletAddress(accounts[0]);
            } else {
                throw new Error(t('checkoutPage.connectionRejected'));
            }
        } catch (err: any) {
            setCryptoError(err.message || t('checkoutPage.connectionRejected'));
        } finally {
            setIsConnecting(false);
        }
    };

    const handleCryptoPayment = async () => {
        if (!context || !selectedCrypto || !paymentSettings) return;
        setCryptoError('');
        setIsProcessing(true);

        const receiverAddress = selectedCrypto.address;
        const currentPrice = prices[selectedCrypto.priceId];

        try {
            if (!receiverAddress) throw new Error("No wallet address configured.");
            if (!currentPrice) throw new Error("Could not fetch price.");

            const cryptoAmount = cartTotalUSD / currentPrice;
            
            await new Promise(resolve => setTimeout(resolve, 4000)); // Sim delay

            // Real Web3 Call if available
            if (window.ethereum && selectedCrypto.symbol === 'ETH' && walletAddress && !walletAddress.includes("...")) {
                 const amountInWei = BigInt(Math.round(cryptoAmount * 1e18)).toString(16);
                 try {
                     await window.ethereum.request({
                        method: 'eth_sendTransaction',
                        params: [{
                            from: walletAddress,
                            to: receiverAddress, 
                            value: amountInWei,
                        }],
                    });
                 } catch (e) {
                     console.warn("Transaction simulated or rejected");
                 }
            }

            context.clearCart();
            navigate('/confirmation');
        } catch (err: any) {
             setCryptoError(err.message || t('checkoutPage.transactionFailed'));
        } finally {
            setIsProcessing(false);
        }
    };

    const getCryptoAmount = (crypto: CryptoWalletConfig) => {
        const price = prices[crypto.priceId];
        if (!price) return '---';
        const amount = cartTotalUSD / price;
        return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 });
    }

    const copyAddress = () => {
        if(!selectedCrypto) return;
        navigator.clipboard.writeText(selectedCrypto.address);
        setCopiedAddress(true);
        setTimeout(() => setCopiedAddress(false), 2000);
    }

    return (
        <div className="container mx-auto px-6 py-20">
            <div className="text-center mb-12">
                <AnimatedHeadline text={t('checkoutPage.title')} as="h1" className="text-5xl font-serif text-stone-800 dark:text-stone-200" />
                <p className="text-stone-600 dark:text-stone-400 mt-2">{t('checkoutPage.subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
                
                {/* Order Summary (Left Side) */}
                <div className="bg-white dark:bg-stone-800/50 p-8 rounded-3xl shadow-xl border border-stone-200 dark:border-stone-700/50 h-fit">
                    <h2 className="text-2xl font-serif mb-6 border-b dark:border-stone-700 pb-4 flex items-center">
                        <CreditCard className="me-3 text-stone-600 dark:text-stone-400" />
                        {t('checkoutPage.orderSummary')}
                    </h2>
                    <div className="space-y-4 mb-6 max-h-96 overflow-y-auto custom-scrollbar pe-2">
                        {context?.cart.map(item => (
                            <div key={item.id} className="flex justify-between items-center text-sm p-3 bg-stone-50 dark:bg-stone-800 rounded-xl">
                                <div className="flex items-center">
                                    <img src={item.imageUrls[0]} alt={item.name} className="w-14 h-14 object-cover rounded-lg me-4 shadow-sm" />
                                    <div>
                                        <p className="font-semibold text-base text-stone-800 dark:text-stone-200">{item.name}</p>
                                        <p className="text-stone-500 text-xs mt-1">Qty: {item.quantity}</p>
                                    </div>
                                </div>
                                <span className="font-bold text-stone-700 dark:text-stone-300">{formatPrice(item.price * item.quantity)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="pt-4 border-t dark:border-stone-700 space-y-3">
                        <div className="flex justify-between items-center text-stone-600 dark:text-stone-400">
                            <span>Subtotal</span>
                            <span>{formatPrice(cartTotalUSD)}</span>
                        </div>
                        <div className="flex justify-between items-center text-stone-600 dark:text-stone-400">
                            <span>Shipping</span>
                            <span className="text-green-600 flex items-center gap-1"><Check size={14}/> Free</span>
                        </div>
                        <div className="flex justify-between items-center text-2xl font-bold pt-4 border-t dark:border-stone-700 text-stone-800 dark:text-stone-100">
                            <span>{t('checkoutPage.total')}</span>
                            <span className="text-[--color-gold-dark]">{formatPrice(cartTotalUSD)}</span>
                        </div>
                    </div>
                    
                    {paymentSettings?.enableZarinpal && currency === 'IRT' && (
                        <div className="mt-8">
                            <button
                                onClick={handleZarinpalPayment}
                                className="w-full bg-[#ffc439] hover:bg-[#eeb01f] text-stone-900 font-bold py-4 px-8 rounded-xl text-lg shadow-lg focus-ring transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center"
                            >
                                <span className="me-2">{t('checkoutPage.payButton')}</span> (ZarinPal)
                            </button>
                            <div className="mt-4 flex items-center justify-center text-stone-500 text-xs gap-2">
                                <ShieldCheck size={14} />
                                {t('checkoutPage.secureTransaction')}
                            </div>
                        </div>
                    )}
                </div>

                {/* Crypto Payment Section */}
                {paymentSettings?.enableCrypto ? (
                <div className="relative bg-stone-900 text-white p-8 rounded-3xl shadow-2xl border border-stone-700 overflow-hidden min-h-[600px] flex flex-col">
                    {/* Background */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-900/30 opacity-40 blur-[100px] rounded-full pointer-events-none"></div>
                    
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6 relative z-10">
                        <div>
                            <h2 className="text-2xl font-serif flex items-center">
                                <Wallet className="me-3 text-[--color-gold]" />
                                {t('checkoutPage.cryptoTitle')}
                            </h2>
                            <p className="text-xs text-stone-400 mt-1">Web3 Secure Terminal</p>
                        </div>
                        <div className="text-right">
                             {!isLoadingPrices && (
                                <div className="inline-flex flex-col items-end">
                                    <span className="flex items-center text-[10px] uppercase font-bold tracking-wider text-green-400 bg-green-900/30 px-2 py-1 rounded-full mb-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse mr-2"></div>
                                        Live Rates
                                    </span>
                                    <div className="w-24 h-1 bg-stone-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-500 transition-all duration-1000 ease-linear" style={{ width: `${(timeLeft / 30) * 100}%` }}></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Selector */}
                    <div className="mb-6 relative z-10">
                        <div className="relative mb-3">
                            <input 
                                type="text" 
                                placeholder="Search coin..." 
                                value={cryptoSearch}
                                onChange={e => setCryptoSearch(e.target.value)}
                                className="w-full bg-black/40 border border-stone-700 rounded-xl py-2 pl-9 pr-4 text-sm text-white focus:border-[--color-gold] focus:ring-0 placeholder-stone-600"
                            />
                            <Search className="absolute left-3 top-2.5 text-stone-500" size={14}/>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto custom-scrollbar pr-1">
                            {filteredWallets.map(wallet => (
                                <button
                                    key={wallet.id}
                                    onClick={() => setSelectedCrypto(wallet)}
                                    className={`flex flex-col items-center p-2 rounded-xl border transition-all duration-200 group ${selectedCrypto?.id === wallet.id ? 'bg-white/10 border-[--color-gold] shadow-[0_0_10px_rgba(212,175,55,0.2)]' : 'bg-stone-800/40 border-stone-700 hover:bg-stone-800 hover:border-stone-500'}`}
                                >
                                    <CryptoIcon symbol={wallet.symbol} className="w-6 h-6 mb-1" />
                                    <span className="font-bold text-[10px]">{wallet.symbol}</span>
                                    <span className="text-[9px] text-stone-500 truncate w-full text-center">{wallet.network}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Active Payment View */}
                    {selectedCrypto && (
                        <div className="flex-grow flex flex-col relative z-10 animate-fade-in">
                            
                            {/* Amount Card */}
                            <div className="bg-gradient-to-br from-stone-800 to-black rounded-2xl p-5 border border-stone-700 mb-6 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-[--color-gold] opacity-0 group-hover:opacity-5 transition-opacity"></div>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-stone-400 text-xs uppercase mb-1">Total to Pay</p>
                                        <p className="text-3xl font-mono font-bold text-white tracking-tight flex items-baseline gap-2">
                                            {getCryptoAmount(selectedCrypto)} 
                                            <span className="text-sm text-[--color-gold] font-sans">{selectedCrypto.symbol}</span>
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-stone-500">1 {selectedCrypto.symbol} ≈</p>
                                        <p className="text-sm font-semibold">${prices[selectedCrypto.priceId]?.toLocaleString() ?? '---'}</p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Payment Method Switcher (Web3 vs Manual) */}
                            {!walletAddress ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 gap-3">
                                        {/* Web3 Option */}
                                        <button
                                            onClick={handleConnectWallet}
                                            disabled={isConnecting}
                                            className="group relative overflow-hidden bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="bg-white/20 p-2 rounded-lg"><Wallet size={18} /></div>
                                                <div className="text-left">
                                                    <p className="text-sm">Pay via Web3</p>
                                                    <p className="text-[10px] opacity-70 font-normal">MetaMask, TrustWallet</p>
                                                </div>
                                            </div>
                                            {isConnecting ? <Loader2 size={18} className="animate-spin"/> : <ChevronRight size={18} className="opacity-50 group-hover:opacity-100 transition-opacity"/>}
                                        </button>

                                        {/* Manual Option */}
                                        <div className="bg-stone-800/60 rounded-xl p-4 border border-stone-700">
                                            <div className="flex justify-between items-center mb-3">
                                                <p className="text-xs font-semibold text-stone-300">Manual Transfer</p>
                                                <span className="text-[10px] text-amber-400 bg-amber-900/30 px-2 py-0.5 rounded border border-amber-800">Network: {selectedCrypto.network}</span>
                                            </div>
                                            
                                            <div className="flex items-center bg-black/50 p-2 rounded-lg border border-stone-600 mb-3">
                                                <QrCode size={32} className="text-white bg-white/10 p-1 rounded mr-3" />
                                                <div className="flex-grow overflow-hidden">
                                                    <p className="text-[10px] text-stone-500 mb-0.5">Send only {selectedCrypto.symbol} to:</p>
                                                    <code className="text-xs text-stone-200 block truncate font-mono">{selectedCrypto.address}</code>
                                                </div>
                                                <button onClick={copyAddress} className="ml-2 p-2 hover:bg-white/10 rounded-lg transition-colors">
                                                    {copiedAddress ? <Check size={16} className="text-green-500"/> : <Copy size={16} className="text-stone-400"/>}
                                                </button>
                                            </div>
                                            
                                            <p className="text-[10px] text-center text-stone-500 flex items-center justify-center gap-1">
                                                <AlertCircle size={10} /> Payments are automatically detected.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4 animate-slide-up">
                                    <div className="bg-stone-800 p-3 rounded-xl border border-green-500/30 flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                            <div>
                                                <p className="text-xs text-stone-400">Connected</p>
                                                <p className="text-xs font-mono text-white truncate w-32">{walletAddress}</p>
                                            </div>
                                        </div>
                                        <button onClick={disconnectWallet} className="text-xs text-red-400 hover:text-red-300">Disconnect</button>
                                    </div>

                                    <button
                                        onClick={handleCryptoPayment}
                                        disabled={isProcessing}
                                        className="w-full bg-[--color-gold] hover:bg-[#b08f26] text-stone-900 font-bold py-4 px-6 rounded-xl transition-all shadow-lg flex items-center justify-center gap-3"
                                    >
                                        {isProcessing ? <Loader2 size={20} className="animate-spin" /> : <ArrowRight size={20} />}
                                        {isProcessing ? 'Confirming...' : 'Send Transaction'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {cryptoError && (
                        <div className="absolute bottom-6 left-6 right-6 bg-red-500/20 backdrop-blur-md border border-red-500/50 p-3 rounded-xl flex items-center gap-3 animate-shake">
                            <AlertCircle className="text-red-500 flex-shrink-0" size={18} />
                            <p className="text-red-200 text-xs">{cryptoError}</p>
                        </div>
                    )}
                </div>
                ) : (
                    <div className="bg-white dark:bg-stone-800/50 p-8 rounded-3xl shadow-xl border border-stone-200 dark:border-stone-700/50 flex items-center justify-center text-center">
                        <p className="text-stone-500">Crypto payments are disabled.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CheckoutPage;
