'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export default function PageTransition({ children, className = '' }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: 0.3,
        ease: 'easeInOut'
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function FadeIn({ children, className = '', delay = 0 }: PageTransitionProps & { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.5,
        delay,
        ease: 'easeOut'
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function SlideIn({ 
  children, 
  className = '', 
  direction = 'left',
  delay = 0 
}: PageTransitionProps & { 
  direction?: 'left' | 'right' | 'up' | 'down';
  delay?: number;
}) {
  const variants = {
    left: { x: -50 },
    right: { x: 50 },
    up: { y: -50 },
    down: { y: 50 }
  };

  return (
    <motion.div
      initial={{ 
        opacity: 0,
        ...variants[direction]
      }}
      animate={{ 
        opacity: 1,
        x: 0,
        y: 0
      }}
      transition={{
        duration: 0.5,
        delay,
        ease: 'easeOut'
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ScaleIn({ 
  children, 
  className = '', 
  delay = 0 
}: PageTransitionProps & { 
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ 
        opacity: 0,
        scale: 0.9
      }}
      animate={{ 
        opacity: 1,
        scale: 1
      }}
      transition={{
        duration: 0.3,
        delay,
        ease: 'easeOut'
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
