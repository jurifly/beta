
'use client';

import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { cn } from '@/lib/utils';

const CustomCursor = () => {
    const cursorRef = useRef<HTMLDivElement>(null);

    const x = useMotionValue(-100);
    const y = useMotionValue(-100);

    useEffect(() => {
        const moveCursor = (e: MouseEvent) => {
            x.set(e.clientX);
            y.set(e.clientY);
        };
        
        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (cursorRef.current && target.matches('h1, h2, h3, p, a, button, blockquote, [data-cursor-size="large"]')) {
                const style = window.getComputedStyle(target);
                const fontSize = parseFloat(style.fontSize);
                const size = fontSize * 3;
                cursorRef.current.style.width = `${size}px`;
                cursorRef.current.style.height = `${size}px`;
                cursorRef.current.style.opacity = '1';
                cursorRef.current.classList.add('mix-blend-difference', 'bg-white');
                cursorRef.current.classList.remove('bg-primary');
            }
        };
        
        const handleMouseOut = (e: MouseEvent) => {
             const target = e.target as HTMLElement;
            if (cursorRef.current && target.matches('h1, h2, h3, p, a, button, blockquote, [data-cursor-size="large"]')) {
                cursorRef.current.style.width = '12px';
                cursorRef.current.style.height = '12px';
                cursorRef.current.style.opacity = '1';
                cursorRef.current.classList.remove('mix-blend-difference', 'bg-white');
                cursorRef.current.classList.add('bg-primary');
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
        <motion.div
            ref={cursorRef}
            style={{ translateX: x, translateY: y, x: '-50%', y: '-50%' }}
            className="fixed top-0 left-0 w-3 h-3 bg-primary rounded-full pointer-events-none z-[9999] transition-[width,height,opacity] duration-300 ease-in-out"
        />
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
    const particleCount = 70;

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
      vx: number;
      vy: number;

      constructor(x: number, y: number, color: string) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 1.5 + 0.8;
        this.baseX = this.x;
        this.baseY = this.y;
        this.density = (Math.random() * 40) + 5;
        this.color = color;
        this.vx = (Math.random() - 0.5) * 0.2;
        this.vy = (Math.random() - 0.5) * 0.2;
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
        // Random drifting
        this.x += this.vx;
        this.y += this.vy;

        // Wall collision
        if (this.x > canvas.width || this.x < 0) this.vx *= -1;
        if (this.y > canvas.height || this.y < 0) this.vy *= -1;
        
        // Mouse interaction
        const dx = mouse.current.x - this.x;
        const dy = mouse.current.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const forceDirectionX = dx / distance;
        const forceDirectionY = dy / distance;
        const maxDistance = 120;
        const force = (maxDistance - distance) / maxDistance;
        const directionX = forceDirectionX * force * this.density;
        const directionY = forceDirectionY * force * this.density;

        if (distance < maxDistance) {
          this.x -= directionX * 0.1;
          this.y -= directionY * 0.1;
        } else {
            // Return to near base position
             if (Math.abs(this.x - this.baseX) > 10) {
                 this.vx += (this.baseX - this.x) * 0.001;
             }
             if (Math.abs(this.y - this.baseY) > 10) {
                 this.vy += (this.baseY - this.y) * 0.001;
             }
        }
      }
    }
    
    let particleColor = 'rgba(255, 255, 255, 0.5)';

    const init = () => {
      particles = [];
      const isDark = document.documentElement.classList.contains('dark');
      particleColor = isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)';

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

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10 opacity-70" />;
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
  
  return (
    <>
        <div ref={blobRef} className="background-blob"></div>
        <ParticleCanvas />
        <CustomCursor />
    </>
  );
}
