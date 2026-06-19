import React, { useState } from 'react';
import './MemoryCarousel3D.css';

export interface CarouselItem {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  emoji: string;
  bgColor: string;
}

interface MemoryCarousel3DProps {
  onCardSelect: (item: CarouselItem) => void;
}

const CAROUSEL_ITEMS: CarouselItem[] = [
  {
    id: 0,
    title: 'The Support Pillar',
    subtitle: 'Always there when it matters',
    description: "You've always been there through all my phases encouraging me, reminding me about assignment even helping me when i have alot to do, you've lowkey beocome my support system and my first  emergency contact 😂. Thank you for being there",
    emoji: '🤝',
    bgColor: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
  },
  {
    id: 1,
    title: 'Code Partner',
    subtitle: 'Slaying bugs side-by-side',
    description: "You became my first ever coding partner, motivated and inspired me to do most of the projects.",
    emoji: '💻',
    bgColor: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
  },
  {
    id: 2,
    title: 'The Brainstormer',
    subtitle: 'Turning wierdness into superpower',
    description: 'Whenever i have an issue , you always find a way to help in your way.',
    emoji: '💡',
    bgColor: 'linear-gradient(135deg, #10b981, #3b82f6)',
  },
  {
    id: 3,
    title: 'Organizer Extraordinaire',
    subtitle: 'Structuring chaos into order',
    description: "I could say you have OCD with how structured your life is 😭, but that structure has saved me from alot icel.",
    emoji: '📅',
    bgColor: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
  },
  {
    id: 4,
    title: 'The Energizer',
    subtitle: 'Bringing the best out ',
    description: "Despite how quiet people think you are, you are full of life with  high spirit, sharing wierd ass but hilarious dark videos, and buying food for me when i'm down",
    emoji: '☕',
    bgColor: 'linear-gradient(135deg, #06b6d4, #10b981)',
  },
];

export const MemoryCarousel3D: React.FC<MemoryCarousel3DProps> = ({ onCardSelect }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const rotateCount = CAROUSEL_ITEMS.length;
  const angleStep = 360 / rotateCount;

  const handleNext = () => {
    setActiveIndex((prev) => prev + 1);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => prev - 1);
  };

  const getNormalizedIndex = () => {
    const index = activeIndex % rotateCount;
    return index >= 0 ? index : index + rotateCount;
  };

  const currentItem = CAROUSEL_ITEMS[getNormalizedIndex()];

  return (
    <div className="carousel-section">
      <h2 className="section-title text-gradient">Memory Lanes & Roles</h2>
      <p className="section-desc">Rotate through the roles that make you an irreplaceable assistant and a priceless friend.</p>
      
      <div className="carousel-view-container">
        {/* The 3D Scene Wrapper */}
        <div className="scene-3d">
          <div 
            className="carousel-3d"
            style={{
              transform: `translateZ(calc(-1 * var(--carousel-radius))) rotateY(${-activeIndex * angleStep}deg)`,
            }}
          >
            {CAROUSEL_ITEMS.map((item, idx) => {
              const rotationAngle = idx * angleStep;
              const normalizedActive = getNormalizedIndex();
              const isCenter = idx === normalizedActive;

              return (
                <div
                  key={`card-${item.id}`}
                  className={`carousel-card-3d ${isCenter ? 'active' : ''}`}
                  style={{
                    transform: `rotateY(${rotationAngle}deg) translateZ(var(--carousel-radius))`,
                    background: item.bgColor,
                    ['--active-rot' as any]: `${rotationAngle}deg`,
                  }}
                  onClick={() => {
                    if (isCenter) {
                      onCardSelect(item);
                    } else {
                      // Smoothly rotate to this card by calculating the shortest path
                      const currentNormalized = getNormalizedIndex();
                      let diff = idx - currentNormalized;
                      if (diff > rotateCount / 2) {
                        diff -= rotateCount;
                      } else if (diff < -rotateCount / 2) {
                        diff += rotateCount;
                      }
                      setActiveIndex((prev) => prev + diff);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-hidden={false}
                  aria-label={`Carousel card: ${item.title}. ${isCenter ? 'Active. Click to read details.' : 'Click to rotate to front.'}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      if (isCenter) {
                        onCardSelect(item);
                      } else {
                        const currentNormalized = getNormalizedIndex();
                        let diff = idx - currentNormalized;
                        if (diff > rotateCount / 2) {
                          diff -= rotateCount;
                        } else if (diff < -rotateCount / 2) {
                          diff += rotateCount;
                        }
                        setActiveIndex((prev) => prev + diff);
                      }
                    }
                  }}
                >
                  <div className="card-emoji">{item.emoji}</div>
                  <h3 className="card-title">{item.title}</h3>
                  <p className="card-subtitle">{item.subtitle}</p>
                  {isCenter && <span className="read-more-indicator">Click to expand</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Accessible Controls */}
        <div className="carousel-controls">
          <button 
            className="control-btn prev-btn" 
            onClick={handlePrev}
            aria-label="Previous card"
            title="Rotate to previous role"
          >
            &larr;
          </button>
          
          <div className="carousel-indicator" aria-live="polite">
            Card {getNormalizedIndex() + 1} of {rotateCount}: <strong>{currentItem.title}</strong>
          </div>

          <button 
            className="control-btn next-btn" 
            onClick={handleNext}
            aria-label="Next card"
            title="Rotate to next role"
          >
            &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
