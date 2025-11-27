
import React from 'react';
import AnimatedHeadline from '../components/AnimatedHeadline';
import { useI18n } from '../i18n/I18nProvider';
import { Camera } from 'lucide-react';

const galleryImages = [
    { src: 'https://images.pexels.com/photos/1779213/pexels-photo-1779213.jpeg?auto=compress&cs=tinysrgb&w=600', alt: 'Silver cutlery on a dining table' },
    { src: 'https://images.pexels.com/photos/7821532/pexels-photo-7821532.jpeg?auto=compress&cs=tinysrgb&w=600', alt: 'Woman wearing an elegant silver necklace' },
    { src: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=600', alt: 'Living room with a silver picture frame on the mantel' },
    { src: 'https://images.pexels.com/photos/2659387/pexels-photo-2659387.jpeg?auto=compress&cs=tinysrgb&w=600', alt: 'Close up of a silver ring on a hand' },
    { src: 'https://images.pexels.com/photos/6621472/pexels-photo-6621472.jpeg?auto=compress&cs=tinysrgb&w=600', alt: 'A silver bowl as a centerpiece' },
    { src: 'https://images.pexels.com/photos/1034662/pexels-photo-1034662.jpeg?auto=compress&cs=tinysrgb&w=600', alt: 'Evening setting with silver decor' },
    { src: 'https://images.pexels.com/photos/2089366/pexels-photo-2089366.jpeg?auto=compress&cs=tinysrgb&w=600', alt: 'A person wearing silver cufflinks' },
    { src: 'https://images.pexels.com/photos/7005295/pexels-photo-7005295.jpeg?auto=compress&cs=tinysrgb&w=600', alt: 'Silver tea set in use' },
];

const CustomerGalleryPage: React.FC = () => {
    const { t } = useI18n();
    return (
        <div className="container mx-auto px-6 py-20">
            <div className="text-center mb-12">
                <AnimatedHeadline text={t('gallery.title')} as="h1" className="text-5xl font-serif text-stone-800" />
                <p className="text-stone-600 mt-2 max-w-2xl mx-auto">{t('gallery.subtitle')}</p>
            </div>

            <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                {galleryImages.map((image, index) => (
                     <div key={index} className="relative group overflow-hidden rounded-lg break-inside-avoid shadow-lg transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
                        <img src={image.src} alt={image.alt} loading="lazy" className="w-full h-auto object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                            <p className="text-white text-sm opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 delay-100">{image.alt}</p>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="text-center mt-16 py-12 px-6 bg-stone-100 rounded-lg">
                <Camera size={40} className="mx-auto text-[--color-gold-dark] mb-4"/>
                <h2 className="text-2xl font-serif text-stone-700">{t('gallery.shareTitle')}</h2>
                <p className="text-stone-600 mt-2 mb-6 max-w-lg mx-auto">{t('gallery.shareSubtitle')}</p>
                <a href="#" className="inline-block bg-stone-800 text-white font-bold py-3 px-8 rounded-md text-lg transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 shadow-lg hover:shadow-xl focus-ring">
                    {t('gallery.shareButton')}
                </a>
            </div>
        </div>
    );
};

export default CustomerGalleryPage;
