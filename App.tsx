
// FIX: The original file had duplicate and malformed imports for `React` and `aistudio`. These have been consolidated and corrected.
import React, { useState, createContext, useMemo, useEffect, useRef, useCallback, useContext } from 'react';
import { HashRouter, Routes, Route, NavLink, useLocation, useNavigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import AdminPage from './pages/AdminPage';
import WishlistPage from './pages/WishlistPage';
import GiftFinderPage from './pages/GiftFinderPage';
import VisualSearchPage from './pages/VisualSearchPage';
import CustomerGalleryPage from './pages/CustomerGalleryPage';
import DreamPiecePage from './pages/DreamPiecePage';
import ReelsPage from './pages/ReelsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import ConfirmationPage from './pages/ConfirmationPage';
import FindStorePage from './pages/FindStorePage';
import GoldPricePage from './pages/GoldPricePage';
import ContactPage from './pages/ContactPage';
import { Product, Review, Order, Story, ProductStyle, MoodTheme, UserActivityType, VipLevel, SiteAmbiance, CartItem, CustomThemeSettings, OrderStatus, PaymentSettings } from './types';
import { INITIAL_PRODUCTS, INITIAL_WELCOME_MESSAGE, INITIAL_ORDERS, DEFAULT_HERO_IMAGE, INITIAL_STORIES, DEFAULT_HERO_VIDEO, DEFAULT_THEME_SETTINGS, DEFAULT_PAYMENT_SETTINGS } from './constants';
import useLocalStorage from './hooks/useLocalStorage';
import { Heart, Lock, Shield, Gift, Search, Instagram, Twitter, Facebook, Wand2, Sun, Moon, Clapperboard, Volume2, VolumeX, Gem, Smile, ShoppingCart, MapPin, Bell, Menu, X, Mail, Send } from 'lucide-react';
import ShoppingAssistantButton from './components/ai/ShoppingAssistantButton';
import { I18nProvider, useI18n } from './i18n/I18nProvider';
import LanguageSwitcher from './components/LanguageSwitcher';
import { CurrencyProvider } from './contexts/CurrencyProvider';
import CurrencySwitcher from './components/CurrencySwitcher';
import ThemeMorphNotification from './components/ThemeMorphNotification';
import MoodSync from './components/ai/MoodSync';
import AIAvatarButton from './components/ai/AIAvatarButton';
import { useUserActivity } from './hooks/useUserActivity';
import { generateVipLevelUpMessage, getAmbianceTagline, generateTextureParameters } from './services/geminiService';
import { hexToRgba, adjustColor } from './utils/colorUtils';
import { ToastProvider, useToast } from './contexts/ToastContext';
import ToastContainer from './components/ToastContainer';
import ScrollToTop from './components/ScrollToTop';


type Theme = 'light' | 'dark';
type BrandTheme = 'silver' | 'gold';

const MUSIC_URL = 'https://storage.googleapis.com/ikara-testing/pensive-piano-110239.mp3';

interface AppContextType {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  reviews: Review[];
  setReviews: React.Dispatch<React.SetStateAction<Review[]>>;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  welcomeMessage: { title: string; subtitle: string; };
  setWelcomeMessage: React.Dispatch<React.SetStateAction<{ title: string; subtitle: string; }>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  theme: Theme;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
  heroImage: string;
  setHeroImage: React.Dispatch<React.SetStateAction<string>>;
  heroVideoUrl: string;
  setHeroVideoUrl: React.Dispatch<React.SetStateAction<string>>;
  stories: Story[];
  setStories: React.Dispatch<React.SetStateAction<Story[]>>;
  todayVisits: number;
  isSoundEnabled: boolean;
  toggleSound: () => void;
  playHoverSound: (force?: boolean) => void;
  addToCart: (product: Product, quantity?: number) => void;
  playHapticFeedback: (pattern?: number | number[]) => void;
  vipLevel: VipLevel;
  logoAnimationPlayed: boolean;
  setLogoAnimationPlayed: React.Dispatch<React.SetStateAction<boolean>>;
  styleTheme: ProductStyle;
  setStyleTheme: React.Dispatch<React.SetStateAction<ProductStyle>>;
  moodTheme: MoodTheme;
  setMoodTheme: React.Dispatch<React.SetStateAction<MoodTheme>>;
  trackActivity: (type: UserActivityType) => void;
  siteAmbiance: SiteAmbiance;
  ambianceTagline: string;
  vipMessage: string;
  cart: CartItem[];
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  customTheme: CustomThemeSettings;
  setCustomTheme: React.Dispatch<React.SetStateAction<CustomThemeSettings>>;
  brandTheme: BrandTheme;
  setBrandTheme: React.Dispatch<React.SetStateAction<BrandTheme>>;
  paymentSettings: PaymentSettings;
  setPaymentSettings: React.Dispatch<React.SetStateAction<PaymentSettings>>;
}

export const AppContext = createContext<AppContextType | null>(null);

const PageRoutes: React.FC = () => {
  const location = useLocation();
  return (
    <div key={location.pathname} className="animate-fade-in">
      <Routes location={location}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/confirmation" element={<ConfirmationPage />} />
        <Route path="/gift-finder" element={<GiftFinderPage />} />
        <Route path="/visual-search" element={<VisualSearchPage />} />
        <Route path="/gallery" element={<CustomerGalleryPage />} />
        <Route path="/dream-piece" element={<DreamPiecePage />} />
        <Route path="/reels" element={<ReelsPage />} />
        <Route path="/find-store" element={<FindStorePage />} />
        <Route path="/gold-price" element={<GoldPricePage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </div>
  );
};

const VipMusicPlayer: React.FC = () => {
    const context = useContext(AppContext);
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        
        if (context?.vipLevel !== 'None' && context?.isSoundEnabled) {
            audio.volume = 0.2; // Keep it subtle
            audio.play().catch(e => console.warn("Background music autoplay was prevented."));
        } else {
            audio.pause();
        }
    }, [context?.vipLevel, context?.isSoundEnabled]);

    return <audio ref={audioRef} src={MUSIC_URL} loop preload="auto" />;
};

