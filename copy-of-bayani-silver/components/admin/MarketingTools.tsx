
import React, { useState, useContext } from 'react';
import { AppContext } from '../../App';
import { generateSocialMediaPost, generateMarketingImage } from '../../services/geminiService';
import { SocialMediaPost, Product } from '../../types';
import LoadingSpinner from '../LoadingSpinner';
import { Sparkles, Copy, Image as ImageIcon, Download } from 'lucide-react';
import { useI18n } from '../../i18n/I18nProvider';

const SocialPostGenerator: React.FC = () => {
    const context = useContext(AppContext);
    const { t } = useI18n();
    const [selectedProduct, setSelectedProduct] = useState<string>(context?.products[0]?.name || '');
    const [platform, setPlatform] = useState<'Instagram' | 'Twitter'>('Instagram');
    const [post, setPost] = useState<SocialMediaPost | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isCopied, setIsCopied] = useState(false);

    const handleGenerate = async () => {
        if (!selectedProduct) return;
        setIsLoading(true);
        setError('');
        setPost(null);
        try {
            const result = await generateSocialMediaPost(selectedProduct, platform);
            setPost(result);
        } catch (err: any) {
            setError(err.message || t('marketing.error'));
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCopy = () => {
        if (!post) return;
        const textToCopy = `${post.post}\n\n${post.hashtags}`;
        navigator.clipboard.writeText(textToCopy);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    }

    return (
        <div>
            <div className="space-y-4 p-4 border rounded-md bg-stone-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="product" className="block text-sm font-medium text-stone-700">{t('marketing.productLabel')}</label>
                        <select id="product" value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)} className="mt-1 w-full form-input focus-ring">
                            {context?.products.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="platform" className="block text-sm font-medium text-stone-700">{t('marketing.platformLabel')}</label>
                        <select id="platform" value={platform} onChange={e => setPlatform(e.target.value as 'Instagram' | 'Twitter')} className="mt-1 w-full form-input focus-ring">
                            <option value="Instagram">Instagram</option>
                            <option value="Twitter">Twitter</option>
                        </select>
                    </div>
                </div>
                 <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="w-full inline-flex items-center justify-center bg-stone-800 text-white font-bold py-2 px-4 rounded-md hover:bg-stone-900 transition-colors disabled:opacity-50"
                >
                    <Sparkles size={16} className="me-2" />
                    {isLoading ? t('marketing.loading') : t('marketing.generateButton')}
                </button>
            </div>
            
            {error && <p className="text-red-500 mt-4">{error}</p>}
            
            {post && (
                <div className="mt-6 p-4 border rounded-md animate-fade-in relative">
                    <button onClick={handleCopy} className="absolute top-2 right-2 text-stone-500 hover:text-stone-800 p-2 rounded-md hover:bg-stone-100 transition-colors">
                        <Copy size={16} />
                    </button>
                    {isCopied && <div className="absolute top-10 right-2 bg-stone-800 text-white text-xs px-2 py-1 rounded-md">{t('marketing.copied')}</div>}
                    <h3 className="font-semibold text-lg mb-2">{t('marketing.generatedPost')}</h3>
                    <p className="whitespace-pre-wrap bg-stone-50 p-3 rounded-md">{post.post}</p>
                    <h4 className="font-semibold mt-4 mb-2">{t('marketing.suggestedHashtags')}</h4>
                    <p className="text-sm text-stone-600 bg-stone-50 p-3 rounded-md">{post.hashtags}</p>
                </div>
            )}
        </div>
    );
};

const AIImageGenerator: React.FC = () => {
    const context = useContext(AppContext);
    const { t } = useI18n();
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(context?.products[0] || null);
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [error, setError] = useState('');

    React.useEffect(() => {
        if (selectedProduct) {
            setPrompt(`A professional, elegant photograph of a luxury silver item: "${selectedProduct.name}". The style is clean, bright, and suitable for a high-end brand's social media. The product is the main focus. Background is a neutral, out-of-focus studio setting.`);
        }
    }, [selectedProduct]);

    const handleGenerate = async () => {
        if (!prompt) return;
        setIsLoading(true);
        setError('');
        setGeneratedImage(null);
        try {
            const result = await generateMarketingImage(prompt, aspectRatio);
            setGeneratedImage(result);
        } catch (err: any) {
            setError(err.message || t('marketing.error'));
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="mt-8">
            <h3 className="text-xl font-serif text-stone-800 mb-2">{t('marketing.imageGeneratorTitle')}</h3>
            <p className="text-stone-600 mb-4">{t('marketing.imageGeneratorSubtitle')}</p>
            <div className="space-y-4 p-4 border rounded-md bg-stone-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="product-image" className="block text-sm font-medium text-stone-700">{t('marketing.productLabel')}</label>
                        <select id="product-image" value={selectedProduct?.id || ''} onChange={e => setSelectedProduct(context?.products.find(p => p.id === e.target.value) || null)} className="mt-1 w-full form-input focus-ring">
                            {context?.products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div>
                         <label htmlFor="aspect-ratio" className="block text-sm font-medium text-stone-700">{t('marketing.aspectRatio')}</label>
                        <select id="aspect-ratio" value={aspectRatio} onChange={e => setAspectRatio(e.target.value)} className="mt-1 w-full form-input focus-ring">
                            <option value="1:1">1:1 (Square)</option>
                            <option value="16:9">16:9 (Landscape)</option>
                            <option value="9:16">9:16 (Portrait)</option>
                            <option value="4:3">4:3</option>
                            <option value="3:4">3:4</option>
                        </select>
                    </div>
                </div>
                 <div>
                    <label htmlFor="image-prompt" className="block text-sm font-medium text-stone-700">{t('marketing.imagePrompt')}</label>
                    <textarea id="image-prompt" value={prompt} onChange={e => setPrompt(e.target.value)} rows={4} className="mt-1 w-full form-input focus-ring"/>
                </div>
                 <button
                    onClick={handleGenerate}
                    disabled={isLoading || !prompt}
                    className="w-full inline-flex items-center justify-center bg-indigo-600 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                    <ImageIcon size={16} className="me-2" />
                    {isLoading ? t('marketing.loading') : t('marketing.generateImageButton')}
                </button>
            </div>
             {error && <p className="text-red-500 mt-4">{error}</p>}
             {isLoading && <div className="mt-6 flex justify-center"><LoadingSpinner/></div>}

            {generatedImage && (
                <div className="mt-6 relative">
                    <img src={generatedImage} alt="Generated marketing" className="rounded-lg shadow-md w-full" />
                     <a
                        href={generatedImage}
                        download="marketing-image.jpg"
                        className="absolute bottom-2 right-2 inline-flex items-center bg-white/80 text-stone-800 font-bold py-2 px-3 rounded-full text-sm hover:bg-white shadow-md transition-all focus-ring"
                    >
                        <Download size={16} className="me-2" />
                        {t('imageStudio.download')}
                    </a>
                </div>
            )}
        </div>
    );
}

const MarketingTools: React.FC = () => {
    const { t } = useI18n();

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg border border-stone-200 animate-fade-in">
            <h2 className="text-2xl font-serif text-stone-800 mb-2">{t('marketing.title')}</h2>
            <p className="text-stone-600 mb-6">{t('marketing.subtitle')}</p>
            <SocialPostGenerator/>
            <AIImageGenerator/>
        </div>
    );
};

export default MarketingTools;
