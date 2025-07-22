
'use client';

import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { cn } from '@/lib/utils';

const CustomCursor = () => {
    const cursorRef = useRef<HTMLDivElement>(null);
    const followerRef = useRef<HTMLDivElement>(null);

    const x = useMotionValue(-100);
    const y = useMotionValue(-100);
    
    // Make the follower more responsive
    const followerX = useSpring(x, { stiffness: 500, damping: 30 });
    const followerY = useSpring(y, { stiffness: 500, damping: 30 });

    useEffect(() => {
        const moveCursor = (e: MouseEvent) => {
            x.set(e.clientX);
            y.set(e.clientY);
        };
        
        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.matches('[data-cursor-size="large"]')) {
                followerRef.current?.classList.add('scale-150');
            }
        };
        
        const handleMouseOut = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.matches('[data-cursor-size="large"]')) {
                followerRef.current?.classList.remove('scale-150');
            }
        };

        window.addEventListener('mousemove', moveCursor);
        document.addEventListener('mouseover', handleMouseOver);
        document.addEventListener('mouseout', handleMouseOut);
        
        return () => {
            window.removeEventListener('mousemove', moveCursor);
            document.removeEventListener('mouseover', handleMouseOver);
            document.removeEventListener('mouseout', handleMouseOut);
        };
    }, [x, y]);

    return (
        <>
            <motion.div
                ref={cursorRef}
                style={{ translateX: x, translateY: y, x: '-50%', y: '-50%' }}
                className="fixed top-0 left-0 w-3 h-3 bg-primary rounded-full pointer-events-none z-[9999]"
            />
            <motion.div
                ref={followerRef}
                style={{ translateX: followerX, translateY: followerY, x: '-50%', y: '-50%' }}
                className="fixed top-0 left-0 w-8 h-8 border-2 border-primary rounded-full pointer-events-none z-[9999] transition-transform duration-300 ease-in-out"
            />
        </>
    );
}

const ParticleCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: any[] = [];
    const particleCount = 50;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    class Particle {
      x: number;
      y: number;
      size: number;
      baseX: number;
      baseY: number;
      density: number;
      color: string;

      constructor(x: number, y: number, color: string) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 1.5 + 1;
        this.baseX = this.x;
        this.baseY = this.y;
        this.density = (Math.random() * 30) + 1;
        this.color = color;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
      }

      update() {
        const dx = mouse.current.x - this.x;
        const dy = mouse.current.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const forceDirectionX = dx / distance;
        const forceDirectionY = dy / distance;
        const maxDistance = 100;
        const force = (maxDistance - distance) / maxDistance;
        const directionX = forceDirectionX * force * this.density;
        const directionY = forceDirectionY * force * this.density;

        if (distance < maxDistance) {
          this.x -= directionX;
          this.y -= directionY;
        } else {
          if (this.x !== this.baseX) {
            const dx = this.x - this.baseX;
            this.x -= dx / 10;
          }
          if (this.y !== this.baseY) {
            const dy = this.y - this.baseY;
            this.y -= dy / 10;
          }
        }
      }
    }

    const init = () => {
      particles = [];
      // Use CSS variables for theme-aware particle colors
      const particleColor = getComputedStyle(document.documentElement).getPropertyValue('--foreground').trim();
      for (let i = 0; i < particleCount; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        particles.push(new Particle(x, y, particleColor));
      }
    };
    init();

    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }
      requestAnimationFrame(animate);
    };
    animate();

    // Re-initialize particles on theme change
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class') {
                setTimeout(init, 100);
            }
        });
    });
    observer.observe(document.documentElement, { attributes: true });


    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      observer.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10 opacity-20" />;
};


export function InteractiveLandingEffects() {
  const blobRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const blob = blobRef.current;
    if (!blob) return;

    const handlePointerMove = (event: PointerEvent) => {
      const { clientX, clientY } = event;
      blob.animate(
        {
          left: `${clientX}px`,
          top: `${clientY}px`,
        },
        { duration: 4000, fill: "forwards" }
      );
    };

    window.addEventListener("pointermove", handlePointerMove);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, []);
  
  const blobStyles: React.CSSProperties = {
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      position: 'absolute',
      width: '30vmax',
      aspectRatio: '1',
      background: 'linear-gradient(to right, hsl(var(--primary)), hsl(var(--accent)))',
      animation: 'rotate 20s infinite',
      borderRadius: '50%',
      filter: 'blur(100px)',
      opacity: 0.25,
      zIndex: -1,
  };
  
  const keyframes = `
    @keyframes rotate {
      from {
        transform: translate(-50%, -50%) rotate(0deg);
      }
      to {
        transform: translate(-50%, -50%) rotate(360deg);
      }
    }
  `;

  return (
    <>
        <style>{keyframes}</style>
        <div ref={blobRef} style={blobStyles}></div>
        <ParticleCanvas />
        <CustomCursor />
    </>
  );
}
