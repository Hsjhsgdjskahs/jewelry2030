
import React, { useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import ShoppingAssistant from './ShoppingAssistant';

const ShoppingAssistantButton: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            <button
                onClick={toggleChat}
                className={`fixed bottom-6 right-6 z-[101] bg-stone-800 text-white rounded-full p-4 shadow-2xl hover:bg-stone-900 transition-all duration-300 transform hover:scale-110 active:scale-95 ${isOpen ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`}
                aria-label="Open AI Shopping Assistant"
            >
                <Sparkles size={28} />
            </button>
            
            {isOpen && <ShoppingAssistant onClose={toggleChat} />}
        </>
    );
};

export default ShoppingAssistantButton;
