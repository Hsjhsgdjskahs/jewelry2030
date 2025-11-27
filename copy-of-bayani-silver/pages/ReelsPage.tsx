
import React, { useContext, useState } from 'react';
import { AppContext } from '../App';
import AnimatedHeadline from '../components/AnimatedHeadline';
import { useI18n } from '../i18n/I18nProvider';
import StoryViewer from '../components/stories/StoryViewer';
import ReelCard from '../components/reels/ReelCard';

const ReelsPage: React.FC = () => {
    const { t } = useI18n();
    const context = useContext(AppContext);
    const stories = context?.stories || [];
    const [viewerOpen, setViewerOpen] = useState(false);
    const [startIndex, setStartIndex] = useState(0);

    const openViewer = (index: number) => {
        setStartIndex(index);
        setViewerOpen(true);
    };

    const closeViewer = () => {
        setViewerOpen(false);
    };

    return (
        <div className="container mx-auto px-6 py-20">
            <div className="text-center mb-12">
                <AnimatedHeadline text={t('reelsPage.title')} as="h1" className="text-5xl font-serif text-stone-800 dark:text-stone-200" />
                <p className="text-stone-600 dark:text-stone-400 mt-2 max-w-2xl mx-auto">{t('reelsPage.subtitle')}</p>
            </div>

            <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                {stories.map((story, index) => (
                    <ReelCard 
                        key={story.id} 
                        story={story}
                        onOpen={() => openViewer(index)}
                    />
                ))}
            </div>
             {viewerOpen && <StoryViewer stories={stories} startIndex={startIndex} onClose={closeViewer} />}
        </div>
    );
};

export default ReelsPage;