const VipSignature: React.FC = () => {
    const { vipLevel } = useContext(AppContext)!;
    if (vipLevel === 'None') return null;

    return (
        <div className={`fixed bottom-4 right-4 z-50 text-sm italic pointer-events-none opacity-70 vip-signature rtl:right-auto rtl:left-4`}>
            Bayani Silver &mdash; {vipLevel} Member
        </div>
    );
};

const IntroAnimation: React.FC<{ onFinished: () => void }> = ({ onFinished }) => {
    useEffect(() => {
        const timer = setTimeout(onFinished, 4000);
        return () => clearTimeout(timer);
    }, [onFinished]);

    const particles = useMemo(() => Array.from({ length: 80 }).map(() => ({
        '--transform-start': `translate(${(Math.random() - 0.5) * 500}px, ${(Math.random() - 0.5) * 500}px) scale(${Math.random() * 1.5})`,
        animationDelay: `${Math.random() * 1.5}s`,
    })), []);

    return (
        <div className="intro-overlay">
            <div className="intro-particle-container">
                {particles.map((style, i) => (
                    <div key={i} className="particle" style={style as React.CSSProperties} />
                ))}
                <div className="intro-logo-final">
                    <svg width="100" height="100" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="22" fontWeight="bold" fill="currentColor" className="font-serif" dy=".1em">
                            BS
                        </text>
                    </svg>
                </div>
            </div>
        </div>
    );
};


