import React from 'react';

interface AnimatedHeadlineProps {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  className?: string;
}

const AnimatedHeadline: React.FC<AnimatedHeadlineProps> = ({ text, as: Component = 'h1', className }) => {
  const words = text.split(' ');

  return (
    <Component className={`${className} animate-word-reveal`}>
      {words.map((word, index) => (
        <span
          key={index}
          style={{ animationDelay: `${index * 150}ms` }}
          className="mr-[0.25em]" // Adjust spacing between words
        >
          {word}
        </span>
      ))}
    </Component>
  );
};

export default AnimatedHeadline;
