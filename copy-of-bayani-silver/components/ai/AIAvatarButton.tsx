
import React, { useState } from 'react';
import { Gem } from 'lucide-react';
import AIAvatar from './AIAvatar';
import { useI18n } from '../../i18n/I18nProvider';

const AIAvatarButton: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { t } = useI18n();

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            <button
                onClick={toggleChat}
                className={`fixed bottom-6 left-6 z-[101] bg-white dark:bg-stone-800 text-stone-800 dark:text-white rounded-full p-4 shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 animate-gold-glow ${isOpen ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`}
                aria-label={t('aiAvatar.buttonAria')}
            >
                <Gem size={28} />
            </button>
            
            {isOpen && <AIAvatar onClose={toggleChat} />}
        </>
    );
};

export default AIAvatarButton;
