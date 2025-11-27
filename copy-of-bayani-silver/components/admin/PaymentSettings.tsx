
import React, { useContext, useState, useRef } from 'react';
import { AppContext } from '../../App';
import { useI18n } from '../../i18n/I18nProvider';
import { CreditCard, Save, Wallet, Plus, Trash2, Edit2, X, Check } from 'lucide-react';
import { CryptoWalletConfig } from '../../types';

const PaymentSettings: React.FC = () => {
    const context = useContext(AppContext);
    const { t } = useI18n();
    const [settings, setSettings] = useState(context?.paymentSettings || {
        enableCrypto: true,
        enableZarinpal: true,
        zarinpalMerchantId: '',
        cryptoWallets: []
    });
    const [isSaved, setIsSaved] = useState(false);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingWallet, setEditingWallet] = useState<CryptoWalletConfig | null>(null);
    const [modalForm, setModalForm] = useState<Partial<CryptoWalletConfig>>({});

    const handleSave = () => {
        context?.setPaymentSettings(settings);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    const handleToggleWallet = (id: string) => {
        setSettings(prev => ({
            ...prev,
            cryptoWallets: prev.cryptoWallets.map(w => 
                w.id === id ? { ...w, enabled: !w.enabled } : w
            )
        }));
    };

    const openModal = (wallet?: CryptoWalletConfig) => {
        setEditingWallet(wallet || null);
        setModalForm(wallet || {
            name: '',
            symbol: '',
            network: '',
            address: '',
            priceId: 'bitcoin',
            enabled: true
        });
        setIsModalOpen(true);
    };

    const saveWallet = () => {
        if (!modalForm.name || !modalForm.symbol || !modalForm.address) return; // Basic validation

        if (editingWallet) {
            // Update existing
            setSettings(prev => ({
                ...prev,
                cryptoWallets: prev.cryptoWallets.map(w => 
                    w.id === editingWallet.id ? { ...w, ...modalForm } as CryptoWalletConfig : w
                )
            }));
        } else {
            // Add new
            const newWallet: CryptoWalletConfig = {
                id: modalForm.symbol!.toLowerCase() + '-' + Math.random().toString(36).substr(2, 5),
                name: modalForm.name!,
                symbol: modalForm.symbol!,
                network: modalForm.network || 'Mainnet',
                address: modalForm.address!,
                priceId: modalForm.priceId || 'bitcoin',
                enabled: true
            };
            setSettings(prev => ({
                ...prev,
                cryptoWallets: [...prev.cryptoWallets, newWallet]
            }));
        }
        setIsModalOpen(false);
    };

    const deleteWallet = (id: string) => {
        if (window.confirm('Are you sure you want to delete this wallet?')) {
            setSettings(prev => ({
                ...prev,
                cryptoWallets: prev.cryptoWallets.filter(w => w.id !== id)
            }));
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg border border-stone-200 animate-fade-in relative">
            <h2 className="text-2xl font-serif text-stone-800 mb-6 flex items-center gap-3">
                <CreditCard size={24} />
                {t('paymentSettings.title')}
            </h2>

            <div className="space-y-8">
                {/* General Toggles */}
                <div className="space-y-6 border-b pb-6">
                    <h3 className="font-semibold text-lg text-stone-700">{t('paymentSettings.generalOptions')}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-stone-50 p-4 rounded-lg border border-stone-200">
                            <label className="flex items-center cursor-pointer mb-4">
                                <input
                                    type="checkbox"
                                    checked={settings.enableZarinpal}
                                    onChange={e => setSettings({ ...settings, enableZarinpal: e.target.checked })}
                                    className="form-checkbox h-5 w-5 text-yellow-600 rounded focus:ring-yellow-500"
                                />
                                <span className="ml-2 font-medium text-stone-800">{t('paymentSettings.enableZarinpal')}</span>
                            </label>
                            {settings.enableZarinpal && (
                                <div>
                                    <label className="block text-xs text-stone-500 mb-1">Merchant ID</label>
                                    <input 
                                        type="text" 
                                        value={settings.zarinpalMerchantId}
                                        onChange={e => setSettings({...settings, zarinpalMerchantId: e.target.value})}
                                        className="w-full form-input text-sm font-mono"
                                        placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="bg-stone-50 p-4 rounded-lg border border-stone-200">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.enableCrypto}
                                    onChange={e => setSettings({ ...settings, enableCrypto: e.target.checked })}
                                    className="form-checkbox h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500"
                                />
                                <span className="ml-2 font-medium text-stone-800">{t('paymentSettings.enableCrypto')}</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Crypto Wallets */}
                {settings.enableCrypto && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-lg text-stone-700 flex items-center gap-2">
                                <Wallet size={18} />
                                {t('paymentSettings.cryptoWallets')}
                            </h3>
                            <button onClick={() => openModal()} className="flex items-center gap-1 text-sm bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-md hover:bg-indigo-100 transition-colors">
                                <Plus size={16} /> Add Coin
                            </button>
                        </div>

                        <div className="space-y-3">
                            {settings.cryptoWallets.map((wallet) => (
                                <div key={wallet.id} className="flex items-center justify-between p-4 bg-white border border-stone-200 rounded-lg hover:border-stone-300 transition-colors">
                                    <div className="flex items-center gap-4 flex-grow">
                                        <input
                                            type="checkbox"
                                            checked={wallet.enabled}
                                            onChange={() => handleToggleWallet(wallet.id)}
                                            className="form-checkbox h-4 w-4 text-green-600 rounded focus:ring-green-500"
                                        />
                                        <div className="flex-grow">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-stone-800">{wallet.name}</span>
                                                <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded">{wallet.symbol}</span>
                                                <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded">{wallet.network}</span>
                                            </div>
                                            <p className="text-xs text-stone-500 font-mono mt-1 truncate max-w-md">{wallet.address}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => openModal(wallet)} className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => deleteWallet(wallet.id)} className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex justify-end pt-4">
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 bg-stone-800 text-white font-bold py-2 px-6 rounded-md hover:bg-stone-900 transition-colors shadow-md"
                    >
                        <Save size={18} />
                        {isSaved ? t('common.saved') : t('common.saveChanges')}
                    </button>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
                        <div className="p-4 border-b flex justify-between items-center bg-stone-50">
                            <h3 className="font-bold text-lg text-stone-800">{editingWallet ? 'Edit Wallet' : 'Add New Wallet'}</h3>
                            <button onClick={() => setIsModalOpen(false)}><X size={20} className="text-stone-500 hover:text-stone-800"/></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Coin Name</label>
                                <input className="w-full form-input" value={modalForm.name} onChange={e => setModalForm({...modalForm, name: e.target.value})} placeholder="e.g. Bitcoin"/>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-1">Symbol</label>
                                    <input className="w-full form-input uppercase" value={modalForm.symbol} onChange={e => setModalForm({...modalForm, symbol: e.target.value})} placeholder="BTC"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-1">Network</label>
                                    <input className="w-full form-input" value={modalForm.network} onChange={e => setModalForm({...modalForm, network: e.target.value})} placeholder="Bitcoin"/>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Wallet Address</label>
                                <input className="w-full form-input font-mono text-sm" value={modalForm.address} onChange={e => setModalForm({...modalForm, address: e.target.value})} placeholder="Enter receiving address"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Price Source ID (CoinGecko)</label>
                                <input className="w-full form-input text-sm" value={modalForm.priceId} onChange={e => setModalForm({...modalForm, priceId: e.target.value})} placeholder="e.g. bitcoin, ethereum, tether"/>
                                <p className="text-[10px] text-stone-500 mt-1">Used to fetch live rates. Must match CoinGecko API ID.</p>
                            </div>
                        </div>
                        <div className="p-4 border-t bg-stone-50 flex justify-end gap-3">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-stone-600 hover:bg-stone-200 rounded-md">Cancel</button>
                            <button onClick={saveWallet} className="px-4 py-2 bg-stone-800 text-white rounded-md hover:bg-stone-900 font-medium">Save Wallet</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentSettings;