const ThemedApp: React.FC = () => {
  const { language } = useI18n();
  const context = React.useContext(AppContext);
  const [textureParams, setTextureParams] = useState<{ baseFrequency: string; numOctaves: string; } | null>(null);

  useEffect(() => {
    const getTexture = async () => {
      const cachedParams = sessionStorage.getItem('bayani_texture_params');
      if (cachedParams) {
        setTextureParams(JSON.parse(cachedParams));
      } else {
        try {
          const params = await generateTextureParameters();
          setTextureParams(params);
          sessionStorage.setItem('bayani_texture_params', JSON.stringify(params));
        } catch (e) {
          console.error("Failed to generate texture, using default.", e);
        }
      }
    };
    getTexture();
  }, []);
  

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
    if (language === 'fa') {
      document.body.classList.add('font-fa');
    } else {
      document.body.classList.remove('font-fa');
    }
  }, [language]);
  
  useEffect(() => {
    const bodyClasses = document.body.classList;
    bodyClasses.remove('vip-bronze', 'vip-silver', 'vip-gold', 'theme-classic', 'theme-joyful', 'ambiance-calm', 'ambiance-energetic', 'ambiance-mysterious', 'ambiance-elegant', 'theme-gold');
    
    // Add new visual feature classes
    bodyClasses.add('glass-overlay', 'ai-texture-bg', 'ambient-light');

    if (context?.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    if (context?.brandTheme === 'gold') {
        bodyClasses.add('theme-gold');
    }

    if (context?.vipLevel && context.vipLevel !== 'None') {
        bodyClasses.add(`vip-${context.vipLevel.toLowerCase()}`);
    }
    if (context?.styleTheme === 'Classic') {
        bodyClasses.add('theme-classic');
    }
    if (context?.moodTheme === 'joyful') {
        bodyClasses.add('theme-joyful');
    }
    if (context?.siteAmbiance && context.siteAmbiance !== 'Default') {
        bodyClasses.add(`ambiance-${context.siteAmbiance.toLowerCase()}`);
    }
  }, [context?.theme, context?.vipLevel, context?.styleTheme, context?.moodTheme, context?.siteAmbiance, context?.brandTheme]);
  
   useEffect(() => {
    // Google Font Management
    const fontLinkId = 'custom-google-font';
    let link = document.getElementById(fontLinkId) as HTMLLinkElement;
    const fontUrl = context?.customTheme?.googleFontUrl;

    if (fontUrl) {
      if (!link) {
        link = document.createElement('link');
        link.id = fontLinkId;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }
      link.href = fontUrl;
    } else if (link) {
      link.remove();
    }
  }, [context?.customTheme?.googleFontUrl]);

  useEffect(() => {
    if (context?.customTheme) {
      const root = document.documentElement;
      const theme = { ...DEFAULT_THEME_SETTINGS, ...context.customTheme };

      // Set CSS Variables
      root.style.setProperty('--color-primary', theme.primaryColor);
      root.style.setProperty('--color-primary-dark', adjustColor(theme.primaryColor, -20));
      root.style.setProperty('--color-accent', theme.accentColor);
      root.style.setProperty('--color-glow', hexToRgba(theme.primaryColor, 0.3));
      root.style.setProperty('--bg-light', theme.bgColorLight);
      root.style.setProperty('--bg-dark', theme.bgColorDark);
      root.style.setProperty('--text-light', theme.textColorLight);
      root.style.setProperty('--text-dark', theme.textColorDark);
      root.style.setProperty('--link-light', theme.linkColorLight);
      root.style.setProperty('--link-dark', theme.linkColorDark);
      root.style.setProperty('--link-hover-light', theme.linkHoverColorLight);
      root.style.setProperty('--link-hover-dark', theme.linkHoverColorDark);
      root.style.setProperty('--border-light', theme.borderColorLight);
      root.style.setProperty('--border-dark', theme.borderColorDark);
      root.style.setProperty('--input-bg-light', theme.inputBgColorLight);
      root.style.setProperty('--input-bg-dark', theme.inputBgColorDark);
      root.style.setProperty('--input-border-color', theme.inputBorderColor);
      
      root.style.setProperty('--font-family-heading', theme.headingFontFamily);
      root.style.setProperty('--font-family-body', theme.bodyFontFamily);
      root.style.setProperty('--font-scale', theme.fontScale.toString());
      root.style.setProperty('--heading-font-weight', theme.headingWeight.toString());
      root.style.setProperty('--heading-letter-spacing', `${theme.headingLetterSpacing}em`);
      root.style.setProperty('--heading-text-transform', theme.headingTextTransform);
      root.style.setProperty('--body-font-weight', theme.bodyFontWeight.toString());
      root.style.setProperty('--body-line-height', theme.bodyLineHeight.toString());

      root.style.setProperty('--border-radius-base', `${theme.borderRadius}rem`);
      root.style.setProperty('--input-border-radius', `${theme.inputBorderRadius}rem`);
      root.style.setProperty('--btn-border-radius', { sharp: '0.125rem', rounded: '0.375rem', pill: '9999px' }[theme.buttonStyle]);
      root.style.setProperty('--header-height', `${theme.headerHeight}rem`);
      root.style.setProperty('--section-spacing-y', `${theme.sectionSpacingY}rem`);
      root.style.setProperty('--content-padding-x', `${theme.contentPaddingX}rem`);
      root.style.setProperty('--grid-gap', `${theme.gridGap}rem`);
      root.style.setProperty('--footer-padding-y', `${theme.footerPaddingY}rem`);

      root.style.setProperty('--btn-px', `${theme.buttonPaddingX}rem`);
      root.style.setProperty('--btn-py', `${theme.buttonPaddingY}rem`);
      root.style.setProperty('--btn-border-width', `${theme.buttonBorderWidth}px`);
      root.style.setProperty('--btn-text-transform', theme.buttonTextTransform);

      root.style.setProperty('--card-padding', `${theme.cardPadding}rem`);
      root.style.setProperty('--card-border-width', `${theme.cardBorderWidth}px`);
      
      root.style.setProperty('--animation-speed-factor', (1 / theme.animationIntensity).toString());
      root.style.setProperty('--shadow-opacity-factor', theme.shadowIntensity.toString());
      root.style.setProperty('--modal-overlay-opacity', theme.modalOverlayOpacity.toString());
      root.style.setProperty('--header-bg-opacity', theme.headerBgOpacity.toString());
      root.style.setProperty('--logo-size', `${theme.logoSize}rem`);
      
      // Set Body Classes
      const body = document.body;
      const classMap: { [key: string]: boolean } = {
        'theme-card-flat': theme.cardStyle === 'flat',
        'layout-wide': theme.siteWidth === 'wide',
        'layout-full': theme.siteWidth === 'full',
        'header-style-centered': theme.headerStyle === 'centered',
        'nav-style-background': theme.navLinkStyle === 'background',
        'font-pairing-lora-lato': theme.fontPairing === 'lora-lato',
        'font-pairing-cormorant-open': theme.fontPairing === 'cormorant-open',
        'btn-hover-lift': theme.buttonHoverEffect === 'lift',
        'btn-hover-glow': theme.buttonHoverEffect === 'glow',
        'btn-hover-shadow': theme.buttonHoverEffect === 'shadow',
        'btn-hover-darken': theme.buttonHoverEffect === 'darken',
        'card-hover-lift': theme.cardHoverEffect === 'lift',
        'card-hover-glow': theme.cardHoverEffect === 'glow',
        'card-hover-border': theme.cardHoverEffect === 'border',
        'card-aspect-square': theme.cardImageAspectRatio === 'square',
        'card-aspect-portrait': theme.cardImageAspectRatio === 'portrait',
        'card-aspect-landscape': theme.cardImageAspectRatio === 'landscape',
        'card-object-fit-cover': theme.cardImageObjectFit === 'cover',
        'card-object-fit-contain': theme.cardImageObjectFit === 'contain',
        'input-focus-ring': theme.inputFocusStyle === 'ring',
        'input-focus-border': theme.inputFocusStyle === 'border-accent',
        'page-transition-fade': theme.pageTransitionEffect === 'fade',
        'page-transition-slide-up': theme.pageTransitionEffect === 'slide-up',
        'scroll-anim-fade-up': theme.scrollAnimation === 'fade-up',
        'scroll-anim-slide-in': theme.scrollAnimation === 'slide-in',
        'header-sticky': theme.stickyHeader,
      };

      Object.keys(classMap).forEach(className => {
        body.classList.toggle(className, classMap[className]);
      });
    }
  }, [context?.customTheme]);


  return (
    <>
      <ScrollToTop />
      <ToastContainer />
      {textureParams && (
        <svg style={{ display: 'none', position: 'absolute' }}>
          <filter id="ai-texture">
            <feTurbulence 
              type="fractalNoise" 
              baseFrequency={textureParams.baseFrequency} 
              numOctaves={textureParams.numOctaves} 
              stitchTiles="stitch"
            />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.15"/>
            </feComponentTransfer>
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </svg>
      )}
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <PageRoutes />
        </main>
        <Footer />
        <ShoppingAssistantButton />
        <AIAvatarButton />
        <VipMusicPlayer />
        <VipSignature />
      </div>
    </>
  );
}

