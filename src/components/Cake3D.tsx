import React, { useState, useEffect } from 'react';

interface Cake3DProps {
  onCakeBlownOut: () => void;
}

interface CandleState {
  id: number;
  isLit: boolean;
  x: number; // percentage left on the top of the cake
  y: number; // percentage top on the top of the cake
  height: number;
}

export const Cake3D: React.FC<Cake3DProps> = ({ onCakeBlownOut }) => {
  const [candles, setCandles] = useState<CandleState[]>([
    { id: 1, isLit: true, x: 30, y: 35, height: 45 },
    { id: 2, isLit: true, x: 45, y: 25, height: 50 },
    { id: 3, isLit: true, x: 65, y: 30, height: 40 },
    { id: 4, isLit: true, x: 40, y: 55, height: 48 },
    { id: 5, isLit: true, x: 60, y: 50, height: 42 },
  ]);
  const [allExtinguished, setAllExtinguished] = useState(false);

  const extinguishCandle = (id: number) => {
    setCandles((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isLit: false } : c))
    );

    // Play a tiny synthesis pop for audio feedback of blowing out a candle
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc.type = 'sine';
        // Quick drop in pitch simulating wind/blow sound
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.15);

        gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      }
    } catch (e) {
      console.warn("AudioContext failed to start for blow sound", e);
    }
  };

  useEffect(() => {
    const litCount = candles.filter((c) => c.isLit).length;
    if (litCount === 0 && !allExtinguished) {
      setAllExtinguished(true);
      
      // Delay slightly to let the visual transition sink in
      setTimeout(() => {
        onCakeBlownOut();
      }, 1000);
    }
  }, [candles, allExtinguished, onCakeBlownOut]);

  const handleReset = () => {
    setCandles((prev) => prev.map((c) => ({ ...c, isLit: true })));
    setAllExtinguished(false);
  };

  return (
    <div className="cake-wrapper">
      <div className={`cake-container-3d ${allExtinguished ? 'cake-glowing' : ''}`}>
        {/* Platter Plate */}
        <div className="plate-3d"></div>

        {/* Cake Layer 1 (Bottom, Large) */}
        <div className="cake-layer-3d layer-bottom">
          <div className="layer-face layer-top-face"></div>
          <div className="layer-face layer-side-face"></div>
        </div>

        {/* Cake Layer 2 (Top, Small) */}
        <div className="cake-layer-3d layer-top">
          <div className="layer-face layer-top-face"></div>
          <div className="layer-face layer-side-face"></div>
          {/* Candles positioned directly inside top layer to avoid rotation scale distortion */}
          <div className="candles-container">
            {candles.map((c) => (
              <div
                key={`candle-${c.id}`}
                className={`candle-wrapper ${c.isLit ? 'lit' : 'extinguished'}`}
                style={{
                  left: `${c.x}%`,
                  transform: `translate3d(-50%, -100%, ${(c.y / 100) * 55 - 27.5}px)`,
                }}
              >
                <button
                  className="candle-interactive-area"
                  onClick={() => c.isLit && extinguishCandle(c.id)}
                  aria-label={`Candle ${c.id}. ${c.isLit ? 'Lit. Click to blow it out.' : 'Blown out.'}`}
                  disabled={!c.isLit}
                >
                  {/* Candle body */}
                  <div className="candle-body" style={{ height: `${c.height}px` }}>
                    <div className="candle-wick"></div>
                    {c.isLit && (
                      <div className="candle-flame">
                        <div className="flame-inner"></div>
                      </div>
                    )}
                    {!c.isLit && <div className="smoke-puff"></div>}
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="cake-status-panel">
        {allExtinguished ? (
          <div className="greetings-bubble bounce-in">
            <h3 className="glow-text">🎉 Magic Unlocked! 🎉</h3>
            <p>Your wishes are ready to be written down.</p>
            <button className="reset-btn" onClick={handleReset}>
              Relight Candles
            </button>
          </div>
        ) : (
          <p className="blow-instructions text-pulse" aria-live="polite">
            🎂 Click each candle to blow it out!
          </p>
        )}
      </div>
    </div>
  );
};
