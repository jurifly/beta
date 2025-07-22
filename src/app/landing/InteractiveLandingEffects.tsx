
'use client';

import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const CustomCursor = () => {
    const cursorRef = useRef<HTMLDivElement>(null);
    const followerRef = useRef<HTMLDivElement>(null);

    const x = useMotionValue(-100);
    const y = useMotionValue(-100);
    
    const followerX = useSpring(x, { stiffness: 150, damping: 20 });
    const followerY = useSpring(y, { stiffness: 150, damping: 20 });

    useEffect(() => {
        const moveCursor = (e: MouseEvent) => {
            x.set(e.clientX);
            y.set(e.clientY);
        };
        window.addEventListener('mousemove', moveCursor);
        return () => window.removeEventListener('mousemove', moveCursor);
    }, [x, y]);

    return (
        <>
            <motion.div
                ref={cursorRef}
                style={{ translateX: x, translateY: y }}
                className="fixed top-0 left-0 w-3 h-3 bg-primary rounded-full pointer-events-none z-[9999]"
            />
            <motion.div
                ref={followerRef}
                style={{ translateX: followerX, translateY: followerY }}
                className="fixed top-0 left-0 w-8 h-8 border-2 border-primary rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2"
            />
        </>
    );
}

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
        <CustomCursor />
    </>
  );
}
