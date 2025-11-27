
import { Product, Order, OrderStatus, Story, CustomThemeSettings, PaymentSettings } from './types';

export const IRT_EXCHANGE_RATE = 58000; // 1 USD = 58,000 Toman

export const DEFAULT_HERO_IMAGE = 'https://images.pexels.com/photos/12833535/pexels-photo-12833535.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';
export const DEFAULT_HERO_VIDEO = 'https://videos.pexels.com/video-files/4784091/4784091-hd_1920_1080_25fps.mp4';

export const DEFAULT_THEME_SETTINGS: CustomThemeSettings = {
  // Existing
  primaryColor: '#d4af37',
  accentColor: '#57534e', // stone-600
  bgColorLight: '#fafaf9', // stone-50
  bgColorDark: '#1c1917', // stone-900
  fontPairing: 'default',
  borderRadius: 0.375, // rem, corresponds to Tailwind's rounded-md
  buttonStyle: 'rounded',
  cardStyle: 'glow',
  fontScale: 1,
  headingWeight: 600,
  headingLetterSpacing: 0.03,
  siteWidth: 'standard',
  headerStyle: 'standard',
  navLinkStyle: 'underline',
  animationIntensity: 1,
  shadowIntensity: 1,
  
  // New (40+)
  textColorLight: '#1c1917', // stone-900
  textColorDark: '#e7e5e4', // stone-200
  linkColorLight: '#44403c', // stone-700
  linkColorDark: '#d6d3d1', // stone-300
  linkHoverColorLight: '#d4af37',
  linkHoverColorDark: '#d4af37',
  borderColorLight: '#e7e5e4', // stone-200
  borderColorDark: '#44403c', // stone-700

  googleFontUrl: '',
  headingFontFamily: "'Playfair Display', serif",
  bodyFontFamily: "'Inter', sans-serif",
  bodyLineHeight: 1.7,
  bodyFontWeight: 400,
  headingTextTransform: 'none',

  headerHeight: 5, // rem
  sectionSpacingY: 6, // rem
  contentPaddingX: 1.5, // rem
  gridGap: 2, // rem
  footerPaddingY: 3, // rem

  buttonPaddingX: 2, // rem
  buttonPaddingY: 0.75, // rem
  buttonBorderWidth: 1, // px
  buttonHoverEffect: 'lift',
  buttonTextTransform: 'none',
  
  cardPadding: 1.25, // rem
  cardBorderWidth: 1, // px
  cardHoverEffect: 'lift',
  cardImageAspectRatio: 'square',
  cardImageObjectFit: 'cover',
  
  inputBgColorLight: '#ffffff',
  inputBgColorDark: '#292524', // stone-800
  inputBorderColor: '#d6d3d1', // stone-300
  inputFocusStyle: 'ring',
  inputBorderRadius: 0.375, // rem
  
  pageTransitionEffect: 'fade',
  scrollAnimation: 'fade-up',
  modalOverlayOpacity: 0.6,

  stickyHeader: true,
  headerBgOpacity: 0.8,
  logoSize: 2.25, // rem
};

