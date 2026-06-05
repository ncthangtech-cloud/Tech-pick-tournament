'use client';

import React, { useState, useEffect } from 'react';

const DEFAULT_IMAGES = [
  { url: '/images/p1.jpg', caption: 'Technical Department Opening Matches' },
  { url: '/images/p2.jpg', caption: 'VNA Tournament Rallies at the Kitchen Line' },
  { url: '/images/p3.jpg', caption: 'Warmups and Paddle Preparation' },
  { url: '/images/p4.jpg', caption: 'Intense Tournament Doubles Play' },
  { url: '/images/p5.jpg', caption: 'Strategy Alignment at the Net' },
  { url: '/images/p6.jpg', caption: 'Precision Soft Dink Game Demonstration' },
  { url: '/images/p7.jpg', caption: 'Flight Operations Team Doubles Classic' },
  { url: '/images/p8.jpg', caption: 'Engine Maintenance Fleet Friendly Cup' },
  { url: '/images/p9.jpg', caption: 'Podium and Championship Trophy Presentation' }
];

interface CarouselProps {
  photos?: { url: string; caption: string }[];
}

export const Carousel: React.FC<CarouselProps> = ({ photos }) => {
  const displayImages = photos && photos.length > 0 ? photos : DEFAULT_IMAGES;
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    // Reset active index if the list changes
    setActiveIndex(0);
  }, [displayImages.length]);

  useEffect(() => {
    if (displayImages.length <= 1) return;

    const timer = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % displayImages.length);
    }, 5000); // 5 seconds interval

    return () => clearInterval(timer);
  }, [displayImages.length]);

  const handleDotClick = (index: number) => {
    setActiveIndex(index);
  };

  return (
    <div className="carousel-wrapper">
      <div className="carousel-inner">
        {displayImages.map((img, index) => (
          <div
            key={index}
            className={`carousel-slide ${index === activeIndex ? 'active' : ''}`}
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.55)), url(${img.url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="carousel-caption">
              <span className="carousel-badge">Recent Event Photo</span>
              <p className="carousel-text">{img.caption}</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Navigation Dots */}
      {displayImages.length > 1 && (
        <div className="carousel-dots">
          {displayImages.map((_, index) => (
            <button
              key={index}
              className={`carousel-dot ${index === activeIndex ? 'active' : ''}`}
              onClick={() => handleDotClick(index)}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Carousel;
