import React, { useState } from 'react';
import { Story } from '../../types';
import StoryViewer from './StoryViewer';

interface StoryReelProps {
    stories: Story[];
}

const StoryReel: React.FC<StoryReelProps> = ({ stories }) => {
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
        <>
            <div className="bg-white/80 dark:bg-stone-800/80 backdrop-blur-md p-4 rounded-xl shadow-lg border border-stone-200 dark:border-stone-700">
                <div className="flex space-x-4 overflow-x-auto pb-2 -mb-2">
                    {stories.map((story, index) => (
                        <button
                            key={story.id}
                            onClick={() => openViewer(index)}
                            className="flex-shrink-0 text-center group focus-ring rounded-full story-thumb"
                        >
                            <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 group-hover:scale-110 transition-transform duration-300 story-border">
                                <div className="bg-white dark:bg-stone-800 w-full h-full rounded-full p-1 overflow-hidden">
                                    <img
                                        src={story.previewImageUrl}
                                        alt={story.title}
                                        className="w-full h-full rounded-full object-cover group-hover:scale-125 transition-transform duration-300"
                                    />
                                </div>
                            </div>
                            <p className="text-xs mt-2 font-semibold text-stone-700 dark:text-stone-300 truncate w-20 transform transition-all duration-300 group-hover:text-[--color-gold-dark] group-hover:-translate-y-1">{story.title}</p>
                        </button>
                    ))}
                </div>
            </div>
            {viewerOpen && <StoryViewer stories={stories} startIndex={startIndex} onClose={closeViewer} />}
        </>
    );
};

export default StoryReel;