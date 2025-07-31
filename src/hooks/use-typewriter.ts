
'use client';

import { useState, useEffect } from 'react';

/**
 * A custom hook that simulates a typewriter effect for a given string.
 * @param text The text to be animated.
 * @param speed The delay between each character in milliseconds. Defaults to 20ms.
 * @returns The currently displayed text.
 */
export function useTypewriter(text: string, speed: number = 10) {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    setDisplayText(''); // Reset display text when the input text changes
    if (!text) return;

    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < text.length) {
        setDisplayText(prev => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, speed);

    // Cleanup on component unmount or when text/speed changes
    return () => {
      clearInterval(typingInterval);
    };
  }, [text, speed]);

  return displayText;
}