export const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
    enableCrypto: true,
    enableZarinpal: true,
    zarinpalMerchantId: '',
    cryptoWallets: [
        { id: 'btc', name: 'Bitcoin', symbol: 'BTC', network: 'Bitcoin', address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', enabled: true, priceId: 'bitcoin' },
        { id: 'eth', name: 'Ethereum', symbol: 'ETH', network: 'ERC-20', address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', enabled: true, priceId: 'ethereum' },
        { id: 'usdt-trc20', name: 'Tether', symbol: 'USDT', network: 'TRC-20', address: 'TYDzsYUEpvnYmQk4zGP9sWWcTKyTpeGf1', enabled: true, priceId: 'tether' },
        { id: 'bnb', name: 'BNB', symbol: 'BNB', network: 'BEP-20', address: 'bnb136ns6lfw4zs5hg4n85vdthaad7hq5m4gtkgf23', enabled: true, priceId: 'binancecoin' },
        { id: 'sol', name: 'Solana', symbol: 'SOL', network: 'Solana', address: 'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH', enabled: true, priceId: 'solana' },
        { id: 'ada', name: 'Cardano', symbol: 'ADA', network: 'Cardano', address: 'addr1q9...', enabled: true, priceId: 'cardano' },
        { id: 'doge', name: 'Dogecoin', symbol: 'DOGE', network: 'Dogecoin', address: 'D8...', enabled: true, priceId: 'dogecoin' },
        { id: 'trx', name: 'Tron', symbol: 'TRX', network: 'TRC-20', address: 'T...', enabled: true, priceId: 'tron' },
        { id: 'usdc', name: 'USD Coin', symbol: 'USDC', network: 'ERC-20', address: '0x...', enabled: true, priceId: 'usd-coin' },
        { id: 'dot', name: 'Polkadot', symbol: 'DOT', network: 'Polkadot', address: '1...', enabled: true, priceId: 'polkadot' },
    ]
};


export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Artisan Silver Teapot',
    price: 450,
    description: 'A hand-hammered sterling silver teapot, showcasing exquisite craftsmanship. Perfect for elegant tea ceremonies and as a centerpiece.',
    imageUrls: [
      'https://picsum.photos/seed/silver-teapot-artistry/800/800',
      'https://picsum.photos/seed/silver-teapot-detail/800/800',
      'https://picsum.photos/seed/silver-teapot-angle/800/800',
      'https://picsum.photos/seed/silver-teapot-lifestyle/800/800',
    ],
    videoUrl: 'https://videos.pexels.com/video-files/3209828/3209828-hd_1280_720_25fps.mp4',
    modelUrl: 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Models/2.0/SpillingPot/glTF/SpillingPot.gltf',
    category: 'Tableware',
    metaDescription: 'Discover the Artisan Silver Teapot, a hand-hammered sterling silver masterpiece. Exquisite craftsmanship for elegant tea ceremonies and home decor.',
    isEngravable: false,
  },
  {
    id: '2',
    name: 'Heritage Silver Cutlery Set',
    price: 890,
    description: 'A complete 24-piece cutlery set made from the finest silver. Its timeless design complements any dining occasion.',
    imageUrls: [
      'https://picsum.photos/seed/silver-cutlery-setting/800/800',
      'https://picsum.photos/seed/silver-fork-closeup/800/800',
      'https://picsum.photos/seed/silver-knife-handle/800/800',
    ],
    category: 'Tableware',
    metaDescription: 'Elevate your dining with the Heritage Silver Cutlery Set. A complete 24-piece collection in fine silver with a timeless, elegant design.',
    isEngravable: false,
  },
  {
    id: '3',
    name: 'Moonstone Silver Locket',
    price: 220,
    description: 'A delicate silver locket featuring a luminous moonstone centerpiece. A perfect heirloom to cherish memories.',
    imageUrls: [
      'https://picsum.photos/seed/locket-moonstone-glow/800/800',
      'https://picsum.photos/seed/locket-on-velvet/800/800',
      'https://picsum.photos/seed/locket-open-detail/800/800',
    ],
     videoUrl: 'https://videos.pexels.com/video-files/5898039/5898039-hd_1280_720_24fps.mp4',
    category: 'Jewelry',
    metaDescription: 'Cherish memories with the Moonstone Silver Locket. A delicate, heirloom-quality piece of jewelry featuring a luminous moonstone centerpiece.',
    isEngravable: true,
  },
  {
    id: '4',
    name: 'Ornate Silver Picture Frame',
    price: 180,
    description: 'Display your cherished moments in this beautifully ornate silver picture frame. Fits a 5x7 photo.',
    imageUrls: [
      'https://picsum.photos/seed/intricate-silver-frame/800/800',
      'https://picsum.photos/seed/frame-corner-detail/800/800',
      'https://picsum.photos/seed/frame-on-mantel/800/800',
    ],
    category: 'Decor',
    metaDescription: 'Showcase your favorite memories with this Ornate Silver Picture Frame. A beautiful and intricate 5x7 frame to add elegance to your home decor.',
    isEngravable: true,
  },
  {
    id: '5',
    name: 'Engraved Silver Cufflinks',
    price: 150,
    description: 'Sophisticated and stylish, these silver cufflinks can be custom engraved for a personal touch.',
    imageUrls: [
      'https://picsum.photos/seed/monogram-silver-cufflinks/800/800',
      'https://picsum.photos/seed/cufflinks-on-shirt/800/800',
    ],
    category: 'Jewelry',
    metaDescription: 'Add a touch of sophistication with our Engraved Silver Cufflinks. Stylish and customizable, they make the perfect personalized gift for any occasion.',
    isEngravable: true,
  },
  {
    id: '6',
    name: 'Filigree Silver Bowl',
    price: 350,
    description: 'A decorative bowl with intricate filigree work, ideal for holding potpourri or as a standalone art piece.',
    imageUrls: [
      'https://picsum.photos/seed/abstract-silver-filigree/800/800',
      'https://picsum.photos/seed/filigree-bowl-top-down/800/800',
      'https://picsum.photos/seed/filigree-bowl-side/800/800',
    ],
    category: 'Decor',
    metaDescription: 'Enhance your decor with our Filigree Silver Bowl. This stunning decorative piece features intricate filigree work, perfect as a standalone art piece.',
    isEngravable: false,
  }
];

