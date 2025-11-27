import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';

type Language = 'en' | 'fa';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: { [key: string]: any }) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

const interpolate = (str: string, params: { [key: string]: any }): string => {
  let result = str;
  for (const key in params) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), params[key]);
  }
  return result;
};

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [translations, setTranslations] = useState<{ [lang: string]: any }>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTranslations = async () => {
      setIsLoading(true);
      try {
        const [enResponse, faResponse] = await Promise.all([
          fetch('./i18n/locales/en.json'),
          fetch('./i18n/locales/fa.json')
        ]);

        if (!enResponse.ok || !faResponse.ok) {
          throw new Error('Failed to fetch translation files');
        }

        const enData = await enResponse.json();
        const faData = await faResponse.json();
        
        setTranslations({ en: enData, fa: faData });
      } catch (error) {
        console.error("Error loading translations:", error);
        // Fallback to empty objects to prevent app crash
        setTranslations({ en: {}, fa: {} }); 
      } finally {
        setIsLoading(false);
      }
    };
    fetchTranslations();
  }, []);

  const t = useCallback((key: string, params?: { [key: string]: any }) => {
    if (isLoading || !translations[language]) {
        return key; 
    }
      
    const keys = key.split('.');
    let result = translations[language];
    
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        // Fallback to English if key not found in current language
        let fallbackResult = translations.en;
        for (const fk of keys) {
            fallbackResult = fallbackResult?.[fk];
            if (fallbackResult === undefined) return key;
        }
        result = fallbackResult;
        break;
      }
    }
    
    if (params && typeof result === 'string') {
        return interpolate(result, params);
    }

    return result || key;
  }, [language, translations, isLoading]);

  if (isLoading) {
      // Render a simple loading state or null to avoid rendering the app without text
      return null;
  }

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