const App: React.FC = () => {
  const [products, setProducts] = useLocalStorage<Product[]>('bayani_products', INITIAL_PRODUCTS);
  const [isAuthenticated, setIsAuthenticated] = useLocalStorage<boolean>('bayani_auth', false);
  const [reviews, setReviews] = useLocalStorage<Review[]>('bayani_reviews', []);
  const [wishlist, setWishlist] = useLocalStorage<string[]>('bayani_wishlist', []);
  const [cart, setCart] = useLocalStorage<CartItem[]>('bayani_cart', []);
  const [welcomeMessage, setWelcomeMessage] = useLocalStorage<{ title: string; subtitle: string; }>('bayani_welcome', INITIAL_WELCOME_MESSAGE);
  const [orders, setOrders] = useLocalStorage<Order[]>('bayani_orders', INITIAL_ORDERS);
  const [theme, setTheme] = useLocalStorage<Theme>('bayani_theme', 'light');
  const [brandTheme, setBrandTheme] = useLocalStorage<BrandTheme>('bayani_brand_theme', 'silver');
  const [heroImage, setHeroImage] = useLocalStorage<string>('bayani_hero_image', DEFAULT_HERO_IMAGE);
  const [heroVideoUrl, setHeroVideoUrl] = useLocalStorage<string>('bayani_hero_video', DEFAULT_HERO_VIDEO);
  const [stories, setStories] = useLocalStorage<Story[]>('bayani_stories', INITIAL_STORIES);
  const [todayVisits, setTodayVisits] = useState(0);
  const [isSoundEnabled, setIsSoundEnabled] = useLocalStorage<boolean>('bayani_sound_enabled', true);
  const [logoAnimationPlayed, setLogoAnimationPlayed] = useState(sessionStorage.getItem('bayani_logo_anim') === 'true');
  const audioContextRef = useRef<AudioContext | null>(null);
  const [styleTheme, setStyleTheme] = useLocalStorage<ProductStyle>('bayani_style_theme', 'Modern');
  const [moodTheme, setMoodTheme] = useLocalStorage<MoodTheme>('bayani_mood_theme', 'default');
  const [siteAmbiance, setSiteAmbiance] = useLocalStorage<SiteAmbiance>('bayani_ambiance', 'Default');
  const [ambianceTagline, setAmbianceTagline] = useState('');
  const [customTheme, setCustomTheme] = useLocalStorage<CustomThemeSettings>('bayani_custom_theme', DEFAULT_THEME_SETTINGS);
  const [showIntro, setShowIntro] = useState(!sessionStorage.getItem('bayani_intro_played'));
  const [paymentSettings, setPaymentSettings] = useLocalStorage<PaymentSettings>('bayani_payment_settings_v2', DEFAULT_PAYMENT_SETTINGS);


  const { vipLevel, trackActivity } = useUserActivity();
  const [showVipNotification, setShowVipNotification] = useState<VipLevel | null>(null);
  const [vipMessage, setVipMessage] = useState('');
  const prevVipLevel = useRef(vipLevel);

  const [showThemeNotification, setShowThemeNotification] = useState<ProductStyle | null>(null);
  const prevStyleTheme = useRef(styleTheme);
  
  const [showMoodNotification, setShowMoodNotification] = useState(false);
  const prevMoodTheme = useRef(moodTheme);
  
  // Use Toast Hook (Needs wrapper, so this logic needs to be inside ThemedApp or we need to wrap AppContent)
  // Refactoring structure slightly to allow useToast inside App logic if needed, but for now passing context is fine.
  
  // Effect for time-based shadows and ambient light
  useEffect(() => {
    const updateTimeBasedEffects = () => {
      const hour = new Date().getHours();
      const root = document.documentElement;

      // Dynamic Shadows
      let x = 0, y = 0, blur = 0, opacity = 0;
      if (hour >= 5 && hour < 19) {
        const progress = (hour - 5) / 14;
        const angle = (progress * Math.PI) - (Math.PI / 2);
        const length = 10 + Math.abs(Math.cos(angle)) * 8; 
        x = Math.sin(angle) * length * -1;
        y = (1 - Math.cos(angle)) * (length / 2) + 4;
        blur = 12 + Math.abs(Math.cos(angle)) * 10;
        opacity = 0.08 + (1 - Math.abs(Math.cos(angle))) * 0.07;
      } else {
        opacity = 0.04; blur = 25; y = 6;
      }
      root.style.setProperty('--dynamic-shadow-x', `${x.toFixed(2)}px`);
      root.style.setProperty('--dynamic-shadow-y', `${y.toFixed(2)}px`);
      root.style.setProperty('--dynamic-shadow-blur', `${blur.toFixed(2)}px`);
      root.style.setProperty('--dynamic-shadow-opacity', opacity.toFixed(2));
      
      // Ambient Light
      const warm = { r: 255, g: 215, b: 0, a: 0.05 };
      const cool = { r: 100, g: 100, b: 220, a: 0.08 };
      let ambientColor = `rgba(${warm.r}, ${warm.g}, ${warm.b}, ${warm.a})`;
      
      if (hour < 5 || hour >= 20) { // Night
        ambientColor = `rgba(${cool.r}, ${cool.g}, ${cool.b}, ${cool.a})`;
      } else if (hour >= 5 && hour < 8) { // Sunrise
        const p = (hour - 5) / 3;
        const r = cool.r + (warm.r - cool.r) * p;
        const g = cool.g + (warm.g - cool.g) * p;
        const b = cool.b + (warm.b - cool.b) * p;
        const a = cool.a + (warm.a - cool.a) * p;
        ambientColor = `rgba(${r.toFixed(0)}, ${g.toFixed(0)}, ${b.toFixed(0)}, ${a.toFixed(2)})`;
      } else if (hour >= 17 && hour < 20) { // Sunset
        const p = (hour - 17) / 3;
        const r = warm.r + (cool.r - warm.r) * p;
        const g = warm.g + (cool.g - warm.g) * p;
        const b = warm.b + (cool.b - warm.b) * p;
        const a = warm.a + (cool.a - warm.a) * p;
        ambientColor = `rgba(${r.toFixed(0)}, ${g.toFixed(0)}, ${b.toFixed(0)}, ${a.toFixed(2)})`;
      }
      root.style.setProperty('--ambient-light-color', ambientColor);
    };
    
    updateTimeBasedEffects();
    const interval = setInterval(updateTimeBasedEffects, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Effect for Motion Blur on scroll
  useEffect(() => {
    let scrollTimeout: number;
    let lastScrollY = window.scrollY;
    let isThrottled = false;
    const SCROLL_SPEED_THRESHOLD = 30; // pixels per frame

    const handleScroll = () => {
        if (isThrottled) return;
        isThrottled = true;
        setTimeout(() => { isThrottled = false; }, 100);

        const currentScrollY = window.scrollY;
        const scrollSpeed = Math.abs(currentScrollY - lastScrollY);
        
        if (scrollSpeed > SCROLL_SPEED_THRESHOLD) {
            document.body.classList.add('motion-blur-active');
            clearTimeout(scrollTimeout);
            scrollTimeout = window.setTimeout(() => {
                document.body.classList.remove('motion-blur-active');
            }, 200);
        }
        lastScrollY = currentScrollY;
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
        window.removeEventListener('scroll', handleScroll);
        clearTimeout(scrollTimeout);
    };
  }, []);

  useEffect(() => {
    const setAmbiance = async () => {
        const sessionAmbiance = sessionStorage.getItem('bayani_session_ambiance');
        let currentAmbiance: SiteAmbiance;
        if (!sessionAmbiance) {
            const ambiences: SiteAmbiance[] = ['Calm', 'Energetic', 'Mysterious', 'Elegant'];
            currentAmbiance = ambiences[Math.floor(Math.random() * ambiences.length)];
            setSiteAmbiance(currentAmbiance);
            sessionStorage.setItem('bayani_session_ambiance', currentAmbiance);
        } else {
            currentAmbiance = sessionAmbiance as SiteAmbiance;
            setSiteAmbiance(currentAmbiance);
        }
        
        try {
            const tagline = await getAmbianceTagline(currentAmbiance);
            setAmbianceTagline(tagline);
        } catch (e) { console.error("Failed to get ambiance tagline:", e); }
    };
    setAmbiance();
  }, [setSiteAmbiance]);

  useEffect(() => {
    if (prevStyleTheme.current !== styleTheme) {
      setShowThemeNotification(styleTheme);
      const timer = setTimeout(() => setShowThemeNotification(null), 4000);
      prevStyleTheme.current = styleTheme;
      return () => clearTimeout(timer);
    }
  }, [styleTheme]);

  useEffect(() => {
    if (prevMoodTheme.current !== moodTheme && moodTheme !== 'default') {
      setShowMoodNotification(true);
      const timer = setTimeout(() => setShowMoodNotification(false), 4000);
      prevMoodTheme.current = moodTheme;
      return () => clearTimeout(timer);
    }
  }, [moodTheme]);

  const playVipSound = useCallback(() => {
    if (!isSoundEnabled || !audioContextRef.current) return;
    const audioContext = audioContextRef.current;
    
    const now = audioContext.currentTime;
    const gainNode = audioContext.createGain();
    gainNode.connect(audioContext.destination);
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.1, now + 0.01);

    const osc1 = audioContext.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(440.00, now); // A4
    osc1.connect(gainNode);
    osc1.start(now);
    osc1.stop(now + 0.15);

    const osc2 = audioContext.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.00, now + 0.15); // A5
    osc2.connect(gainNode);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.4);

    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
  }, [isSoundEnabled]);

  useEffect(() => {
    if (vipLevel !== 'None' && prevVipLevel.current !== vipLevel) {
      const showNotification = async () => {
        try {
          const message = await generateVipLevelUpMessage(vipLevel);
          setVipMessage(message);
          setShowVipNotification(vipLevel);
          playVipSound();
          const timer = setTimeout(() => setShowVipNotification(null), 5000);
          prevVipLevel.current = vipLevel;
          return () => clearTimeout(timer);
        } catch (e) {
          console.error("Failed to show VIP notification", e);
        }
      };
      showNotification();
    }
  }, [vipLevel, playVipSound]);


  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    let visitDataStr = localStorage.getItem('bayani_visit_data');
    let visitData = visitDataStr ? JSON.parse(visitDataStr) : {};

    if (visitData.lastVisitDate !== today) {
        visitData = { todayVisits: 1, lastVisitDate: today };
    } else {
        if (!sessionStorage.getItem('bayani_session_visited')) {
             visitData.todayVisits = (visitData.todayVisits || 0) + 1;
        }
    }
    sessionStorage.setItem('bayani_session_visited', 'true');
    localStorage.setItem('bayani_visit_data', JSON.stringify(visitData));
    setTodayVisits(visitData.todayVisits);
  }, []);
  
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {
        console.error("Web Audio API is not supported in this browser");
      }
    }
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  }, []);

  useEffect(() => {
    const initOnInteraction = () => {
        initAudioContext();
        window.removeEventListener('click', initOnInteraction);
        window.removeEventListener('keydown', initOnInteraction);
    };
    window.addEventListener('click', initOnInteraction);
    window.addEventListener('keydown', initOnInteraction);
    return () => {
        window.removeEventListener('click', initOnInteraction);
        window.removeEventListener('keydown', initOnInteraction);
    };
  }, [initAudioContext]);

  const playHapticFeedback = useCallback((pattern: number | number[] = 50) => {
    if (navigator.vibrate) {
        navigator.vibrate(pattern);
    }
  }, []);
  
  const playHoverSound = useCallback((force = false) => {
    if ((!isSoundEnabled && !force) || !audioContextRef.current) return;
    const audioContext = audioContextRef.current;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.2);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  }, [isSoundEnabled]);

  const playAddToCartSound = useCallback(() => {
    trackActivity('cart');
    playHapticFeedback(); // Default short vibration
    if (!isSoundEnabled || !audioContextRef.current) return;
    const audioContext = audioContextRef.current;
    
    const now = audioContext.currentTime;

    // Panner for spatialization
    const panner = audioContext.createPanner();
    panner.panningModel = 'HRTF';
    panner.positionX.setValueAtTime(1.5, now); // To the right
    panner.positionY.setValueAtTime(0, now);
    panner.positionZ.setValueAtTime(0, now);
    panner.connect(audioContext.destination);

    // Gain for volume envelope (decay)
    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.2, now + 0.01); // Quick attack
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.3); // Metallic decay
    gainNode.connect(panner);
    
    // Oscillator for the "clink" sound
    const osc = audioContext.createOscillator();
    osc.type = 'triangle'; // Triangle wave for a more metallic sound
    osc.frequency.setValueAtTime(1500, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.2); // Pitch fall
    osc.connect(gainNode);

    osc.start(now);
    osc.stop(now + 0.3);
  }, [isSoundEnabled, playHapticFeedback, trackActivity]);
  
  const toggleSound = () => {
      initAudioContext();
      const willBeEnabled = !isSoundEnabled;
      setIsSoundEnabled(willBeEnabled);
      if (willBeEnabled) {
          playHoverSound(true);
      }
  };

  const login = () => setIsAuthenticated(true);
  const logout = () => setIsAuthenticated(false);

  const toggleWishlist = (productId: string) => {
    playHapticFeedback();
    const isAdding = !wishlist.includes(productId);
    if (isAdding) {
        trackActivity('wishlist');
    }
    setWishlist(prev =>
      isAdding
        ? [...prev, productId]
        : prev.filter(id => id !== productId)
    );
    
    // Play sound effect for adding to wishlist
    if (isAdding && isSoundEnabled && audioContextRef.current) {
        const audioContext = audioContextRef.current;
        const now = audioContext.currentTime;

        const panner = audioContext.createPanner();
        panner.panningModel = 'HRTF';
        panner.positionX.setValueAtTime(-1.5, now); // To the left
        panner.connect(audioContext.destination);

        const gainNode = audioContext.createGain();
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.1, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
        gainNode.connect(panner);
        
        // Main chime
        const osc1 = audioContext.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(1200, now);
        osc1.connect(gainNode);
        
        // Shimmering harmonic
        const osc2 = audioContext.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1800, now);
        osc2.connect(gainNode);

        osc1.start(now);
        osc1.stop(now + 0.5);
        osc2.start(now);
        osc2.stop(now + 0.5);
    }
  };
  
  // We need to inject the addToast function into addToCart, but addToast comes from the hook inside the provider.
  // Since App wraps ThemedApp, and ToastProvider wraps ThemedApp, we can't easily use the hook inside App.
  // Ideally, the cart logic should be its own provider or hook inside the ToastProvider.
  // For this fix, I'll allow ThemedApp to access the toast context and pass a callback to AppContext if I refactor, 
  // OR simpler: I will trigger the toast inside the components that call addToCart, OR I will move the ToastProvider UP.
  
  // Refactoring Plan: Wrap `App` content in `ToastProvider`. 
  // But `App` defines the `AppContext`. 
  // Best approach: Use `ToastProvider` inside `App`'s return, wrapping `I18nProvider`.
  // Then inside `ThemedApp`, we can use `useToast`.
  // However, `addToCart` is defined in `App`. 
  // Solution: I will create a `CartProvider`? No, simpler to just dispatch a custom event or allow `addToCart` to accept a callback?
  // Let's make `addToCart` trigger a custom event that `ThemedApp` listens to.
  
  const addToCart = (product: Product, quantity = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prevCart, { ...product, quantity }];
    });
    playAddToCartSound();
    window.dispatchEvent(new CustomEvent('cart-updated', { detail: { message: `Added ${product.name} to cart` } }));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      ).filter(item => item.quantity > 0) // Remove if quantity is 0
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };
  
  const clearCart = () => {
    setCart([]);
  };

  const contextValue = useMemo(() => ({
    products,
    setProducts,
    isAuthenticated,
    login,
    logout,
    reviews,
    setReviews,
    wishlist,
    toggleWishlist,
    welcomeMessage,
    setWelcomeMessage,
    orders,
    setOrders,
    theme,
    setTheme,
    heroImage,
    setHeroImage,
    heroVideoUrl,
    setHeroVideoUrl,
    stories,
    setStories,
    todayVisits,
    isSoundEnabled,
    toggleSound,
    playHoverSound,
    addToCart,
    playHapticFeedback,
    vipLevel,
    logoAnimationPlayed,
    setLogoAnimationPlayed,
    styleTheme,
    setStyleTheme,
    moodTheme,
    setMoodTheme,
    trackActivity,
    siteAmbiance,
    ambianceTagline,
    vipMessage,
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    customTheme,
    setCustomTheme,
    brandTheme,
    setBrandTheme,
    paymentSettings,
    setPaymentSettings,
  }), [products, isAuthenticated, reviews, wishlist, cart, welcomeMessage, orders, theme, heroImage, heroVideoUrl, stories, todayVisits, isSoundEnabled, vipLevel, logoAnimationPlayed, styleTheme, moodTheme, trackActivity, siteAmbiance, ambianceTagline, vipMessage, playHoverSound, playHapticFeedback, toggleSound, addToCart, customTheme, setCustomTheme, toggleWishlist, brandTheme, setBrandTheme, paymentSettings, setPaymentSettings]);

  return (
    <AppContext.Provider value={contextValue}>
      <ToastProvider>
        <I18nProvider>
            <CurrencyProvider>
                <HashRouter>
                    {showIntro && <IntroAnimation onFinished={() => {
                        setShowIntro(false);
                        sessionStorage.setItem('bayani_intro_played', 'true');
                    }} />}
                    <ToastListener />
                    <ThemedApp />
                    {showThemeNotification && <ThemeMorphNotification theme={showThemeNotification} />}
                    {showMoodNotification && moodTheme === 'joyful' && <ThemeMorphNotification theme="Joyful" />}
                    {showVipNotification && showVipNotification !== 'None' && <ThemeMorphNotification theme={`Vip${showVipNotification}`} message={vipMessage} />}
                </HashRouter>
            </CurrencyProvider>
        </I18nProvider>
      </ToastProvider>
    </AppContext.Provider>
  );
};

