
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { ReactNode } from 'react';

export const PageTransition = ({
  children,
  pathname,
}: {
  children: ReactNode;
  pathname: string;
}) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial="initialState"
        animate="animateState"
        exit="exitState"
        transition={{
          duration: 0.5,
          ease: 'easeInOut',
        }}
        variants={{
          initialState: {
            opacity: 0,
            y: 20,
          },
          animateState: {
            opacity: 1,
            y: 0,
          },
          exitState: {
            opacity: 0,
            y: -20,
          },
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
