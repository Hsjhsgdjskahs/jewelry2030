
import React, { useState, useEffect } from 'react';
import { findStores } from '../services/geminiService';
import LoadingSpinner from '../components/LoadingSpinner';
import AnimatedHeadline from '../components/AnimatedHeadline';
import { MapPin, AlertTriangle, Link as LinkIcon } from 'lucide-react';
import { useI18n } from '../i18n/I18nProvider';
import { GroundingChunk } from '@google/genai';

const FindStorePage: React.FC = () => {
    const { t } = useI18n();
    const [result, setResult] = useState<{ text: string, chunks: GroundingChunk[] } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [userLocation, setUserLocation] = useState<{ latitude: number, longitude: number} | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
            },
            (err) => {
                console.warn(`Geolocation error: ${err.message}`);
                setError(t('findStore.errorGeo'));
            }
        );
    }, [t]);

    const handleSearch = async () => {
        if (!userLocation) {
            setError(t('findStore.errorGeo'));
            return;
        }
        setHasSearched(true);
        setIsLoading(true);
        setError('');
        try {
            const searchResult = await findStores("Find Bayani Silver stores or authorized dealers near me.", userLocation);
            setResult(searchResult);
        } catch (err: any) {
            setError(err.message || t('findStore.error'));
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="container mx-auto px-6 py-20">
            <div className="text-center mb-12">
                <AnimatedHeadline text={t('findStore.title')} as="h1" className="text-5xl font-serif text-stone-800 dark:text-stone-200" />
                <p className="text-stone-600 dark:text-stone-400 mt-2 max-w-2xl mx-auto">{t('findStore.subtitle')}</p>
            </div>

            <div className="max-w-2xl mx-auto text-center">
                <button
                    onClick={handleSearch}
                    disabled={isLoading || !userLocation}
                    className="inline-flex items-center justify-center btn-primary-gradient text-white font-bold py-3 px-8 rounded-md text-lg transform active:translate-y-0 shadow-lg disabled:opacity-50 focus-ring"
                >
                    <MapPin size={20} className="me-2"/>
                    {isLoading ? t('findStore.finding') : t('findStore.searchButton')}
                </button>
                 {userLocation && <p className="text-xs text-stone-500 mt-2">{t('findStore.yourLocation')}</p>}
                 {error && !isLoading && <p className="text-red-500 text-sm mt-4">{error}</p>}
            </div>

            {hasSearched && (
                <div className="mt-12 max-w-3xl mx-auto">
                    {isLoading ? (
                        <LoadingSpinner />
                    ) : result ? (
                        <div className="bg-white dark:bg-stone-800/50 p-8 rounded-lg shadow-xl border border-stone-200 dark:border-stone-700/50 animate-fade-in">
                            <div className="prose prose-stone dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: result.text.replace(/\n/g, '<br/>') }}></div>
                             {result.chunks && result.chunks.length > 0 && (
                                <div className="mt-6 pt-4 border-t border-stone-200 dark:border-stone-700">
                                    <h3 className="text-sm font-semibold uppercase text-stone-500 dark:text-stone-400 mb-3">Sources from Google Maps</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {result.chunks.map((chunk, i) => chunk.maps && (
                                            <a href={chunk.maps.uri} key={i} target="_blank" rel="noopener noreferrer" className="block p-3 bg-stone-50 dark:bg-stone-800 rounded-md hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 transition-colors">
                                                <p className="font-semibold text-sky-600 dark:text-sky-400 flex items-center gap-2">
                                                    <LinkIcon size={14} />
                                                    {chunk.maps.title}
                                                </p>
                                                 {chunk.maps.placeAnswerSources?.[0]?.reviewSnippets && (
                                                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 italic">"{chunk.maps.placeAnswerSources[0].reviewSnippets[0]}"</p>
                                                )}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        !error && <div className="text-center py-12 px-6 bg-stone-50/70 dark:bg-stone-800/20 rounded-lg border border-dashed">
                           <AlertTriangle size={40} className="mx-auto text-stone-400 dark:text-stone-500 mb-4"/>
                           <p className="text-stone-600 dark:text-stone-400">{t('findStore.error')}</p>
                       </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default FindStorePage;
