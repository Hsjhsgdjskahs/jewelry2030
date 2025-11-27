
import React from 'react';
import { Gem, Sparkles } from 'lucide-react';
import { useI18n } from '../i18n/I18nProvider';
import { NotificationTheme } from '../types';

interface ThemeMorphNotificationProps {
    theme: NotificationTheme;
    message?: string;
}

const ThemeMorphNotification: React.FC<ThemeMorphNotificationProps> = ({ theme, message }) => {
    const { t } = useI18n();

    const contentMap = {
        'Classic': {
            title: t('themeMorph.title'),
            message: t('themeMorph.classic'),
            icon: <Sparkles className="text-yellow-400 flex-shrink-0" size={24} />
        },
        'Modern': {
            title: t('themeMorph.title'),
            message: t('themeMorph.modern'),
            icon: <Sparkles className="text-yellow-400 flex-shrink-0" size={24} />
        },
        'Minimalist': {
            title: t('themeMorph.title'),
            message: t('themeMorph.modern'),
            icon: <Sparkles className="text-yellow-400 flex-shrink-0" size={24} />
        },
        'Joyful': {
            title: t('themeMorph.joyfulTitle'),
            message: t('themeMorph.joyfulMessage'),
            icon: <Sparkles className="text-yellow-400 flex-shrink-0" size={24} />
        },
        'VIP': { // Legacy for old welcome message
            title: t('themeMorph.vipTitle'),
            message: message || '',
            icon: <Gem className="text-amber-400 flex-shrink-0" size={24} />
        },
        'VipBronze': {
            title: t('themeMorph.vipBronzeTitle'),
            message: message || '',
            icon: <Gem className="text-yellow-600 flex-shrink-0" size={24} />
        },
        'VipSilver': {
            title: t('themeMorph.vipSilverTitle'),
            message: message || '',
            icon: <Gem className="text-slate-400 flex-shrink-0" size={24} />
        },
        'VipGold': {
            title: t('themeMorph.vipGoldTitle'),
            message: message || '',
            icon: <Gem className="text-amber-400 flex-shrink-0" size={24} />
        },
    };

    const content = contentMap[theme];

    if (!content) return null;
    
    return (
        <div 
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-stone-800 text-white rounded-lg shadow-2xl flex items-center gap-4 py-3 px-5 animate-toast-in"
            role="status"
            aria-live="polite"
        >
            {content.icon}
            <div>
                <p className="font-bold">{content.title}</p>
                <p className="text-sm text-stone-300">{content.message}</p>
            </div>
        </div>
    );
};

export default ThemeMorphNotification;
