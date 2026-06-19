import React, { useState, useEffect, useRef } from 'react';
import './Cake3D.css';

interface Cake3DProps {
  onCakeBlownOut: () => void;
  authorName: string;
  setAuthorName: (val: string) => void;
  newWishText: string;
  setNewWishText: (val: string) => void;
  handleWishSubmit: (e: React.FormEvent) => void;
}

interface CandleState {
  id: number;
  isLit: boolean;
  x: number; // percentage left on the top of the cake
  y: number; // percentage top on the top of the cake
  height: number;
}

export const Cake3D: React.FC<Cake3DProps> = ({
  onCakeBlownOut,
  authorName,
  setAuthorName,
  newWishText,
  setNewWishText,
  handleWishSubmit,
}) => {
  const [candles, setCandles] = useState<CandleState[]>([
    { id: 1, isLit: true, x: 30, y: 35, height: 45 },
    { id: 2, isLit: true, x: 45, y: 25, height: 50 },
    { id: 3, isLit: true, x: 65, y: 30, height: 40 },
    { id: 4, isLit: true, x: 40, y: 55, height: 48 },
    { id: 5, isLit: true, x: 60, y: 50, height: 42 },
  ]);
  const [allExtinguished, setAllExtinguished] = useState(false);

  /**
   * Shared AudioContext — reused across all candle blow-out sounds.
   * Avoids the browser-cap bug where each click created a new context
   * (Chrome limits to ~6 concurrent AudioContext instances).
   */
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioContext = (): AudioContext | null => {
    try {
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return null;
        audioCtxRef.current = new AudioCtx();
      }
      return audioCtxRef.current;
    } catch {
      return null;
    }
  };

  // Clean up AudioContext on unmount
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    };
  }, []);

  const extinguishCandle = (id: number) => {
    setCandles((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isLit: false } : c))
    );

    // Quick synthesis pop for audio feedback — Emil frequency gate:
    // candle clicks are occasional, so a short sound is appropriate
    const ctx = getAudioContext();
    if (ctx) {
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
            {[...candles]
              .sort((a, b) => a.y - b.y)
              .map((c) => (
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
          <div className="greetings-bubble">
            <h3 className="glow-text">Magic Unlocked!</h3>
            <p style={{ marginBottom: '16px' }}>Your wishes are ready to be written down.</p>
            
            <form onSubmit={handleWishSubmit} className="wish-form" style={{ maxWidth: '400px', width: '100%', margin: '0 auto 16px auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input
                type="text"
                placeholder="Your Name"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="form-input"
                required
                aria-label="Your Name"
                id="wish-author-input"
                style={{ width: '100%' }}
              />
              <textarea
                placeholder="Write your wishes and thoughts here..."
                value={newWishText}
                onChange={(e) => setNewWishText(e.target.value)}
                className="form-textarea"
                required
                aria-label="Birthday wish text content"
                id="wish-text-textarea"
                style={{ width: '100%', minHeight: '80px', resize: 'vertical' }}
              />
              <button type="submit" className="submit-btn" disabled={!newWishText.trim() || !authorName.trim()} style={{ width: '100%' }}>
                Leave a Wish
              </button>
            </form>

            <button className="reset-btn" onClick={handleReset}>
              Relight Candles
            </button>
          </div>
        ) : (
          <p className="blow-instructions text-pulse" aria-live="polite">
            Click each candle to blow it out!
          </p>
        )}
      </div>
    </div>
  );
};
