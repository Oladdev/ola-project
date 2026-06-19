import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  shape: 'circle' | 'square' | 'triangle';
}

export interface ConfettiRef {
  explode: (x: number, y: number) => void;
}

const COLORS = [
  '#FF3366', '#FF9933', '#FFFF33', '#33CC33', '#3399FF',
  '#9933FF', '#FF33CC', '#FF007F', '#00F5FF', '#FFD700'
];

export const ConfettiCanvas = forwardRef<ConfettiRef>((_, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const isAnimatingRef = useRef(false);

  /**
   * Start the animation loop only when particles exist.
   * This prevents a perpetual requestAnimationFrame when idle
   * (the original ran indefinitely with drift particle spawning).
   */
  const startAnimationLoop = () => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    animate();
  };

  const explode = (x: number, y: number) => {
    const newParticles: Particle[] = [];
    const count = 120;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 8;
      const size = 5 + Math.random() * 8;
      const shapeRand = Math.random();
      const shape = shapeRand < 0.33 ? 'circle' : shapeRand < 0.66 ? 'square' : 'triangle';

      newParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (2 + Math.random() * 4), // Initial upward boost
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        opacity: 1,
        shape,
      });
    }

    particlesRef.current = [...particlesRef.current, ...newParticles];
    startAnimationLoop();
  };

  useImperativeHandle(ref, () => ({
    explode,
  }));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const particles = particlesRef.current;
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];

      // Physics update
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15; // Gravity
      p.vx *= 0.98; // Friction
      p.rotation += p.rotationSpeed;
      p.opacity -= 0.008; // Fade out

      if (p.opacity <= 0 || p.y > canvas.height || p.x < 0 || p.x > canvas.width) {
        particles.splice(i, 1);
        continue;
      }

      // Draw particle
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;

      ctx.beginPath();
      if (p.shape === 'circle') {
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 'square') {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      } else if (p.shape === 'triangle') {
        ctx.moveTo(0, -p.size / 2);
        ctx.lineTo(p.size / 2, p.size / 2);
        ctx.lineTo(-p.size / 2, p.size / 2);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    // Ambient drift — only while active particles exist (avoids perpetual loop)
    if (particles.length > 0 && Math.random() < 0.1 && particles.length < 150) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -10,
        vx: (Math.random() - 0.5) * 1.5,
        vy: 1 + Math.random() * 2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 4 + Math.random() * 5,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 5,
        opacity: 0.8,
        shape: Math.random() < 0.5 ? 'circle' : 'square',
      });
    }

    // Stop the loop when all particles have faded
    if (particles.length === 0) {
      isAnimatingRef.current = false;
      return;
    }

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      isAnimatingRef.current = false;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
      aria-hidden="true"
    />
  );
});

ConfettiCanvas.displayName = 'ConfettiCanvas';