// Helper component to listen to cart events and trigger toasts
const ToastListener = () => {
    const { addToast } = useToast();
    useEffect(() => {
        const handleCartUpdate = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            addToast(detail.message, 'success');
        };
        window.addEventListener('cart-updated', handleCartUpdate);
        return () => window.removeEventListener('cart-updated', handleCartUpdate);
    }, [addToast]);
    return null;
}

interface NotificationIconProps {
  to: string;
  'aria-label': string;
  count: number;
  children: React.ReactNode;
}

const NotificationIcon: React.FC<NotificationIconProps> = ({ to, 'aria-label': ariaLabel, count, children }) => {
    return (
        <NavLink to={to} className="p-2 relative rounded-full text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100 transition-all focus-ring" aria-label={ariaLabel}>
            {children}
            {count > 0 && (
                <div
                    key={count}
                    className="absolute top-0 right-0 bg-red-600 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold animate-fade-in"
                    style={{ transform: 'translate(40%, -40%)' }}
                >
                    {count > 9 ? '9+' : count}
                </div>
            )}
        </NavLink>
    );
};

const SoundToggle: React.FC = () => {
    const context = React.useContext(AppContext);
    if (!context) return null;

    const { isSoundEnabled, toggleSound } = context;

    return (
        <button
            onClick={toggleSound}
            className="p-2 rounded-full text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100 transition-all focus-ring"
            aria-label={`Turn sound ${isSoundEnabled ? 'off' : 'on'}`}
        >
            <div className="relative w-5 h-5">
                <Volume2 size={20} className={`absolute transition-all duration-300 ${isSoundEnabled ? 'opacity-100 transform scale-100' : 'opacity-0 transform scale-0'}`} />
                <VolumeX size={20} className={`absolute transition-all duration-300 ${!isSoundEnabled ? 'opacity-100 transform scale-100' : 'opacity-0 transform scale-0'}`} />
            </div>
        </button>
    );
};

