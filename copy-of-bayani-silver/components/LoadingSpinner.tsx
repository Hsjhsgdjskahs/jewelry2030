
import React from 'react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md' }) => {
    const sizeClasses = {
        sm: 'h-5 w-5 border-2',
        md: 'h-8 w-8 border-4',
        lg: 'h-12 w-12 border-4',
    };

    return (
        <div className="flex justify-center items-center">
            <div
                className={`animate-spin rounded-full border-stone-300 border-t-stone-600 ${sizeClasses[size]}`}
            ></div>
        </div>
    );
};

export default LoadingSpinner;
