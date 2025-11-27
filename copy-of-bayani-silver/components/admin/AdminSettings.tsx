import React, { useContext, useState, useEffect, useRef } from 'react';
import { AppContext } from '../../App';
import { useI18n } from '../../i18n/I18nProvider';
import { Fingerprint, Sparkles, Image as ImageIcon, Upload, Video, Trash2, Palette, Type, CornerRightUp, TextQuote, Layout as LayoutIcon, Brush, ChevronDown, Wand2, Droplets } from 'lucide-react';
import { generateWelcomeMessage } from '../../services/geminiService';
import LoadingSpinner from '../LoadingSpinner';
import { DEFAULT_HERO_IMAGE, DEFAULT_HERO_VIDEO, DEFAULT_THEME_SETTINGS } from '../../constants';
import { FontPairing, CustomThemeSettings, ButtonStyle, CardStyle, Product, SiteWidth, HeaderStyle, NavLinkStyle } from '../../types';
import { hexToRgba, adjustColor } from '../../utils/colorUtils';

// Helper functions to handle ArrayBuffers for WebAuthn
const bufferEncode = (value: ArrayBuffer) => btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(value))));

type MediaType = 'image' | 'video';

const previewProduct: Product = {
  id: 'preview',
  name: 'Preview Item',
  price: 199,
  description: 'An elegant preview item.',
  imageUrls: ['https://picsum.photos/seed/preview-item/400/400'],
  category: 'Decor',
  metaDescription: ''
};

const PreviewCard: React.FC = () => {
    return (
        <div className="group relative glass-card product-card-interactive-sheen w-full shadow-lg">
             <div className="w-full h-32 bg-stone-200 dark:bg-stone-700 overflow-hidden relative">
                <img src={previewProduct.imageUrls[0]} alt="preview" className="w-full h-full object-cover"/>
                 <div className="sheen-element"></div>
            </div>
            <div className="p-3 text-start">
                <h3 className="text-md font-serif font-semibold text-stone-800 dark:text-stone-200 truncate">{previewProduct.name}</h3>
                <p className="text-[--color-gold-dark] mt-1 text-sm font-semibold">$199.00</p>
            </div>
        </div>
    )
}

const LivePreview: React.FC<{ theme: CustomThemeSettings }> = ({ theme }) => {
    const { fontPairing, cardStyle, fontScale, siteWidth, headerStyle, navLinkStyle } = theme;

    const previewRootStyle: React.CSSProperties = {
        '--color-gold': theme.primaryColor,
        '--color-gold-dark': adjustColor(theme.primaryColor, -20),
        '--color-glow': hexToRgba(theme.primaryColor, 0.3),
        '--color-accent': theme.accentColor,
        '--bg-light': theme.bgColorLight,
        '--bg-dark': theme.bgColorDark,
        '--border-radius-base': `${theme.borderRadius}rem`,
        '--btn-border-radius': {
            sharp: '0.125rem',
            rounded: '0.375rem',
            pill: '9999px',
        }[theme.buttonStyle],
        '--heading-font-weight': theme.headingWeight.toString(),
        '--heading-letter-spacing': `${theme.headingLetterSpacing}em`,
        '--animation-speed-factor': (1 / theme.animationIntensity).toString(),
        '--shadow-opacity-factor': theme.shadowIntensity.toString(),
        fontSize: `calc(14px * ${fontScale})`, // Use a smaller base for preview
    } as React.CSSProperties;

    let fontClass = '';
    if (fontPairing === 'lora-lato') fontClass = 'font-pairing-lora-lato';
    if (fontPairing === 'cormorant-open') fontClass = 'font-pairing-cormorant-open';

    const bodyClasses = [
        fontClass,
        cardStyle === 'flat' ? 'theme-card-flat' : '',
        siteWidth === 'wide' ? 'layout-wide' : '',
        siteWidth === 'full' ? 'layout-full' : '',
        headerStyle === 'centered' ? 'header-style-centered' : '',
        navLinkStyle === 'background' ? 'nav-style-background' : '',
    ].join(' ');


    return (
        <div 
            style={previewRootStyle}
            className={`p-6 bg-[var(--bg-light)] border border-stone-200 rounded-lg ${bodyClasses}`}
        >
            <h4 className="text-lg font-semibold mb-4 text-center text-stone-700">Live Preview</h4>
            <div className="space-y-6 flex flex-col items-center">
                 <div className="w-48">
                    <PreviewCard />
                 </div>
                 <h2 className="font-serif text-2xl text-stone-800">A Title Here</h2>
                 <p className="text-stone-600">Some body text for preview.</p>
                 <button className="btn-primary-gradient text-white font-bold py-2 px-6">A Button</button>
            </div>
        </div>
    );
};