const BrandThemeSwitcher: React.FC = () => {
    const context = React.useContext(AppContext);
    if (!context) return null;

    const { brandTheme, setBrandTheme } = context;
    
    const toggleTheme = () => {
        setBrandTheme(brandTheme === 'silver' ? 'gold' : 'silver');
        context.playHoverSound(true);
    };

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100 transition-all focus-ring"
            aria-label={`Switch to ${brandTheme === 'silver' ? 'gold' : 'silver'} theme`}
        >
            <div className="relative w-5 h-5 flex items-center justify-center">
                <Gem size={20} className={`absolute transition-all duration-500 ease-in-out ${brandTheme === 'silver' ? 'opacity-100 text-slate-400 transform scale-100 rotate-0' : 'opacity-0 transform scale-50 rotate-90'}`} />
                <Gem size={20} className={`absolute transition-all duration-500 ease-in-out ${brandTheme === 'gold' ? 'opacity-100 text-amber-400 transform scale-100 rotate-0' : 'opacity-0 transform scale-50 -rotate-90'}`} />
            </div>
        </button>
    );
};

const ThemeSwitcher: React.FC = () => {
    const context = React.useContext(AppContext);
    if (!context) return null;

    const { theme, setTheme } = context;
    
    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100 transition-all focus-ring"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            <div className="relative w-5 h-5 overflow-hidden">
                <Sun size={20} className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-in-out ${theme === 'light' ? 'opacity-100 transform scale-100 rotate-0' : 'opacity-0 transform scale-50 -rotate-90'}`} />
                <Moon size={20} className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-in-out ${theme === 'dark' ? 'opacity-100 transform scale-100 rotate-0' : 'opacity-0 transform scale-50 rotate-90'}`} />
            </div>
        </button>
    );
};

