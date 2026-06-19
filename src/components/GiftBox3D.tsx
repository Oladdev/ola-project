import React, { useState, useRef, useEffect } from 'react';
import './GiftBox3D.css';

interface GiftBox3DProps {
  onOpen: () => void;
}

export const GiftBox3D: React.FC<GiftBox3DProps> = ({ onOpen }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [rotation, setRotation] = useState({ x: -15, y: 45 });
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Dynamic 3D tilt response to mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isOpen) return;
      const { innerWidth, innerHeight } = window;
      
      // Calculate normalized cursor coordinates (-0.5 to 0.5)
      const x = (e.clientX / innerWidth) - 0.5;
      const y = (e.clientY / innerHeight) - 0.5;

      // Map to degrees of rotation (-30 to 30 for Y, -25 to -5 for X)
      setRotation({
        x: -15 + (y * -20),
        y: 45 + (x * 40),
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isOpen]);

  const handleOpenClick = () => {
    if (isOpen) return;
    setIsOpen(true);

    // Explode and notify parent after lid-lift animation completes
    setTimeout(() => {
      onOpen();
    }, 1200);
  };

  return (
    <div className={`gift-wrapper ${isOpen ? 'box-opened' : ''}`} ref={containerRef}>
      <div 
        className="gift-container-3d"
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
        }}
        onClick={handleOpenClick}
        role="button"
        tabIndex={0}
        aria-label="Click to open the birthday gift box"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleOpenClick();
          }
        }}
      >
        {/* Gift Box Lid (separated so it can fly off) */}
        <div className="gift-lid-3d">
          <div className="lid-face lid-top"></div>
          <div className="lid-face lid-front"></div>
          <div className="lid-face lid-back"></div>
          <div className="lid-face lid-left"></div>
          <div className="lid-face lid-right"></div>
        </div>

        {/* Gift Box Body */}
        <div className="gift-body-3d">
          <div className="body-face body-front">
            <span className="ribbon-vertical"></span>
            <div className="card-label">Click Me</div>
          </div>
          <div className="body-face body-back">
            <span className="ribbon-vertical"></span>
          </div>
          <div className="body-face body-left">
            <span className="ribbon-vertical"></span>
          </div>
          <div className="body-face body-right">
            <span className="ribbon-vertical"></span>
          </div>
          <div className="body-face body-bottom"></div>
        </div>

        {/* Shadow underneath */}
        <div className="gift-shadow-3d"></div>
      </div>
      
      {!isOpen && (
        <p className="open-instructions" aria-live="polite">
          Hover to tilt, click to unlock the secret
        </p>
      )}
    </div>
  );
};
