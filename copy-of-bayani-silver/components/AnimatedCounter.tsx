
import React, { useState, useEffect, useRef } from 'react';

interface AnimatedCounterProps {
    value: number;
    className?: string;
    formatter: (value: number) => string;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ value, className, formatter }) => {
    const [displayValue, setDisplayValue] = useState(value);
    const prevValueRef = useRef(value);
    const frameRef = useRef<number | undefined>(undefined);

    useEffect(() => {
        const startValue = prevValueRef.current;
        const endValue = value;
        const duration = 700; // ms
        let startTime: number | null = null;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / duration, 1);

            const easedPercentage = 1 - Math.pow(1 - percentage, 3); // easeOutCubic

            const currentValue = startValue + (endValue - startValue) * easedPercentage;
            setDisplayValue(currentValue);

            if (progress < duration) {
                frameRef.current = requestAnimationFrame(animate);
            } else {
                setDisplayValue(endValue);
                prevValueRef.current = endValue;
            }
        };

        frameRef.current = requestAnimationFrame(animate);

        return () => {
            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current);
            }
            prevValueRef.current = value;
        };
    }, [value]);

    return <span className={className}>{formatter(displayValue)}</span>;
};

export default AnimatedCounter;
