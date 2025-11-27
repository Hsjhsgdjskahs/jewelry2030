import React from 'react';
import { useI18n } from '../i18n/I18nProvider';

const LanguageSwitcher: React.FC = () => {
    const { language, setLanguage } = useI18n();

    const languages = [
        { code: 'en', name: 'EN' },
        { code: 'fa', name: 'FA' }
    ];

    return (
        <div className="flex items-center space-x-1 bg-stone-100 rounded-full p-1">
            {languages.map(lang => (
                 <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code as 'en' | 'fa')}
                    className={`px-3 py-1 text-sm font-bold rounded-full transition-all duration-300 focus-ring ${
                        language === lang.code 
                        ? 'bg-white text-stone-800 shadow-sm' 
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                    aria-label={`Switch to ${lang.name}`}
                >
                    {lang.name}
                </button>
            ))}
        </div>
    );
};

export default LanguageSwitcher;