const CollapsibleSettingsSection: React.FC<{ title: string, icon: React.ElementType, children: React.ReactNode, defaultOpen?: boolean }> = ({ title, icon: Icon, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-stone-200 dark:border-stone-700">
            <button
                className="w-full flex justify-between items-center p-4 text-left"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
            >
                <h3 className="text-lg font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-3"><Icon size={20}/>{title}</h3>
                <ChevronDown size={20} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`grid overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="min-h-0">
                    <div className="p-4 pt-0">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};


const AdminSettings: React.FC = () => {
    const context = useContext(AppContext);
    const { t } = useI18n();
    const [welcomeTitle, setWelcomeTitle] = useState('');
    const [welcomeSubtitle, setWelcomeSubtitle] = useState('');
    const [heroImage, setHeroImage] = useState<string>('');
    const [heroVideoUrl, setHeroVideoUrl] = useState<string>('');
    const [mediaType, setMediaType] = useState<MediaType>('image');
    const [isContentSaved, setIsContentSaved] = useState(false);
    const [isThemeSaved, setIsThemeSaved] = useState(false);
    
    const heroImageInputRef = useRef<HTMLInputElement>(null);
    const heroVideoInputRef = useRef<HTMLInputElement>(null);
    
    const [biometricStatus, setBiometricStatus] = useState<'unsupported' | 'not_registered' | 'registered'>('unsupported');
    const [biometricError, setBiometricError] = useState('');
    
    const [keywords, setKeywords] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatorError, setGeneratorError] = useState('');

    const { customTheme, setCustomTheme } = useContext(AppContext)!;
    const [themeSettings, setThemeSettings] = useState<CustomThemeSettings>(() => ({...DEFAULT_THEME_SETTINGS, ...customTheme}));

    useEffect(() => {
        setThemeSettings({...DEFAULT_THEME_SETTINGS, ...customTheme});
    }, [customTheme]);

    useEffect(() => {
        if (context) {
            setWelcomeTitle(context.welcomeMessage.title);
            setWelcomeSubtitle(context.welcomeMessage.subtitle);
            setHeroImage(context.heroImage);
            setHeroVideoUrl(context.heroVideoUrl);
            setMediaType(context.heroVideoUrl ? 'video' : 'image');
        }
    }, [context]);
    
    useEffect(() => {
        const checkBiometrics = async () => {
            if (window.PublicKeyCredential && await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()) {
                 const credentialId = localStorage.getItem('bayani_webauthn_credentialId');
                setBiometricStatus(credentialId ? 'registered' : 'not_registered');
            } else {
                setBiometricStatus('unsupported');
            }
        };
        checkBiometrics();
    }, []);

    const handleSaveContent = (e: React.FormEvent) => {
        e.preventDefault();
        context?.setWelcomeMessage({ title: welcomeTitle, subtitle: welcomeSubtitle });
        
        if (mediaType === 'image') {
            context?.setHeroImage(heroImage);
            context?.setHeroVideoUrl(''); // Clear video when saving image
        } else {
            context?.setHeroVideoUrl(heroVideoUrl);
        }

        setIsContentSaved(true);
        setTimeout(() => setIsContentSaved(false), 2000);
    };
    
    const handleGenerateMessage = async () => {
        if (!keywords) {
            setGeneratorError(t('settings.errorKeywords'));
            return;
        }
        setGeneratorError('');
        setIsGenerating(true);
        try {
            const { title, subtitle } = await generateWelcomeMessage(keywords);
            setWelcomeTitle(title);
            setWelcomeSubtitle(subtitle);
        } catch (err) {
            setGeneratorError(t('settings.errorGenerate'));
        } finally {
            setIsGenerating(false);
        }
    };

    const handleRegisterBiometrics = async () => {
        setBiometricError('');
        try {
            const options: CredentialCreationOptions = {
                publicKey: {
                    rp: { name: "Bayani Silver Admin" },
                    user: {
                        id: new Uint8Array(16), 
                        name: "admin@bayanisilver.com",
                        displayName: "Admin",
                    },
                    challenge: new Uint8Array(32),
                    pubKeyCredParams: [{ type: "public-key", alg: -7 }],
                    authenticatorSelection: {
                        authenticatorAttachment: "platform",
                        userVerification: "required",
                    },
                    timeout: 60000,
                }
            };
            const credential = await navigator.credentials.create(options) as PublicKeyCredential;
            
            localStorage.setItem('bayani_webauthn_credentialId', bufferEncode(credential.rawId));
            setBiometricStatus('registered');
        } catch (err) {
            console.error('Biometric registration failed:', err);
            setBiometricError(t('settings.biometricRegisterError'));
        }
    };
    
    const handleHeroImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setHeroImage(URL.createObjectURL(file));
        }
    };

    const handleHeroVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setHeroVideoUrl(URL.createObjectURL(file));
        }
    };
    
    const resetHeroMedia = () => {
        setHeroImage(DEFAULT_HERO_IMAGE);
        setHeroVideoUrl(DEFAULT_HERO_VIDEO);
        setMediaType('image');
    };

    const handleThemeSettingChange = <K extends keyof CustomThemeSettings>(key: K, value: CustomThemeSettings[K]) => {
      setThemeSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSaveTheme = () => {
        setCustomTheme(themeSettings);
        setIsThemeSaved(true);
        setTimeout(() => setIsThemeSaved(false), 2000);
    };

    const handleResetTheme = () => {
        setThemeSettings(DEFAULT_THEME_SETTINGS);
    };

    return (
        <div className="space-y-8 animate-fade-in">
             <div className="bg-white dark:bg-stone-800 rounded-lg shadow-lg border border-stone-200 dark:border-stone-700">
                <div className="p-6">
                    <h2 className="text-2xl font-serif text-stone-800 dark:text-stone-200 mb-2 flex items-center gap-3"><Palette size={24}/>{t('settings.customizationTitle')}</h2>
                    <p className="text-sm text-stone-600 dark:text-stone-400">{t('settings.customizationSubtitle')}</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6">
                    <div className="lg:col-span-2 space-y-4 border border-stone-200 dark:border-stone-700 rounded-lg">
                        
                        <CollapsibleSettingsSection title="Colors" icon={Brush} defaultOpen>
                           <div className="space-y-4">
                              <div className="flex items-center gap-4">
                                  <label htmlFor="primaryColor" className="text-sm font-medium text-stone-700 dark:text-stone-300">Primary</label>
                                  <input type="color" id="primaryColor" value={themeSettings.primaryColor} onChange={(e) => handleThemeSettingChange('primaryColor', e.target.value)} className="w-10 h-10 p-1 bg-white border border-stone-300 rounded-md cursor-pointer"/>
                              </div>
                              <div className="flex items-center gap-4">
                                  <label htmlFor="accentColor" className="text-sm font-medium text-stone-700 dark:text-stone-300">Accent</label>
                                  <input type="color" id="accentColor" value={themeSettings.accentColor} onChange={(e) => handleThemeSettingChange('accentColor', e.target.value)} className="w-10 h-10 p-1 bg-white border border-stone-300 rounded-md cursor-pointer"/>
                              </div>
                               <div className="flex items-center gap-4">
                                  <label htmlFor="bgColorLight" className="text-sm font-medium text-stone-700 dark:text-stone-300">BG Light</label>
                                  <input type="color" id="bgColorLight" value={themeSettings.bgColorLight} onChange={(e) => handleThemeSettingChange('bgColorLight', e.target.value)} className="w-10 h-10 p-1 bg-white border border-stone-300 rounded-md cursor-pointer"/>
                              </div>
                              <div className="flex items-center gap-4">
                                  <label htmlFor="bgColorDark" className="text-sm font-medium text-stone-700 dark:text-stone-300">BG Dark</label>
                                  <input type="color" id="bgColorDark" value={themeSettings.bgColorDark} onChange={(e) => handleThemeSettingChange('bgColorDark', e.target.value)} className="w-10 h-10 p-1 bg-white border border-stone-300 rounded-md cursor-pointer"/>
                              </div>
                           </div>
                        </CollapsibleSettingsSection>

                        <CollapsibleSettingsSection title="Typography" icon={Type}>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="fontPairing" className="block text-sm font-medium text-stone-700 dark:text-stone-300">{t('settings.fontPairing')}</label>
                                    <select id="fontPairing" value={themeSettings.fontPairing} onChange={(e) => handleThemeSettingChange('fontPairing', e.target.value as FontPairing)} className="mt-1 w-full max-w-xs form-input focus-ring form-select">
                                        <option value="default">{t('settings.fontPairingDefault')}</option>
                                        <option value="lora-lato">{t('settings.fontPairingLora')}</option>
                                        <option value="cormorant-open">{t('settings.fontPairingCormorant')}</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="fontScale" className="block text-sm font-medium text-stone-700 dark:text-stone-300">Font Size Scale ({Math.round(themeSettings.fontScale * 100)}%)</label>
                                    <input type="range" id="fontScale" min="0.9" max="1.2" step="0.05" value={themeSettings.fontScale} onChange={(e) => handleThemeSettingChange('fontScale', parseFloat(e.target.value))} className="mt-1 w-full max-w-xs accent-[--color-gold-dark] focus-ring"/>
                                </div>
                                <div>
                                    <label htmlFor="headingWeight" className="block text-sm font-medium text-stone-700 dark:text-stone-300">Heading Weight ({themeSettings.headingWeight})</label>
                                    <input type="range" id="headingWeight" min="300" max="800" step="100" value={themeSettings.headingWeight} onChange={(e) => handleThemeSettingChange('headingWeight', parseInt(e.target.value))} className="mt-1 w-full max-w-xs accent-[--color-gold-dark] focus-ring"/>
                                </div>
                                <div>
                                    <label htmlFor="headingLetterSpacing" className="block text-sm font-medium text-stone-700 dark:text-stone-300">Heading Letter Spacing ({themeSettings.headingLetterSpacing.toFixed(2)}em)</label>
                                    <input type="range" id="headingLetterSpacing" min="-0.05" max="0.1" step="0.01" value={themeSettings.headingLetterSpacing} onChange={(e) => handleThemeSettingChange('headingLetterSpacing', parseFloat(e.target.value))} className="mt-1 w-full max-w-xs accent-[--color-gold-dark] focus-ring"/>
                                </div>
                            </div>
                        </CollapsibleSettingsSection>
                        
                         <CollapsibleSettingsSection title="Layout & Style" icon={LayoutIcon}>
                             <div className="space-y-4">
                                <div>
                                    <label htmlFor="siteWidth" className="block text-sm font-medium text-stone-700 dark:text-stone-300">Site Width</label>
                                    <select id="siteWidth" value={themeSettings.siteWidth} onChange={(e) => handleThemeSettingChange('siteWidth', e.target.value as SiteWidth)} className="mt-1 w-full max-w-xs form-input focus-ring form-select">
                                        <option value="standard">Standard (1280px)</option>
                                        <option value="wide">Wide (1536px)</option>
                                        <option value="full">Full Width</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="headerStyle" className="block text-sm font-medium text-stone-700 dark:text-stone-300">Header Style</label>
                                    <select id="headerStyle" value={themeSettings.headerStyle} onChange={(e) => handleThemeSettingChange('headerStyle', e.target.value as HeaderStyle)} className="mt-1 w-full max-w-xs form-input focus-ring form-select">
                                        <option value="standard">Standard</option>
                                        <option value="centered">Centered</option>
                                    </select>
                                </div>
                                 <div>
                                    <label htmlFor="navLinkStyle" className="block text-sm font-medium text-stone-700 dark:text-stone-300">Nav Link Hover Style</label>
                                    <select id="navLinkStyle" value={themeSettings.navLinkStyle} onChange={(e) => handleThemeSettingChange('navLinkStyle', e.target.value as NavLinkStyle)} className="mt-1 w-full max-w-xs form-input focus-ring form-select">
                                        <option value="underline">Underline</option>
                                        <option value="background">Background</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="borderRadius" className="block text-sm font-medium text-stone-700 dark:text-stone-300">{t('settings.borderRadius')} ({themeSettings.borderRadius}rem)</label>
                                    <input type="range" id="borderRadius" min="0" max="1.5" step="0.125" value={themeSettings.borderRadius} onChange={(e) => handleThemeSettingChange('borderRadius', parseFloat(e.target.value))} className="mt-1 w-full max-w-xs accent-[--color-gold-dark] focus-ring"/>
                                </div>
                                <div>
                                    <label htmlFor="buttonStyle" className="block text-sm font-medium text-stone-700 dark:text-stone-300">Button Style</label>
                                    <select id="buttonStyle" value={themeSettings.buttonStyle} onChange={(e) => handleThemeSettingChange('buttonStyle', e.target.value as ButtonStyle)} className="mt-1 w-full max-w-xs form-input focus-ring form-select">
                                        <option value="rounded">Rounded</option>
                                        <option value="pill">Pill</option>
                                        <option value="sharp">Sharp</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="cardStyle" className="block text-sm font-medium text-stone-700 dark:text-stone-300">Product Card Style</label>
                                    <select id="cardStyle" value={themeSettings.cardStyle} onChange={(e) => handleThemeSettingChange('cardStyle', e.target.value as CardStyle)} className="mt-1 w-full max-w-xs form-input focus-ring form-select">
                                        <option value="glow">Glow (Glass)</option>
                                        <option value="flat">Flat (Shadow)</option>
                                    </select>
                                </div>
                             </div>
                        </CollapsibleSettingsSection>

                         <CollapsibleSettingsSection title="Effects" icon={Wand2}>
                           <div className="space-y-4">
                              <div>
                                  <label htmlFor="animationIntensity" className="block text-sm font-medium text-stone-700 dark:text-stone-300">Animation Speed ({themeSettings.animationIntensity.toFixed(2)}x)</label>
                                  <input type="range" id="animationIntensity" min="0.5" max="2" step="0.1" value={themeSettings.animationIntensity} onChange={(e) => handleThemeSettingChange('animationIntensity', parseFloat(e.target.value))} className="mt-1 w-full max-w-xs accent-[--color-gold-dark] focus-ring"/>
                              </div>
                              <div>
                                  <label htmlFor="shadowIntensity" className="block text-sm font-medium text-stone-700 dark:text-stone-300">Shadow Intensity ({Math.round(themeSettings.shadowIntensity * 100)}%)</label>
                                  <input type="range" id="shadowIntensity" min="0" max="1.5" step="0.1" value={themeSettings.shadowIntensity} onChange={(e) => handleThemeSettingChange('shadowIntensity', parseFloat(e.target.value))} className="mt-1 w-full max-w-xs accent-[--color-gold-dark] focus-ring"/>
                              </div>
                           </div>
                        </CollapsibleSettingsSection>
                    </div>
                    <div className="lg:col-span-1">
                        <LivePreview theme={themeSettings} />
                    </div>
                </div>
                 <div className="flex justify-between items-center p-6 mt-6 border-t border-stone-200 dark:border-stone-700">
                    <button type="button" onClick={handleResetTheme} className="text-sm font-semibold text-stone-600 hover:text-stone-900 focus-ring rounded-md p-2 inline-flex items-center gap-1">
                        <CornerRightUp size={14} />
                        {t('settings.resetTheme')}
                    </button>
                    <div className="flex items-center gap-4">
                        {isThemeSaved && <p className="text-green-600 text-sm transition-opacity">{t('settings.savedMessage')}</p>}
                        <button type="button" onClick={handleSaveTheme} className="py-2 px-6 bg-stone-800 text-white font-bold rounded-md hover:bg-stone-900 transition-all duration-300 shadow-sm transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 focus-ring">
                            {t('common.saveChanges')}
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-stone-800 rounded-lg shadow-lg border border-stone-200 dark:border-stone-700">
                <CollapsibleSettingsSection title={t('settings.welcomeTitle')} icon={TextQuote}>
                    <form onSubmit={handleSaveContent} className="space-y-8 p-4">
                        <section>
                            <p className="text-sm text-stone-600 dark:text-stone-400 mb-4">{t('settings.welcomeSubtitle')}</p>
                            <div className="p-4 bg-stone-50 dark:bg-stone-900/50 rounded-lg border border-stone-200 dark:border-stone-700 mb-6">
                                <h4 className="text-base font-semibold text-stone-700 dark:text-stone-300 flex items-center"><Sparkles size={18} className="me-2 text-yellow-500"/>{t('settings.aiGeneratorTitle')}</h4>
                                <p className="text-sm text-stone-600 dark:text-stone-400 mb-3">{t('settings.aiGeneratorSubtitle')}</p>
                                <div className="flex items-center gap-2">
                                    <input type="text" value={keywords} onChange={e => setKeywords(e.target.value)} placeholder={t('settings.aiKeywordsPlaceholder')} className="flex-grow form-input focus-ring"/>
                                    <button type="button" onClick={handleGenerateMessage} disabled={isGenerating} className="py-2 px-4 bg-stone-800 text-white font-bold rounded-md hover:bg-stone-900 transition-colors disabled:opacity-50 focus-ring">
                                    {isGenerating ? <LoadingSpinner size="sm"/> : t('settings.aiGenerateButton')}
                                    </button>
                                </div>
                                {generatorError && <p className="text-red-500 text-xs mt-1">{generatorError}</p>}
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="welcomeTitle" className="block text-sm font-medium text-stone-700 dark:text-stone-300">{t('settings.titleLabel')}</label>
                                    <input type="text" id="welcomeTitle" value={welcomeTitle} onChange={(e) => setWelcomeTitle(e.target.value)} className="mt-1 w-full form-input focus-ring"/>
                                </div>
                                <div>
                                    <label htmlFor="welcomeSubtitle" className="block text-sm font-medium text-stone-700 dark:text-stone-300">{t('settings.subtitleLabel')}</label>
                                    <textarea id="welcomeSubtitle" value={welcomeSubtitle} onChange={(e) => setWelcomeSubtitle(e.target.value)} rows={3} className="mt-1 w-full form-input focus-ring"/>
                                </div>
                            </div>
                        </section>
                        
                        <section>
                            <h3 className="text-lg font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-2"><ImageIcon size={20}/>{t('settings.heroMediaTitle')}</h3>
                            <p className="text-sm text-stone-600 dark:text-stone-400 mb-4">{t('settings.heroMediaSubtitle')}</p>

                            <div>
                                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">{t('settings.mediaType')}</label>
                                <div className="mt-2 flex gap-4">
                                    <label className="inline-flex items-center">
                                        <input type="radio" value="image" checked={mediaType === 'image'} onChange={() => setMediaType('image')} className="form-radio text-[--color-gold-dark] focus:ring-[--color-gold-dark]/50 bg-stone-100 dark:bg-stone-900 border-stone-300 dark:border-stone-600"/>
                                        <span className="ms-2">{t('settings.image')}</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <input type="radio" value="video" checked={mediaType === 'video'} onChange={() => setMediaType('video')} className="form-radio text-[--color-gold-dark] focus:ring-[--color-gold-dark]/50 bg-stone-100 dark:bg-stone-900 border-stone-300 dark:border-stone-600"/>
                                        <span className="ms-2">{t('settings.video')}</span>
                                    </label>
                                </div>
                            </div>

                            <div className="mt-4 flex items-start gap-6">
                                <div className="w-48 h-28 rounded-md overflow-hidden shadow-md bg-stone-200 dark:bg-stone-700 flex-shrink-0">
                                    {mediaType === 'image' && heroImage && (
                                        <img src={heroImage} alt={t('settings.currentImage')} className="w-full h-full object-cover" />
                                    )}
                                    {mediaType === 'video' && heroVideoUrl && (
                                        <video src={heroVideoUrl} muted loop playsInline className="w-full h-full object-cover" />
                                    )}
                                    {(mediaType === 'image' && !heroImage || mediaType === 'video' && !heroVideoUrl) && (
                                        <div className="w-full h-full flex items-center justify-center">
                                            {mediaType === 'image' ? <ImageIcon size={32} className="text-stone-400" /> : <Video size={32} className="text-stone-400" />}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-grow">
                                    {mediaType === 'image' ? (
                                        <>
                                            <input type="file" ref={heroImageInputRef} onChange={handleHeroImageChange} accept="image/*" className="hidden"/>
                                            <button type="button" onClick={() => heroImageInputRef.current?.click()} className="inline-flex items-center bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-200 font-bold py-2 px-4 rounded-md border border-stone-300 dark:border-stone-600 text-sm hover:bg-stone-50 dark:hover:bg-stone-600 transition-colors focus-ring">
                                                <Upload size={16} className="me-2" />
                                                {t('settings.changeImageButton')}
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <input type="file" ref={heroVideoInputRef} onChange={handleHeroVideoChange} accept="video/*" className="hidden"/>
                                            <button type="button" onClick={() => heroVideoInputRef.current?.click()} className="inline-flex items-center bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-200 font-bold py-2 px-4 rounded-md border border-stone-300 dark:border-stone-600 text-sm hover:bg-stone-50 dark:hover:bg-stone-600 transition-colors focus-ring">
                                                <Upload size={16} className="me-2" />
                                                {t('settings.changeVideoButton')}
                                            </button>
                                        </>
                                    )}
                                    <button type="button" onClick={resetHeroMedia} className="ms-2 text-sm text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 focus-ring rounded-md p-2 inline-flex items-center gap-1">
                                        <Trash2 size={14} />
                                        {t('settings.resetToDefault')}
                                    </button>
                                </div>
                            </div>
                        </section>
                        
                        <div className="flex justify-end items-center pt-6 border-t border-stone-200 dark:border-stone-700">
                            {isContentSaved && <p className="text-green-600 text-sm me-4 transition-opacity">{t('settings.savedMessage')}</p>}
                            <button type="submit" className="py-2 px-6 bg-stone-800 text-white font-bold rounded-md hover:bg-stone-900 transition-all duration-300 shadow-sm transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 focus-ring">
                                {t('common.saveChanges')}
                            </button>
                        </div>
                    </form>
                </CollapsibleSettingsSection>
            </div>
            <div className="bg-white dark:bg-stone-800 rounded-lg shadow-lg border border-stone-200 dark:border-stone-700">
                <CollapsibleSettingsSection title={t('settings.biometricTitle')} icon={Fingerprint}>
                    <div className="p-4">
                        <p className="text-sm text-stone-600 dark:text-stone-400 mb-4">{t('settings.biometricSubtitle')}</p>
                        {biometricStatus === 'unsupported' && <p className="text-sm text-stone-500 dark:text-stone-400">{t('settings.biometricUnsupported')}</p>}
                        {biometricStatus === 'not_registered' && (
                            <button onClick={handleRegisterBiometrics} className="inline-flex items-center bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-200 font-bold py-2 px-4 rounded-md text-sm hover:bg-stone-200 dark:hover:bg-stone-600 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 focus-ring">
                                <Fingerprint size={16} className="me-2"/>
                                {t('settings.biometricRegisterButton')}
                            </button>
                        )}
                        {biometricStatus === 'registered' && (
                            <div className="p-4 bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-800 rounded-md text-sm text-green-800 dark:text-green-200">
                                {t('settings.biometricRegistered')}
                            </div>
                        )}
                        {biometricError && <p className="text-red-500 text-sm mt-2">{biometricError}</p>}
                    </div>
                </CollapsibleSettingsSection>
            </div>
        </div>
    );
};

export default AdminSettings;