
'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';

export function CreatureAnimation() {
  const creatureRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current || typeof window === 'undefined' || !creatureRef.current) return;
    
    // Check if anime is loaded
    if (typeof (window as any).anime !== 'function') {
        // If not, we'll wait for the script to load.
        // The Script component's onLoad will trigger initialization.
        return;
    }

    const initAnimation = () => {
        if (isInitialized.current || !creatureRef.current) return;
        isInitialized.current = true;
        
        const anime = (window as any).anime;
        const { animate, createTimeline, createTimer, stagger, utils } = anime;

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

        const scaleStagger = stagger([2, 5], { ease: 'inQuad', grid, from });
        const opacityStagger = stagger([1, .1], { grid, from });

        utils.set(creatureEl, {
          width: rows * 10 + 'em',
          height: rows * 10 + 'em'
        });

        utils.set(particuleEls, {
          x: (el: any, i: number) => (i % rows) * 10 - (rows * 5),
          y: (el: any, i: number) => Math.floor(i / rows) * 10 - (rows * 5),
          scale: scaleStagger,
          opacity: opacityStagger,
          background: stagger(['hsl(4, 70%, 80%)', 'hsl(4, 70%, 20%)'], { grid, from }),
          boxShadow: stagger([8, 1], { grid, from,
            modifier: (v: number) => `0px 0px ${utils.round(v, 0)}em 0px var(--red)`,
          }),
          zIndex: stagger([1, rows * rows], { grid, from, modifier: (v:number) => utils.round(v, 0) }),
        });
        
        const mainLoop = createTimer({
          frameRate: 15,
          onUpdate: () => {
            animate(particuleEls, {
              x: cursor.x - (viewport.w * 0.5),
              y: cursor.y - (viewport.h * 0.5),
              delay: stagger(40, { grid, from }),
              duration: stagger(120, { start: 750, ease: 'inQuad', grid, from }),
              ease: 'inOutQuad',
              composition: 'blend',
            });
          }
        });
        
        const followPointer = (e: MouseEvent | TouchEvent) => {
            const event = 'touches' in e ? e.touches[0] : e;
            cursor.x = event.pageX;
            cursor.y = event.pageY;
        }

        document.addEventListener('mousemove', followPointer);
        document.addEventListener('touchmove', followPointer);

        return () => {
            document.removeEventListener('mousemove', followPointer);
            document.removeEventListener('touchmove', followPointer);
            mainLoop.destroy();
        }
    };
    
    // Initial call
    initAnimation();
  }, []);

  const handleScriptLoad = () => {
      // This function will be called when the anime.js script loads
      if (typeof window !== 'undefined' && creatureRef.current && !isInitialized.current) {
          const initAnimation = () => {
              if (isInitialized.current || !creatureRef.current) return;
              isInitialized.current = true;
              
              const anime = (window as any).anime;
              const { animate, createTimeline, createTimer, stagger, utils } = anime;

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
              const scaleStagger = stagger([2, 5], { ease: 'inQuad', grid, from });
              const opacityStagger = stagger([1, .1], { grid, from });

              utils.set(creatureEl, {
                width: rows * 10 + 'em',
                height: rows * 10 + 'em'
              });

              utils.set(particuleEls, {
                x: (el: any, i: number) => (i % rows) * 10 - (rows * 5),
                y: (el: any, i: number) => Math.floor(i / rows) * 10 - (rows * 5),
                scale: scaleStagger,
                opacity: opacityStagger,
                background: stagger(['hsl(4, 70%, 80%)', 'hsl(4, 70%, 20%)'], { grid, from }),
                boxShadow: stagger([8, 1], { grid, from,
                  modifier: (v: number) => `0px 0px ${utils.round(v, 0)}em 0px var(--red)`,
                }),
                zIndex: stagger([1, rows * rows], { grid, from, modifier: (v:number) => utils.round(v, 0) }),
              });
              
              const mainLoop = createTimer({
                frameRate: 15,
                onUpdate: () => {
                  animate(particuleEls, {
                    x: cursor.x - (viewport.w * 0.5),
                    y: cursor.y - (viewport.h * 0.5),
                    delay: stagger(40, { grid, from }),
                    duration: stagger(120, { start: 750, ease: 'inQuad', grid, from }),
                    ease: 'inOutQuad',
                    composition: 'blend',
                  });
                }
              });
              
              const followPointer = (e: MouseEvent | TouchEvent) => {
                  const event = 'touches' in e ? e.touches[0] : e;
                  cursor.x = event.pageX;
                  cursor.y = event.pageY;
              }

              document.addEventListener('mousemove', followPointer);
              document.addEventListener('touchmove', followPointer);

              return () => {
                  document.removeEventListener('mousemove', followPointer);
                  document.removeEventListener('touchmove', followPointer);
                  mainLoop.destroy();
              }
          };
          initAnimation();
      }
  };


  return (
    <>
      <Script
        src="https://esm.sh/animejs"
        strategy="lazyOnload"
        onLoad={handleScriptLoad}
      />
      <div id="creature-wrapper" className="-z-10">
        <div id="creature" ref={creatureRef}></div>
      </div>
    </>
  );
}