export const INITIAL_WELCOME_MESSAGE = {
  title: "Timeless Elegance",
  subtitle: "Discover handcrafted silver pieces that transcend generations. Welcome to Bayani Silver."
};

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-001',
    customerName: 'Alice Johnson',
    date: '2023-10-26T10:00:00Z',
    items: [{ productId: '1', productName: 'Artisan Silver Teapot', quantity: 1, price: 450 }],
    total: 450,
    status: OrderStatus.Shipped,
  },
  {
    id: 'ORD-002',
    customerName: 'Bob Williams',
    date: '2023-10-25T14:30:00Z',
    items: [
      { productId: '3', productName: 'Moonstone Silver Locket', quantity: 1, price: 220 },
      { productId: '5', productName: 'Engraved Silver Cufflinks', quantity: 1, price: 150 },
    ],
    total: 370,
    status: OrderStatus.Pending,
  },
  {
    id: 'ORD-003',
    customerName: 'Charlie Brown',
    date: '2023-10-24T09:15:00Z',
    items: [{ productId: '2', productName: 'Heritage Silver Cutlery Set', quantity: 1, price: 890 }],
    total: 890,
    status: OrderStatus.Delivered,
  },
  {
    id: 'ORD-004',
    customerName: 'Diana Prince',
    date: '2023-10-23T18:00:00Z',
    items: [{ productId: '4', productName: 'Ornate Silver Picture Frame', quantity: 2, price: 180 }],
    total: 360,
    status: OrderStatus.Pending,
  },
  {
    id: 'ORD-005',
    customerName: 'Ethan Hunt',
    date: '2023-10-22T11:45:00Z',
    items: [{ productId: '6', productName: 'Filigree Silver Bowl', quantity: 1, price: 350 }],
    total: 350,
    status: OrderStatus.Cancelled,
  },
];

export const INITIAL_STORIES: Story[] = [
  {
    id: 'story-1',
    productId: '3', // Moonstone Silver Locket
    imageUrl: 'https://picsum.photos/seed/story-locket-lifestyle/540/960',
    previewImageUrl: 'https://picsum.photos/seed/story-locket-preview/200/200',
    title: 'A Moment',
    productName: 'Moonstone Silver Locket',
  },
  {
    id: 'story-2',
    productId: '5', // Engraved Silver Cufflinks
    imageUrl: 'https://picsum.photos/seed/story-cufflinks-lifestyle/540/960',
    previewImageUrl: 'https://picsum.photos/seed/story-cufflinks-preview/200/200',
    title: 'Sharp Style',
    productName: 'Engraved Silver Cufflinks',
  },
  {
    id: 'story-3',
    productId: '1', // Artisan Silver Teapot
    imageUrl: 'https://picsum.photos/seed/story-teapot-lifestyle/540/960',
    previewImageUrl: 'https://picsum.photos/seed/story-teapot-preview/200/200',
    title: 'Tea Time',
    productName: 'Artisan Silver Teapot',
  },
  {
    id: 'story-4',
    productId: '4', // Ornate Silver Picture Frame
    imageUrl: 'https://picsum.photos/seed/story-frame-lifestyle/540/960',
    previewImageUrl: 'https://picsum.photos/seed/story-frame-preview/200/200',
    title: 'Memories',
    productName: 'Ornate Silver Picture Frame',
  },
];