const Header: React.FC = () => {
  const context = React.useContext(AppContext);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useI18n();

  const wishlistItemCount = context?.wishlist.length || 0;
  const cartItemCount = context?.cart.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const pendingOrdersCount = useMemo(() => context?.orders.filter(o => o.status === OrderStatus.Pending).length || 0, [context?.orders]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (context && !context.logoAnimationPlayed) {
        setTimeout(() => {
            context.setLogoAnimationPlayed(true);
            sessionStorage.setItem('bayani_logo_anim', 'true');
        }, 1400); // Animation duration
    }
  }, [context]);


  const activeLinkStyle = { color: 'var(--color-gold-dark)' };
  const getLinkClass = "text-stone-600 dark:text-stone-300 hover:text-[--color-gold-dark] transition-colors pb-2 focus-ring rounded-sm nav-link-underline";
  
  const VipBadge = () => {
    if (!context || context.vipLevel === 'None') return null;
    const levelInfo = {
        Bronze: { title: 'VIP Bronze Member', color: 'text-yellow-600' },
        Silver: { title: 'VIP Silver Member', color: 'text-slate-400' },
        Gold: { title: 'VIP Gold Member', color: 'text-amber-400' }
    }[context.vipLevel];

    return <Gem size={20} className={`vip-header-gem ${levelInfo.color}`}><title>{levelInfo.title}</title></Gem>;
  };

  const navLinks = [
      { to: "/", label: t('header.home'), icon: null },
      { to: "/products", label: t('header.shop'), icon: null },
      { to: "/reels", label: t('header.reels'), icon: Clapperboard },
      { to: "/gift-finder", label: t('header.giftFinder'), icon: Gift },
      { to: "/dream-piece", label: t('header.dreamPiece'), icon: Wand2 },
      { to: "/visual-search", label: t('header.visualSearch'), icon: Search },
      { to: "/find-store", label: t('header.findStore'), icon: MapPin },
  ];

  return (
    <header className={`bg-white/80 dark:bg-stone-900/80 backdrop-blur-lg top-0 z-50 transition-all duration-300 ${isScrolled ? 'shadow-md dark:shadow-black/20' : 'shadow-sm dark:shadow-black/10'}`}>
      <nav className={`container mx-auto px-6 flex items-center justify-between transition-all duration-300 relative nav-container ${isScrolled ? 'py-3' : 'py-5'}`}>
        
        {/* Left Side: Mobile Menu Button (lg:hidden) */}
        <div className="lg:hidden flex items-center">
            <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 -ml-2 rounded-md text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors focus-ring"
                aria-label="Toggle menu"
            >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
        </div>

        {/* Center/Left: Logo */}
        <NavLink to="/" className={`group inline-flex items-center gap-3 text-3xl font-bold font-serif text-stone-700 dark:text-stone-200 tracking-wider focus-ring rounded-sm nav-logo breathing-effect ${!context?.logoAnimationPlayed ? 'animate-logo-shine' : ''}`}>
           <svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" className="header-logo-icon text-stone-700 dark:text-stone-200 group-hover:text-[--color-gold-dark] transition-colors duration-300">
              <text
                x="50%"
                y="50%"
                dominantBaseline="middle"
                textAnchor="middle"
                fontSize="22"
                fontWeight="bold"
                fill="currentColor"
                className="font-serif"
                dy=".1em"
              >
                BS
              </text>
            </svg>
          <span className="hidden sm:inline-block golden-shimmer-text">Bayani Silver</span>
        </NavLink>

        {/* Center: Desktop Links */}
        <div className="hidden lg:flex items-center space-x-2 md:space-x-4 nav-links mx-4">
            {navLinks.map(link => (
                <NavLink 
                    key={link.to} 
                    to={link.to} 
                    className={getLinkClass} 
                    style={({ isActive }) => isActive ? activeLinkStyle : {}}
                    title={link.label}
                >
                    {link.icon && <link.icon size={20} className="md:hidden lg:hidden xl:hidden" />} {/* Hide icon on large screens if text fits, show on tablet if needed */}
                    <span className="hidden md:inline">{link.label}</span>
                </NavLink>
            ))}
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center space-x-1 nav-actions">
            <VipBadge />
            {context?.isAuthenticated && (
                <NotificationIcon to="/admin" aria-label={t('header.notifications')} count={pendingOrdersCount}>
                    <Bell size={20} />
                </NotificationIcon>
            )}
            <div className="hidden sm:flex items-center space-x-1">
                <BrandThemeSwitcher />
                <ThemeSwitcher />
                <SoundToggle />
                <LanguageSwitcher />
                <CurrencySwitcher />
            </div>
            <NotificationIcon to="/wishlist" aria-label={t('header.wishlistAria')} count={wishlistItemCount}>
                <Heart size={20} />
            </NotificationIcon>
            <NotificationIcon to="/cart" aria-label={t('header.cartAria')} count={cartItemCount}>
                <ShoppingCart size={20} />
            </NotificationIcon>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      <div className={`lg:hidden absolute top-full left-0 right-0 bg-white dark:bg-stone-900 border-t dark:border-stone-800 shadow-xl transition-all duration-300 ease-in-out overflow-hidden ${isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="container mx-auto px-6 py-4 flex flex-col space-y-4">
              {navLinks.map(link => (
                  <NavLink 
                      key={link.to} 
                      to={link.to} 
                      className="text-lg font-medium text-stone-700 dark:text-stone-300 hover:text-[--color-gold-dark] py-2 border-b border-stone-100 dark:border-stone-800 last:border-0 flex items-center gap-3"
                      onClick={() => setIsMobileMenuOpen(false)}
                      style={({ isActive }) => isActive ? activeLinkStyle : {}}
                  >
                      {link.icon && <link.icon size={20} />}
                      {link.label}
                  </NavLink>
              ))}
              <div className="flex flex-wrap gap-4 pt-4 border-t border-stone-200 dark:border-stone-700 justify-center">
                  <BrandThemeSwitcher />
                  <ThemeSwitcher />
                  <SoundToggle />
                  <LanguageSwitcher />
                  <CurrencySwitcher />
              </div>
          </div>
      </div>
    </header>
  );
};

const Footer: React.FC = () => {
  const { t } = useI18n();
  const navLinks = [
    { to: '/products', label: t('footer.shop') },
    { to: '/gallery', label: t('footer.gallery') },
    { to: '/dream-piece', label: t('footer.dreamPiece') },
    { to: '/find-store', label: t('footer.findStore') },
    { to: '/gold-price', label: t('footer.goldPrice') },
  ];
  const legalLinks = [
    { to: '#', label: t('footer.privacy') },
    { to: '#', label: t('footer.terms') },
    { to: '#', label: t('footer.shipping') },
    { to: '/admin', label: t('footer.admin') },
    { to: '/contact', label: t('footer.contactUs') },
  ];
  
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
      e.preventDefault();
      if(email) {
          setSubscribed(true);
          setEmail('');
          setTimeout(() => setSubscribed(false), 3000);
      }
  };

  return (
    <footer className="bg-stone-100 dark:bg-stone-900/50 border-t border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="col-span-1">
            <h3 className="text-xl font-serif font-semibold text-stone-800 dark:text-stone-200 mb-4">Bayani Silver</h3>
            <p className="text-sm mb-6">{t('footer.tagline')}</p>
            
            {/* Newsletter Section */}
            <div className="bg-white dark:bg-stone-800 p-4 rounded-lg shadow-sm border border-stone-200 dark:border-stone-700">
                <h4 className="text-sm font-semibold text-stone-800 dark:text-stone-200 mb-2 flex items-center gap-2">
                    <Mail size={16} /> Newsletter
                </h4>
                {subscribed ? (
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium">Thank you for subscribing!</p>
                ) : (
                    <form onSubmit={handleSubscribe} className="flex gap-2">
                        <input 
                            type="email" 
                            placeholder="Your email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="flex-1 text-xs px-2 py-1.5 rounded border border-stone-300 dark:border-stone-600 dark:bg-stone-900 focus:outline-none focus:border-[--color-gold]"
                            required
                        />
                        <button type="submit" className="bg-stone-800 text-white p-1.5 rounded hover:bg-stone-900 transition-colors">
                            <Send size={14} />
                        </button>
                    </form>
                )}
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-stone-700 dark:text-stone-300 mb-4">{t('footer.explore')}</h4>
            <ul className="space-y-2">
              {navLinks.map(link => (
                <li key={link.to}><NavLink to={link.to} className="text-sm hover:text-stone-900 dark:hover:text-stone-100 transition-colors focus-ring rounded-sm">{link.label}</NavLink></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-stone-700 dark:text-stone-300 mb-4">{t('footer.support')}</h4>
            <ul className="space-y-2">
              {legalLinks.map(link => (
                <li key={link.label}><NavLink to={link.to} className="text-sm hover:text-stone-900 dark:hover:text-stone-100 transition-colors focus-ring rounded-sm">{link.label}</NavLink></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-stone-700 dark:text-stone-300 mb-4">{t('footer.follow')}</h4>
            <div className="flex space-x-4">
              <a href="https://instagram.com/bayani_jewelry" target="_blank" rel="noopener noreferrer" className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors focus-ring rounded-full p-1"><Instagram size={20} /></a>
              <a href="#" className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors focus-ring rounded-full p-1"><Twitter size={20} /></a>
              <a href="#" className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors focus-ring rounded-full p-1"><Facebook size={20} /></a>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-stone-200 dark:border-stone-700 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Bayani Silver. {t('footer.rights')}</p>
        </div>
      </div>
    </footer>
  );
};

export default App;
