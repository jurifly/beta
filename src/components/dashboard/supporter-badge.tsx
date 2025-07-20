
'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

class Particle {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;

  constructor(x: number, y: number, angle: number, speed: number, color: string) {
    this.x = x;
    this.y = y;
    this.radius = 1 + Math.random() * 2;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.alpha = 1;
    this.color = color;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.05; // gravity
    this.alpha -= 0.02;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

const supporterBadgeStyles = `
.supporter-badge-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  position: relative;
}

.username-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.username-shimmer {
  font-size: 15px;
  font-weight: 600;
  background: linear-gradient(90deg, #8b5cf6, #6366f1, #d946ef, #8b5cf6);
  background-size: 300% 300%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: textGradient 5s ease-in-out infinite;
  position: relative;
  z-index: 2;
  padding: 0 6px;
}

.username-glow {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  width: 120%;
  height: 120%;
  transform: translateY(-50%);
  background: radial-gradient(ellipse at center, rgba(168, 85, 247, 0.1), transparent 70%);
  animation: glowSweep 6s ease-in-out infinite;
  z-index: 1;
  pointer-events: none;
  filter: blur(4px);
}
`;


export function SupporterBadge({ username }: { username: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const particles = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const badge = badgeRef.current;
    if (!canvas || !badge) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const resizeCanvasToBadge = () => {
      canvas.width = badge.clientWidth;
      canvas.height = badge.clientHeight;
    };
    resizeCanvasToBadge();

    const colors = ["#f472b6", "#facc15", "#c084fc", "#60a5fa", "#34d399"];
    
    const spawnFirework = () => {
      const x = canvas.width / 2 + (Math.random() - 0.5) * canvas.width * 0.6;
      const y = canvas.height / 2 + (Math.random() - 0.5) * canvas.height * 0.4;
      const count = 20 + Math.floor(Math.random() * 10);
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * 2 * Math.PI;
        const speed = Math.random() * 2 + 0.5;
        const color = colors[Math.floor(Math.random() * colors.length)];
        particles.current.push(new Particle(x, y, angle, speed, color));
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.current = particles.current.filter(p => p.alpha > 0);
      particles.current.forEach(p => {
        p.update();
        p.draw(ctx);
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    const spawnInterval = setInterval(spawnFirework, 1000);
    animate();
    
    window.addEventListener('resize', resizeCanvasToBadge);

    return () => {
      clearInterval(spawnInterval);
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvasToBadge);
    };
  }, []);

  return (
    <>
      <style>{supporterBadgeStyles}</style>
      <div className="supporter-badge-wrapper" ref={badgeRef}>
        <canvas ref={canvasRef} id="fireworks-canvas"></canvas>
        <div className="username-wrapper">
          <span style={{ marginTop: '-3px', marginRight: '-5px' }}>👑</span>
          <span className="username-shimmer">{username}</span>
          <span className="username-glow"></span>
        </div>
      </div>
    </>
  );
}
