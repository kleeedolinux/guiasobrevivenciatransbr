'use client';

import { useEffect, useRef } from 'react';

interface Position {
  x: number;
  y: number;
}

const ONEKO_SIZE = 32;
const ONEKO_SPEED = 10;

const FRAMES = [
  [0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0],
  [0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1],
];

const TRANS_COLORS = ['#5BCEFA', '#F5A9B8', '#FFFFFF', '#F5A9B8', '#5BCEFA'];

export default function TransOneko() {
  const nekoRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);
  const positionRef = useRef<Position>({ x: 32, y: 32 });
  const mouseRef = useRef<Position>({ x: 32, y: 32 });
  const frameCountRef = useRef<number>(0);
  const idleTimeRef = useRef<number>(0);
  const idleAnimationRef = useRef<string | null>(null);
  const idleAnimationFrameRef = useRef<number>(0);
  const trailsRef = useRef<HTMLDivElement[]>([]);
  const trailIndexRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);

  useEffect(() => {
    // Create trails
    trailsRef.current = Array(15).fill(null).map(() => {
      const trail = document.createElement('div');
      trail.style.position = 'fixed';
      trail.style.width = '4px';
      trail.style.height = '4px';
      trail.style.borderRadius = '50%';
      trail.style.pointerEvents = 'none';
      trail.style.transition = 'opacity 0.5s ease';
      trail.style.zIndex = '9999';
      document.body.appendChild(trail);
      return trail;
    });

    const updateTrails = (x: number, y: number) => {
      const trail = trailsRef.current[trailIndexRef.current];
      trail.style.left = (x + ONEKO_SIZE / 2) + 'px';
      trail.style.top = (y + ONEKO_SIZE / 2) + 'px';
      trail.style.backgroundColor = TRANS_COLORS[Math.floor(trailIndexRef.current % TRANS_COLORS.length)];
      trail.style.opacity = '1';
      
      setTimeout(() => {
        trail.style.opacity = '0';
      }, 100);
      
      trailIndexRef.current = (trailIndexRef.current + 1) % trailsRef.current.length;
    };

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const updatePosition = () => {
      if (!nekoRef.current) return;

      const diffX = mouseRef.current.x - positionRef.current.x;
      const diffY = mouseRef.current.y - positionRef.current.y;
      const distance = Math.sqrt(diffX * diffX + diffY * diffY);

      if (distance < ONEKO_SPEED) {
        idleTimeRef.current += 1;

        if (idleTimeRef.current > 10) {
          if (idleAnimationRef.current === null) {
            idleAnimationRef.current = 'sleeping';
            idleAnimationFrameRef.current = 0;
          }

          idleAnimationFrameRef.current += 1;

          if (idleAnimationRef.current === 'sleeping' && idleAnimationFrameRef.current > 8) {
            idleAnimationFrameRef.current = 0;
          }

          const spriteX = (idleAnimationRef.current === 'sleeping' ? 2 : 0) * ONEKO_SIZE;
          const spriteY = (idleAnimationRef.current === 'sleeping' ? idleAnimationFrameRef.current < 4 ? 2 : 3 : 0) * ONEKO_SIZE;

          nekoRef.current.style.backgroundPosition = `-${spriteX}px -${spriteY}px`;
        }
      } else {
        idleAnimationRef.current = null;
        idleAnimationFrameRef.current = 0;
        idleTimeRef.current = 0;

        if (distance > ONEKO_SPEED) {
          positionRef.current.x += (diffX / distance) * ONEKO_SPEED;
          positionRef.current.y += (diffY / distance) * ONEKO_SPEED;
        } else {
          positionRef.current.x = mouseRef.current.x;
          positionRef.current.y = mouseRef.current.y;
        }

        updateTrails(positionRef.current.x, positionRef.current.y);

        const angle = Math.atan2(diffY, diffX);
        const direction = Math.round((angle + Math.PI) / (2 * Math.PI) * 8 + 8) % 8;

        const spriteX = (direction % 4) * ONEKO_SIZE;
        const spriteY = (Math.floor(direction / 4) + 4) * ONEKO_SIZE;

        frameCountRef.current += 1;
        if (frameCountRef.current > 1) {
          frameCountRef.current = 0;
        }

        nekoRef.current.style.left = `${positionRef.current.x - ONEKO_SIZE}px`;
        nekoRef.current.style.top = `${positionRef.current.y - ONEKO_SIZE}px`;
        nekoRef.current.style.backgroundPosition = `-${spriteX}px -${spriteY}px`;
      }

      // Update trail positions
      for (let i = trailsRef.current.length - 1; i >= 0; i--) {
        const trail = trailsRef.current[i];
        if (trail) {
          const prevTrail = trailsRef.current[i - 1];
          const targetX = prevTrail ? parseFloat(prevTrail.style.left) : positionRef.current.x;
          const targetY = prevTrail ? parseFloat(prevTrail.style.top) : positionRef.current.y;
          
          const currentX = parseFloat(trail.style.left) || targetX;
          const currentY = parseFloat(trail.style.top) || targetY;
          
          const newX = currentX + (targetX - currentX) * 0.3;
          const newY = currentY + (targetY - currentY) * 0.3;
          
          trail.style.left = `${newX}px`;
          trail.style.top = `${newY}px`;
        }
      }

      animationFrameRef.current = requestAnimationFrame(updatePosition);
    };

    document.addEventListener('mousemove', onMouseMove);
    animationFrameRef.current = requestAnimationFrame(updatePosition);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      document.removeEventListener('mousemove', onMouseMove);
      trailsRef.current.forEach(trail => {
        document.body.removeChild(trail);
      });
    };
  }, []);

  return (
    <div
      ref={nekoRef}
      style={{
        width: ONEKO_SIZE,
        height: ONEKO_SIZE,
        position: 'fixed',
        pointerEvents: 'none',
        backgroundImage: 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAABACAYAAADS1n9/AAADdUlEQVR4nO2bO27UQBSGPe/wKkCUQEFBQYmQKJMGiYYCUQANDR0VEgUFEhUFBQ0SNRI0kRAlFRINDR0NDQ0FDRJSAA0FBRI8JECKxA4jzc3/RDd2GNsz9pyd8X/SyOsdz/E5/4z/OTOWlFJqwBhxZewLGDUGgOEYAIZjABiOAWA4BoDhGACGYwAYjgFgOAaA4RgAhmMAGI4BYDgGgOEYAIZjABiOAWA4BoDhGACGYwAYjgFgOAaA4RgAhmMAGI4BYDgGgOEYAIZjABiOAWA4BoDhGACGYwAYjgFgOAaA4RgAhmMAGI4BYDgGgOEYAIZjABiOAWA4BoDhGACGYwAYjgFgOAaA4RgAhmMAGI4BYDgGgOEYAIZjABiOAWA4BoDhGACGYwAYjgFgOAaA4RgAhmMAGI4BYDgGgOEYAIZjABiOAWA4BoDhGACGYwAYjgFgOAaA4RgAhmMAGI4BYDgGgOEYAIZjABiOAWA4BoDhGACGYwAYjgFgOAaA4RgAhmMAGI4BYDgGgOEYAIZjABiOAWA4BoDhGACGYwAYjgFgOAaA4RgAhmMAGI4BYDgGgOEYAIZjABiOAWA4BoDhGACGYwAYjgFgOAaA4RgAhmMAGI4BYDgGgOH8BZv7D4cJ0DguAAAAAElFTkSuQmCC")',
        imageRendering: 'pixelated',
        transform: 'scale(2)',
        zIndex: 10000,
      }}
    />
  );
}
