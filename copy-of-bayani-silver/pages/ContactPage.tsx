
import React, { useState } from 'react';
import AnimatedHeadline from '../components/AnimatedHeadline';
import { useI18n } from '../i18n/I18nProvider';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

const ContactPage: React.FC = () => {
    const { t } = useI18n();
    const { addToast } = useToast();
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            addToast(t('contact.successMessage'), 'success');
            setFormData({ name: '', email: '', message: '' });
        }, 1500);
    };

    return (
        <div className="container mx-auto px-6 py-20">
            <div className="text-center mb-12">
                <AnimatedHeadline text={t('contact.title')} as="h1" className="text-5xl font-serif text-stone-800 dark:text-stone-200" />
                <p className="text-stone-600 dark:text-stone-400 mt-2 max-w-2xl mx-auto">{t('contact.subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                <div className="space-y-8">
                    <div className="bg-white dark:bg-stone-800 p-8 rounded-lg shadow-lg border border-stone-200 dark:border-stone-700">
                        <h3 className="text-2xl font-serif text-stone-800 dark:text-stone-200 mb-6">{t('contact.infoTitle')}</h3>
                        <div className="space-y-6">
                            <div className="flex items-start">
                                <MapPin className="text-[--color-gold-dark] mt-1 me-4" size={24} />
                                <div>
                                    <p className="font-semibold text-stone-800 dark:text-stone-200">{t('contact.addressLabel')}</p>
                                    <p className="text-stone-600 dark:text-stone-400">123 Silver Lane, Artisan District<br/>Tehran, Iran</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <Phone className="text-[--color-gold-dark] mt-1 me-4" size={24} />
                                <div>
                                    <p className="font-semibold text-stone-800 dark:text-stone-200">{t('contact.phoneLabel')}</p>
                                    <p className="text-stone-600 dark:text-stone-400">+98 21 8888 9999</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <Mail className="text-[--color-gold-dark] mt-1 me-4" size={24} />
                                <div>
                                    <p className="font-semibold text-stone-800 dark:text-stone-200">{t('contact.emailLabel')}</p>
                                    <p className="text-stone-600 dark:text-stone-400">hello@bayanisilver.com</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-stone-800 p-8 rounded-lg shadow-lg border border-stone-200 dark:border-stone-700">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-stone-700 dark:text-stone-300">{t('contact.nameLabel')}</label>
                            <input
                                type="text"
                                id="name"
                                required
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                className="mt-1 w-full form-input focus-ring"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-stone-700 dark:text-stone-300">{t('contact.emailFormLabel')}</label>
                            <input
                                type="email"
                                id="email"
                                required
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                                className="mt-1 w-full form-input focus-ring"
                            />
                        </div>
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-stone-700 dark:text-stone-300">{t('contact.messageLabel')}</label>
                            <textarea
                                id="message"
                                required
                                rows={4}
                                value={formData.message}
                                onChange={e => setFormData({...formData, message: e.target.value})}
                                className="mt-1 w-full form-input focus-ring"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full btn-primary-gradient text-white font-bold py-3 px-8 rounded-md text-lg shadow-lg focus-ring flex items-center justify-center disabled:opacity-70"
                        >
                            <Send size={18} className="me-2" />
                            {isSubmitting ? t('contact.sending') : t('contact.sendButton')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
