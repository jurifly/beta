
'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

const InteractiveLandingEffects = () => {
    const cursorRef = useRef<HTMLDivElement>(null);
    const creatureRef = useRef<HTMLDivElement>(null);
    const [isLandingPage, setIsLandingPage] = useState(true);

    const springConfig = { damping: 30, stiffness: 200, mass: 0.5 };

    const mouse = {
        x: useSpring(0, springConfig),
        y: useSpring(0, springConfig),
    };
    
    const creatureMouse = {
        x: useSpring(0, { ...springConfig, stiffness: 100 }),
        y: useSpring(0, { ...springConfig, stiffness: 100 }),
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isLandingPage) return;
            const { clientX, clientY } = e;
            mouse.x.set(clientX);
            mouse.y.set(clientY);
            creatureMouse.x.set(clientX);
            creatureMouse.y.set(clientY);
        };

        const checkRoute = () => {
            setIsLandingPage(window.location.pathname === '/landing' || window.location.pathname === '/');
        };

        checkRoute();
        
        window.addEventListener('mousemove', handleMouseMove);
        
        const observer = new MutationObserver(checkRoute);
        observer.observe(document, { childList: true, subtree: true });

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            observer.disconnect();
        };
    }, [mouse.x, mouse.y, creatureMouse.x, creatureMouse.y, isLandingPage]);
    
    useEffect(() => {
        if (!cursorRef.current || !isLandingPage) return;

        let scale = 1;
        const main = document.querySelector('.landing-page-cursor-area');

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.closest('button, a, [data-cursor-size="large"]')) {
                scale = 3;
            } else if (target.closest('[data-cursor-size="medium"]')) {
                scale = 2;
            }
             if (cursorRef.current) {
                cursorRef.current.style.transform = `translate(-50%, -50%) scale(${scale})`;
            }
        };

        const handleMouseOut = () => {
            scale = 1;
            if (cursorRef.current) {
                cursorRef.current.style.transform = `translate(-50%, -50%) scale(${scale})`;
            }
        };

        if (main) {
            main.addEventListener('mouseover', handleMouseOver);
            main.addEventListener('mouseout', handleMouseOut);
        }

        return () => {
             if (main) {
                main.removeEventListener('mouseover', handleMouseOver);
                main.removeEventListener('mouseout', handleMouseOut);
            }
        };
    }, [isLandingPage]);

    if (!isLandingPage) return null;
    
    return (
        <>
            <motion.div
                ref={cursorRef}
                style={{
                    left: mouse.x,
                    top: mouse.y,
                }}
                className="fixed w-4 h-4 bg-primary rounded-full pointer-events-none z-[1000] hidden md:block"
            />
             <motion.div
                ref={creatureRef}
                style={{
                    left: creatureMouse.x,
                    top: creatureMouse.y,
                }}
                className="fixed w-40 h-40 opacity-20 pointer-events-none z-[998] hidden md:block"
            >
               <div className="w-full h-full bg-primary/20 rounded-full blur-[80px]"/>
            </motion.div>
        </>
    );
};

export { InteractiveLandingEffects };
