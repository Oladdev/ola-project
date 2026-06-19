import React, { useState } from 'react';

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
    description: 'From late-night debugging marathons to stressful project deadlines, your constant guidance and reliable support make every single workspace hurdle manageable.',
    emoji: '🤝',
    bgColor: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
  },
  {
    id: 1,
    title: 'Code Partner',
    subtitle: 'Slaying bugs side-by-side',
    description: 'Brainstorming solutions, refactoring messy codebases, and sharing that pure dopamine rush when a unit test passes. You are the ultimate coding teammate.',
    emoji: '💻',
    bgColor: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
  },
  {
    id: 2,
    title: 'The Design Critic',
    subtitle: 'Ensuring absolute perfection',
    description: 'Always keeping things pixel-perfect, pointing out layout misalignments, pushing for premium styling, and ensuring WCAG accessibility compliance across every view.',
    emoji: '🎨',
    bgColor: 'linear-gradient(135deg, #f59e0b, #e11d48)',
  },
  {
    id: 3,
    title: 'The Brainstormer',
    subtitle: 'Turning abstract ideas to reality',
    description: 'Whenever we sit down to draft a feature list or architectural diagrams, your sharp intuition and quick sketches outline the absolute best engineering path forward.',
    emoji: '💡',
    bgColor: 'linear-gradient(135deg, #10b981, #3b82f6)',
  },
  {
    id: 4,
    title: 'Organizer Extraordinaire',
    subtitle: 'Structuring chaos into order',
    description: 'Meeting notes, issue backlogs, deployment schedules—you manage the logs, clean the boards, and schedule the sprints that save our team from complete project chaos.',
    emoji: '📅',
    bgColor: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
  },
  {
    id: 5,
    title: 'The Energizer',
    subtitle: 'Fueling late night sessions',
    description: 'Keeping our spirits high, ordering that extra caffeine dosage, sharing hilarious tech memes, and reminding the team to laugh, stretch, and stay human.',
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
