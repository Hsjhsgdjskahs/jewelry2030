import React, { useState, useRef } from 'react';

interface ImageZoomProps {
  imageUrl: string;
  alt: string;
  zoomLevel?: number;
  lensSize?: number;
  imgStyle?: React.CSSProperties;
}

const ImageZoom: React.FC<ImageZoomProps> = ({ imageUrl, alt, zoomLevel = 2.5, lensSize = 150, imgStyle }) => {
  const [showZoom, setShowZoom] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  const imageRef = useRef<HTMLImageElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    
    const { left, top, width, height } = imageRef.current.getBoundingClientRect();
    
    const x = e.clientX - left;
    const y = e.clientY - top;
    
    if (x >= 0 && x <= width && y >= 0 && y <= height) {
        setPosition({ x, y });
        if (!showZoom) setShowZoom(true);
    } else {
        if (showZoom) setShowZoom(false);
    }
  };

  const handleMouseLeave = () => {
    setShowZoom(false);
  };
  
  const lensTop = position.y - lensSize / 2;
  const lensLeft = position.x - lensSize / 2;
  
  const bgPosX = -(position.x * zoomLevel - lensSize / 2);
  const bgPosY = -(position.y * zoomLevel - lensSize / 2);

  const imageWidth = imageRef.current?.width;
  const imageHeight = imageRef.current?.height;
  
  const bgSizeX = imageWidth ? imageWidth * zoomLevel : 0;
  const bgSizeY = imageHeight ? imageHeight * zoomLevel : 0;

  return (
    <div
      className="relative cursor-crosshair h-full w-full"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <img
        ref={imageRef}
        src={imageUrl}
        alt={alt}
        className="w-full h-full object-cover bg-stone-100"
        style={imgStyle}
        aria-label={alt}
      />

      {showZoom && (
        <div
          aria-hidden="true"
          className="absolute pointer-events-none border-4 border-white/80 rounded-full bg-no-repeat shadow-2xl backdrop-blur-sm"
          style={{
            height: `${lensSize}px`,
            width: `${lensSize}px`,
            top: `${lensTop}px`,
            left: `${lensLeft}px`,
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: `${bgSizeX}px ${bgSizeY}px`,
            backgroundPosition: `${bgPosX}px ${bgPosY}px`,
          }}
        />
      )}
    </div>
  );
};

export default ImageZoom;