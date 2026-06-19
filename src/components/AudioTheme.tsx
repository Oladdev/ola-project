import React, { useState, useEffect, useRef } from 'react';
import './AudioTheme.css';

export const AudioTheme: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<number | null>(null);
  const padIntervalRef = useRef<number | null>(null);

  // Synthesize a chime sound (music box style)
  const playChime = (ctx: AudioContext, frequency: number, time: number, duration = 1.5) => {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    // Use triangle or sine wave for soft sound
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, time);

    // Chime envelope: fast attack, long exponential decay
    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(0.15, time + 0.05); // low volume
    gainNode.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    // Add a subtle high-frequency harmonic to make it sound metallic/magical
    const harmonic = ctx.createOscillator();
    const harmonicGain = ctx.createGain();
    harmonic.type = 'sine';
    harmonic.frequency.setValueAtTime(frequency * 2, time);
    harmonicGain.gain.setValueAtTime(0, time);
    harmonicGain.gain.linearRampToValueAtTime(0.04, time + 0.03);
    harmonicGain.gain.exponentialRampToValueAtTime(0.0001, time + duration * 0.5);

    // Delay/Reverb approximation using feedback loop
    const delay = ctx.createDelay();
    delay.delayTime.value = 0.35;
    const delayGain = ctx.createGain();
    delayGain.gain.value = 0.3; // feedback factor

    osc.connect(gainNode);
    harmonic.connect(harmonicGain);
    
    gainNode.connect(ctx.destination);
    harmonicGain.connect(ctx.destination);

    // Connect delay loop
    gainNode.connect(delay);
    delay.connect(delayGain);
    delayGain.connect(delay);
    delayGain.connect(ctx.destination);

    osc.start(time);
    osc.stop(time + duration);
    harmonic.start(time);
    harmonic.stop(time + duration);
  };

  // Ambient pad chord progression (warm synth)
  const playPad = (ctx: AudioContext, freqs: number[], time: number, duration = 6) => {
    freqs.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(350, time); // warm, dark filter
      filter.Q.setValueAtTime(1, time);

      // Pad envelope: slow attack, slow release
      gainNode.gain.setValueAtTime(0, time);
      gainNode.gain.linearRampToValueAtTime(0.03, time + 2); // very soft
      gainNode.gain.setValueAtTime(0.03, time + duration - 2);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, time + duration);

      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + duration);
    });
  };

  const startSoundtrack = () => {
    // Initialize AudioContext
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    audioCtxRef.current = ctx;

    // Happy Birthday melody in C major / F major style
    // Notes: C4, C4, D4, C4, F4, E4
    // Frequencies: C4=261.63, D4=293.66, E4=329.63, F4=349.23, G4=392.00, A4=440.00, B4=493.88, C5=523.25
    const melody = [
      { note: 261.63, dur: 0.5 }, { note: 261.63, dur: 0.5 }, { note: 293.66, dur: 1.0 }, 
      { note: 261.63, dur: 1.0 }, { note: 349.23, dur: 1.0 }, { note: 329.63, dur: 2.0 },
      
      { note: 261.63, dur: 0.5 }, { note: 261.63, dur: 0.5 }, { note: 293.66, dur: 1.0 }, 
      { note: 261.63, dur: 1.0 }, { note: 392.00, dur: 1.0 }, { note: 349.23, dur: 2.0 },

      { note: 261.63, dur: 0.5 }, { note: 261.63, dur: 0.5 }, { note: 523.25, dur: 1.0 }, 
      { note: 440.00, dur: 1.0 }, { note: 349.23, dur: 1.0 }, { note: 329.63, dur: 1.0 }, { note: 293.66, dur: 2.0 },

      { note: 466.16, dur: 0.5 }, { note: 466.16, dur: 0.5 }, { note: 440.00, dur: 1.0 }, 
      { note: 349.23, dur: 1.0 }, { note: 392.00, dur: 1.0 }, { note: 349.23, dur: 3.0 }
    ];

    let melodyIndex = 0;
    let nextMelodyTime = ctx.currentTime + 1;

    // Pad progressions: Fmaj7 (174.61, 220.00, 261.63, 329.63), Cmaj (130.81, 164.81, 196.00, 261.63), Gmaj (146.83, 196.00, 246.94, 293.66), Amin (110.00, 164.81, 220.00, 261.63)
    const chords = [
      [174.61, 220.00, 261.63, 329.63], // Fmaj7
      [130.81, 196.00, 261.63, 329.63], // Cmaj
      [146.83, 196.00, 246.94, 293.66], // Gmaj
      [110.00, 164.81, 220.00, 261.63]  // Amin
    ];
    let chordIndex = 0;
    let nextChordTime = ctx.currentTime;

    // Pad schedule loop (runs every 5 seconds, triggers 6s duration pads)
    const schedulePads = () => {
      if (ctx.state === 'suspended') return;
      const current = ctx.currentTime;
      if (current >= nextChordTime - 0.5) {
        const chord = chords[chordIndex];
        playPad(ctx, chord, nextChordTime, 6.2);
        chordIndex = (chordIndex + 1) % chords.length;
        nextChordTime += 5.5;
      }
    };
    
    padIntervalRef.current = window.setInterval(schedulePads, 2000);
    // Initial call
    schedulePads();

    // Chime scheduler
    const scheduleMelody = () => {
      if (ctx.state === 'suspended') return;
      const current = ctx.currentTime;
      
      // Schedule next notes ahead
      while (nextMelodyTime < current + 1) {
        const item = melody[melodyIndex];
        // Play chime note
        playChime(ctx, item.note, nextMelodyTime, item.dur * 2.5);
        
        nextMelodyTime += item.dur * 1.5; // step forward in time
        melodyIndex = (melodyIndex + 1) % melody.length;
        
        // Add a longer pause when starting the melody over
        if (melodyIndex === 0) {
          nextMelodyTime += 8; 
        }
      }
    };

    intervalRef.current = window.setInterval(scheduleMelody, 200);
  };

  const stopSoundtrack = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (padIntervalRef.current) {
      clearInterval(padIntervalRef.current);
      padIntervalRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
  };

  const togglePlayback = () => {
    if (isPlaying) {
      stopSoundtrack();
      setIsPlaying(false);
    } else {
      startSoundtrack();
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    return () => {
      stopSoundtrack();
    };
  }, []);

  return (
    <button
      onClick={togglePlayback}
      className={`audio-toggle-btn ${isPlaying ? 'playing' : ''}`}
      aria-label={isPlaying ? 'Mute background theme' : 'Play ambient background theme'}
      title={isPlaying ? 'Mute background music' : 'Play background music'}
      id="audio-theme-toggle"
    >
      <div className="audio-icon-container">
        {isPlaying ? (
          <div className="audio-wave" aria-hidden="true">
            <span className="bar bar1"></span>
            <span className="bar bar2"></span>
            <span className="bar bar3"></span>
            <span className="bar bar4"></span>
          </div>
        ) : (
          <svg
            className="play-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            width="20"
            height="20"
            aria-hidden="true"
          >
            <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.063.922-2.063 2.063v4.874c0 1.141.922 2.063 2.063 2.063h1.932l4.5 4.5c.944.945 2.56.276 2.56-1.06V4.06zM17.78 9.22a.75.75 0 10-1.06 1.06L18.44 12l-1.72 1.72a.75.75 0 001.06 1.06l1.72-1.72 1.72 1.72a.75.75 0 101.06-1.06L20.56 12l1.72-1.72a.75.75 0 00-1.06-1.06l-1.72 1.72-1.72-1.72z" />
          </svg>
        )}
      </div>
      <span className="btn-text">{isPlaying ? 'Mute Music' : 'Play Music'}</span>
    </button>
  );
};
