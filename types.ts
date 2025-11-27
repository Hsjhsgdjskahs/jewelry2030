
export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrls: string[];
  videoUrl?: string;
  modelUrl?: string; // URL for 3D model (.glb/.gltf)
  category: string;
  metaDescription: string;
  isEngravable?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  rating: number; // 1-5
  comment: string;
  date: string; // ISO string
}

export enum OrderStatus {
  Pending = 'Pending',
  Shipped = 'Shipped',
  Delivered = 'Delivered',
  Cancelled = 'Cancelled'
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerName: string;
  date: string; // ISO string
  items: OrderItem[];
  total: number;
  status: OrderStatus;
}

export interface ReviewSummary {
  summary: string;
  pros: string[];
  cons: string[];
}

export interface SocialMediaPost {
    post: string;
    hashtags: string;
}

export interface CustomerPersona {
    name: string;
    description: string;
    topCategories: string[];
}

export interface FAQ {
    question: string;
    answer: string;
}

export interface Story {
  id: string;
  productId: string;
  imageUrl: string;
  previewImageUrl: string;
  title: string;
  productName: string;
}

export type ProductStyle = 'Classic' | 'Modern' | 'Minimalist';

export type UserEmotion = 'Happy' | 'Sad' | 'Neutral' | 'Surprised' | 'Angry';
export type MoodTheme = 'default' | 'joyful';

export type VipLevel = 'None' | 'Bronze' | 'Silver' | 'Gold';

export type SiteAmbiance = 'Default' | 'Calm' | 'Energetic' | 'Mysterious' | 'Elegant';

export type NotificationTheme = ProductStyle | 'Joyful' | 'VIP' | 'VipBronze' | 'VipSilver' | 'VipGold';
export type UserActivityType = 'view' | 'wishlist' | 'cart';

export type FontPairing = 'default' | 'lora-lato' | 'cormorant-open';

export type ButtonStyle = 'rounded' | 'pill' | 'sharp';
export type CardStyle = 'glow' | 'flat';

export type SiteWidth = 'standard' | 'wide' | 'full';
export type HeaderStyle = 'standard' | 'centered';
export type NavLinkStyle = 'underline' | 'background';

// --- NEW THEME TYPES ---
export type ButtonHoverEffect = 'lift' | 'glow' | 'shadow' | 'darken';
export type TextTransform = 'none' | 'uppercase' | 'capitalize';
export type CardHoverEffect = 'lift' | 'glow' | 'border';
export type CardImageAspectRatio = 'square' | 'portrait' | 'landscape';
export type InputFocusStyle = 'ring' | 'border-accent';
export type PageTransitionEffect = 'none' | 'fade' | 'slide-up';
export type ScrollAnimation = 'none' | 'fade-up' | 'slide-in';


export interface CustomThemeSettings {
  // --- EXISTING from previous "10 new features" ---
  primaryColor: string;
  accentColor: string;
  bgColorLight: string;
  bgColorDark: string;
  fontPairing: FontPairing;
  fontScale: number;
  headingWeight: number;
  headingLetterSpacing: number;
  borderRadius: number;
  buttonStyle: ButtonStyle;
  cardStyle: CardStyle;
  siteWidth: SiteWidth;
  headerStyle: HeaderStyle;
  navLinkStyle: NavLinkStyle;
  animationIntensity: number;
  shadowIntensity: number;

  // --- NEW FEATURES (40+) ---

  // Colors
  textColorLight: string;
  textColorDark: string;
  linkColorLight: string;
  linkColorDark: string;
  linkHoverColorLight: string;
  linkHoverColorDark: string;
  borderColorLight: string;
  borderColorDark: string;
  
  // Typography
  googleFontUrl: string;
  headingFontFamily: string;
  bodyFontFamily: string;
  bodyLineHeight: number;
  bodyFontWeight: number;
  headingTextTransform: TextTransform;

  // Layout & Spacing
  headerHeight: number; // in rem
  sectionSpacingY: number; // in rem
  contentPaddingX: number; // in rem
  gridGap: number; // in rem
  footerPaddingY: number; // in rem

  // Buttons
  buttonPaddingX: number; // in rem
  buttonPaddingY: number; // in rem
  buttonBorderWidth: number; // in px
  buttonHoverEffect: ButtonHoverEffect;
  buttonTextTransform: TextTransform;

  // Cards
  cardPadding: number; // in rem
  cardBorderWidth: number; // in px
  cardHoverEffect: CardHoverEffect;
  cardImageAspectRatio: CardImageAspectRatio;
  cardImageObjectFit: 'cover' | 'contain';

  // Forms & Inputs
  inputBgColorLight: string;
  inputBgColorDark: string;
  inputBorderColor: string;
  inputFocusStyle: InputFocusStyle;
  inputBorderRadius: number; // in rem

  // Animations & Effects
  pageTransitionEffect: PageTransitionEffect;
  scrollAnimation: ScrollAnimation;
  modalOverlayOpacity: number; // 0 to 1

  // Header
  stickyHeader: boolean;
  headerBgOpacity: number; // 0 to 1
  logoSize: number; // in rem
}

export interface CryptoWalletConfig {
    id: string; // Unique ID (e.g., 'bitcoin', 'ethereum', 'tether-trc20')
    name: string; // Display Name
    symbol: string; // BTC, ETH
    network: string; // ERC20, TRC20, Bitcoin, etc.
    address: string;
    enabled: boolean;
    priceId: string; // CoinGecko API ID (e.g., 'bitcoin', 'tether')
    icon?: string; // Optional icon override
}

export interface PaymentSettings {
    enableCrypto: boolean;
    enableZarinpal: boolean;
    zarinpalMerchantId: string;
    cryptoWallets: CryptoWalletConfig[];
}
