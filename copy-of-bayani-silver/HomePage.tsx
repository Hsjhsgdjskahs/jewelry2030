
import React, { useContext, useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../App';
import ProductCard from '../components/ProductCard';
import { ArrowRight, Gem, Shield, Truck, ArrowLeft } from 'lucide-react';
import useIntersectionObserver from '../hooks/useIntersectionObserver';
import AnimatedHeadline from '../components/AnimatedHeadline';
import { useI18n } from '../i18n/I18nProvider';
import StoryReel from '../components/stories/StoryReel';
import { Product } from '../types';
import { generatePredictionHeadline } from '../services/geminiService';
import PredictivePreview from '../components/ai/PredictivePreview';
import LoadingSpinner from '../components/LoadingSpinner';

const HomePage: React.FC = () => {
  const context = useContext(AppContext);
  const { t, language } = useI18n();
  const [prediction, setPrediction] = useState<{product: Product, headline: string} | null>(null);
  const [isLoadingPrediction, setIsLoadingPrediction] = useState(true);

  const stories = context?.stories || [];
  const welcomeMessage = context?.welcomeMessage;
  const DirectionalArrow = language === 'fa' ? ArrowLeft : ArrowRight;


  useEffect(() => {
    const checkForPrediction = async () => {
        if (!context?.products) return;

        const categoryViewsStr = sessionStorage.getItem('category_views');
        if (!categoryViewsStr) {
            setIsLoadingPrediction(false);
            return;
        }

        const categoryViews = JSON.parse(categoryViewsStr);
        const dominantCategory = Object.entries(categoryViews)
            .sort((a, b) => (b[1] as number) - (a[1] as number))
            .find(entry => (entry[1] as number) > 1);
        
        if (dominantCategory) {
            const categoryName = dominantCategory[0];
            const viewedProducts = JSON.parse(sessionStorage.getItem('viewed_products') || '[]');
            
            const candidateProduct = context.products.find(p => p.category === categoryName && !viewedProducts.includes(p.id));

            if (candidateProduct) {
                try {
                    const headline = await generatePredictionHeadline(candidateProduct.category, candidateProduct.name);
                    setPrediction({ product: candidateProduct, headline });
                } catch (e) {
                    console.error("Failed to generate prediction headline", e);
                }
            }
        }
        setIsLoadingPrediction(false);
    };

    // Only run prediction check once per session on the homepage
    if (sessionStorage.getItem('prediction_checked') !== 'true') {
        checkForPrediction();
        sessionStorage.setItem('prediction_checked', 'true');
    } else {
        setIsLoadingPrediction(false);
    }
  }, [context?.products]);


  if (isLoadingPrediction) {
    return (
        <div className="h-[75vh] flex items-center justify-center">
            <LoadingSpinner size="lg" />
        </div>
    );
  }

  return (
    <div className="space-y-24">
      {/* Hero Section */}
      {prediction ? (
          <div className="animate-predictive-preview-fade-in">
              <PredictivePreview prediction={prediction} onDismiss={() => setPrediction(null)} />
          </div>
      ) : (
        <section className="relative h-[75vh] bg-white dark:bg-stone-900 flex items-center justify-center text-center text-white overflow-hidden">
             {context?.heroVideoUrl ? (
                <video src={context.heroVideoUrl} autoPlay loop muted playsInline className="absolute top-0 left-0 w-full h-full object-cover z-0" />
            ) : (
                <img src={context?.heroImage} alt="Hero background" className="absolute top-0 left-0 w-full h-full object-cover z-0" />
            )}
            <div className="absolute inset-0 bg-black/50 z-10"></div>
            <div className="relative z-20 p-8">
            <AnimatedHeadline text={welcomeMessage?.title || ''} as="h1" className="text-5xl md:text-7xl font-serif font-bold tracking-tight" />
            <p className="mt-4 text-xl max-w-2xl mx-auto text-stone-200 animate-fade-in" style={{ animationDelay: '600ms'}}>{welcomeMessage?.subtitle}</p>
            <div className="animate-fade-in" style={{ animationDelay: '800ms'}}>
                <Link
                to="/products"
                className="mt-8 inline-block btn-primary-gradient text-white font-bold py-3 px-8 rounded-md text-lg transform active:translate-y-0 shadow-lg focus-ring"
                >
                {t('homePage.shopButton')}
                </Link>
            </div>
            </div>
        </section>
      )}

      {/* Stories Section */}
      {stories.length > 0 && (
          <section className="container mx-auto px-6 -mt-16 z-30 relative">
              <StoryReel stories={stories} />
          </section>
      )}

      <FeaturedProductsSection />
      <WhyChooseUsSection />
    </div>
  );
};


const FeaturedProductsSection = () => {
    const context = useContext(AppContext);
    const { t, language } = useI18n();
    const featuredProducts = context?.products.slice(0, 3) || [];
    const DirectionalArrow = language === 'fa' ? ArrowLeft : ArrowRight;
    const featuredSectionRef = useRef<HTMLElement>(null);
    const isFeaturedVisible = useIntersectionObserver(featuredSectionRef, { threshold: 0.2, triggerOnce: true });

    return (
        <section ref={featuredSectionRef} className="container mx-auto px-6">
            <div className={`text-center mb-12 scroll-trigger ${isFeaturedVisible ? 'visible' : ''}`}>
                <h2 className="text-4xl font-serif text-stone-800 dark:text-stone-200">{t('homePage.featuredTitle')}</h2>
                <p className="text-stone-600 dark:text-stone-400 mt-2">{t('homePage.featuredSubtitle')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredProducts.map((product, index) => (
                    <div
                        key={product.id}
                        className={`scroll-trigger ${isFeaturedVisible ? 'visible' : ''}`}
                        style={{ transitionDelay: `${index * 150}ms` }}
                    >
                        <ProductCard product={product} />
                    </div>
                ))}
            </div>
            <div className={`text-center mt-12 scroll-trigger ${isFeaturedVisible ? 'visible' : ''}`} style={{ transitionDelay: '450ms' }}>
                <Link to="/products" className="group inline-flex items-center text-stone-700 dark:text-stone-300 font-semibold text-lg hover:text-[--color-gold-dark] transition-colors nav-link-underline pb-1">
                    {t('homePage.viewAll')} <DirectionalArrow size={20} className="ms-2 transition-transform group-hover:translate-x-2 rtl:group-hover:-translate-x-2"/>
                </Link>
            </div>
        </section>
    );
};

const WhyChooseUsSection = () => {
    const { t } = useI18n();
    const whyUsSectionRef = useRef<HTMLElement>(null);
    const isWhyUsVisible = useIntersectionObserver(whyUsSectionRef, { threshold: 0.2, triggerOnce: true });

    const whyUsFeatures = [
        { icon: Gem, title: t('homePage.feature1Title'), description: t('homePage.feature1Desc')},
        { icon: Shield, title: t('homePage.feature2Title'), description: t('homePage.feature2Desc')},
        { icon: Truck, title: t('homePage.feature3Title'), description: t('homePage.feature3Desc')},
    ];

    return (
        <section ref={whyUsSectionRef} className="bg-stone-100 dark:bg-stone-800/50 py-20">
            <div className="container mx-auto px-6">
                <div className={`text-center mb-12 scroll-trigger ${isWhyUsVisible ? 'visible' : ''}`}>
                    <h2 className="text-4xl font-serif text-stone-800 dark:text-stone-200">{t('homePage.whyUsTitle')}</h2>
                    <p className="text-stone-600 dark:text-stone-400 mt-2">{t('homePage.whyUsSubtitle')}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {whyUsFeatures.map((feature, index) => (
                        <div
                            key={index}
                            className={`text-center p-6 scroll-trigger group ${isWhyUsVisible ? 'visible' : ''}`}
                            style={{ transitionDelay: `${index * 150}ms` }}
                        >
                            <div className="inline-block animate-subtle-float" style={{ animationDelay: `${index * 300}ms`}}>
                                <div className="inline-block p-4 bg-white dark:bg-stone-700 rounded-full shadow-md mb-4 border border-stone-200 dark:border-stone-600 group-hover:scale-110 transition-transform duration-300">
                                    <feature.icon size={32} className="text-[--color-gold-dark] transition-transform duration-300 group-hover:rotate-12" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-serif text-stone-800 dark:text-stone-200 mb-2">{feature.title}</h3>
                            <p className="text-stone-600 dark:text-stone-400">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HomePage;
