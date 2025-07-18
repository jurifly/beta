
'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';

export function CreatureAnimation() {
  const creatureRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  const initAnimation = () => {
      if (isInitialized.current || !creatureRef.current || typeof (window as any).anime !== 'function') return;
      
      isInitialized.current = true;
      const anime = (window as any).anime;

      const creatureEl = creatureRef.current;
      const viewport = { w: window.innerWidth, h: window.innerHeight };
      const cursor = { x: viewport.w / 2, y: viewport.h / 2 };
      const rows = 13;
      const grid = [rows, rows];
      const from = 'center';
      
      creatureEl.innerHTML = '';
      for (let i = 0; i < (rows * rows); i++) {
        creatureEl.appendChild(document.createElement('div'));
      }

      const particuleEls = creatureEl.querySelectorAll('div');

      const scaleStagger = anime.stagger([2, 5], { ease: 'inQuad', grid, from });
      const opacityStagger = anime.stagger([1, .1], { grid, from });

      anime.set(creatureEl, {
        width: rows * 10 + 'em',
        height: rows * 10 + 'em'
      });

      anime.set(particuleEls, {
        x: (el: any, i: number) => (i % rows) * 10 - (rows * 5),
        y: (el: any, i: number) => Math.floor(i / rows) * 10 - (rows * 5),
        scale: scaleStagger,
        opacity: opacityStagger,
        background: anime.stagger(['hsl(4, 70%, 80%)', 'hsl(4, 70%, 20%)'], { grid, from }),
        boxShadow: anime.stagger([8, 1], { grid, from,
          modifier: (v: number) => `0px 0px ${anime.round(v, 0)}em 0px var(--red)`,
        }),
        zIndex: anime.stagger([1, rows * rows], { grid, from, modifier: (v:number) => anime.round(v, 0) }),
      });
      
      const mainLoop = anime.timeline({
          loop: true,
          direction: 'alternate',
      }).add({
          targets: particuleEls,
          x: () => anime.random(-viewport.w/2, viewport.w/2),
          y: () => anime.random(-viewport.h/2, viewport.h/2),
          delay: anime.stagger(200, {grid: grid, from: from}),
          duration: 1000,
          easing: 'easeInOutQuad'
      })
      
      const followPointer = (e: MouseEvent | TouchEvent) => {
          const event = 'touches' in e ? e.touches[0] : e;
          if (event) {
             anime.set(creatureEl, {
                translateX: event.clientX,
                translateY: event.clientY,
            });
          }
      }

      document.addEventListener('mousemove', followPointer);
      document.addEventListener('touchmove', followPointer);

      return () => {
          document.removeEventListener('mousemove', followPointer);
          document.removeEventListener('touchmove', followPointer);
          anime.remove(creatureEl);
      }
  };

  useEffect(() => {
    initAnimation();
  }, []);

  const handleScriptLoad = () => {
    initAnimation();
  };

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/animejs@3.2.1/lib/anime.min.js"
        strategy="lazyOnload"
        onLoad={handleScriptLoad}
      />
      <div id="creature-wrapper" className="-z-10">
        <div id="creature" ref={creatureRef}></div>
      </div>
    </>
  );
}
