import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/I18nProvider';
import { CheckCircle } from 'lucide-react';
import AnimatedHeadline from '../components/AnimatedHeadline';
import { AppContext } from '../App';

const UNBOXING_SOUND_URL = 'https://storage.googleapis.com/ikara-testing/162464__kastenfrosch__message.mp3';

const UnboxingAnimation: React.FC<{ onAnimationEnd: () => void }> = ({ onAnimationEnd }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const context = useContext(AppContext);

    useEffect(() => {
        const soundTimeout = setTimeout(() => {
            if (context?.isSoundEnabled && audioRef.current) {
                audioRef.current.volume = 0.5;
                audioRef.current.play().catch(e => console.error("Audio play failed:", e));
            }
            context?.playHapticFeedback([100, 50, 150]);
        }, 1200); // Corresponds to glow animation delay

        const endTimeout = setTimeout(() => {
            onAnimationEnd();
        }, 3500);

        return () => {
            clearTimeout(soundTimeout);
            clearTimeout(endTimeout);
        };
    }, [onAnimationEnd, context]);

    return (
        <div className="unboxing-container bg-stone-100 dark:bg-stone-900">
            <div className="unboxing-box">
                <div className="box-bottom"></div>
                <div className="box-lid"></div>
                <div className="box-inner-glow"></div>
            </div>
            <audio ref={audioRef} src={UNBOXING_SOUND_URL} preload="auto" />
        </div>
    );
};


const ConfirmationPage: React.FC = () => {
    const { t } = useI18n();
    const [isUnboxing, setIsUnboxing] = useState(true);

    if (isUnboxing) {
        return <UnboxingAnimation onAnimationEnd={() => setIsUnboxing(false)} />;
    }

    return (
        <div className="container mx-auto px-6 py-20 text-center animate-fade-in">
            <CheckCircle
                className="mx-auto text-green-500 mb-6"
                size={80}
                strokeWidth={1.5}
            />
            <AnimatedHeadline text={t('confirmationPage.title')} as="h1" className="text-5xl font-serif text-stone-800 dark:text-stone-200" />
            <p className="text-stone-600 dark:text-stone-400 mt-4 mb-8 max-w-md mx-auto">{t('confirmationPage.subtitle')}</p>
            <Link
                to="/products"
                className="btn-primary-gradient text-white font-bold py-3 px-8 rounded-md text-lg shadow-lg focus-ring"
            >
                {t('confirmationPage.backToShop')}
            </Link>
        </div>
    );
};

export default ConfirmationPage;