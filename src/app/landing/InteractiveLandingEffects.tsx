
'use client';

import { useEffect, useRef } from 'react';

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
        { duration: 3000, fill: "forwards" }
      );
    };

    window.addEventListener("pointermove", handlePointerMove);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, []);
  
  const cursorStyles: React.CSSProperties = {
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      position: 'absolute',
      width: '30vmax',
      aspectRatio: '1',
      background: 'linear-gradient(to right, hsl(var(--primary)), hsl(var(--accent)))',
      animation: 'rotate 20s infinite',
      borderRadius: '50%',
      filter: 'blur(80px)',
      opacity: 0.3,
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
        <div ref={blobRef} style={cursorStyles}></div>
    </>
  );
}
