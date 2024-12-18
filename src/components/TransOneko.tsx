'use client';

import { useEffect, useRef } from 'react';

const ONEKO_SIZE = 32;
const ONEKO_SPEED = 10;

// Transgender flag colors
const TRANS_COLORS = [
  '#5BCEFA', // Light blue
  '#F5A9B8', // Light pink
  '#FFFFFF', // White
  '#F5A9B8', // Light pink
  '#5BCEFA'  // Light blue
];

export default function TransOneko() {
  const nekoRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>();
  const positionRef = useRef({ x: 32, y: 32 });
  const mouseRef = useRef({ x: 32, y: 32 });
  const frameCountRef = useRef(0);
  const idleTimeRef = useRef(0);
  const idleAnimationRef = useRef<string | null>(null);
  const idleAnimationFrameRef = useRef(0);
  const trailsRef = useRef<HTMLDivElement[]>([]);
  const trailIndexRef = useRef(0);

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

    const frame = () => {
      if (!nekoRef.current) return;

      const deltaX = mouseRef.current.x - positionRef.current.x;
      const deltaY = mouseRef.current.y - positionRef.current.y;
      const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);

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
          positionRef.current.x += (deltaX / distance) * ONEKO_SPEED;
          positionRef.current.y += (deltaY / distance) * ONEKO_SPEED;
        } else {
          positionRef.current.x = mouseRef.current.x;
          positionRef.current.y = mouseRef.current.y;
        }

        updateTrails(positionRef.current.x, positionRef.current.y);

        const angle = Math.atan2(deltaY, deltaX);
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

      frameRef.current = requestAnimationFrame(frame);
    };

    document.addEventListener('mousemove', onMouseMove);
    frameRef.current = requestAnimationFrame(frame);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
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
        backgroundImage: 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAABACAYAAADS1n9/AAADdUlEQVR4nO2bO27UQBSGPe/wKkCUQEFBQYmQKJMGiYYCUQANDR0VEgUFEhUFBQ0SNRI0kRAlFRINDR0NDQ0FDRJSAA0FBRI8JECKxA4jzc3/RDd2GNsz9pyd8X/SyOsdz/E5/4z/OTOWlFJqwBhxZewLGDUGgOEYAIZjABiOAWA4BoDhGACGYwAYjgFgOAaA4RgAhmMAGI4BYDgGgOEYAIZjABiOAWA4BoDhGACGYwAYjgFgOAaA4RgAhmMAGI4BYDgGgOEYAIZjABiOAWA4BoDhGACGYwAYjgFgOAaA4RgAhmMAGI4BYDgGgOEYAIZjABiOAWA4BoDhGACGYwAYjgFgOAaA4RgAhmMAGI4BYDgGgOEYAIZjABiOAWA4BoDhGACGYwAYjgFgOAaA4RgAhmMAGI4BYDgGgOEYAIZjABiOAWA4BoDhGACGYwAYjgFgOAaA4RgAhmMAGI4BYDgGgOEYAIZjABiOAWA4BoDhGACGYwAYjgFgOAaA4RgAhmMAGI4BYDgGgOEYAIZjABiOAWA4BoDhGACGYwAYjgFgOAaA4RgAhmMAGI4BYDgGgOEYAIZjABiOAWA4BoDhGACGYwAYjgFgOAaA4RgAhmMAGI4BYDgGgOEYAIZjABiOAWA4BoDhGACGYwAYjgFgOAaA4RgAhmMAGI4BYDgGgOEYAIZjABiOAWA4BoDhGACGYwAYjgFgOAaA4RgAhmMAGI4BYDgGgOEYAIZjABiOAWA4BoDhGACGYwAYjgFgOAaA4RgAhmMAGI4BYDgGgOEYAIZjABiOAWA4BoDhGACGYwAYjgFgOAaA4RgAhmMAGI4BYDgGgOEYAIZjABiOAWA4BoDhGACGYwAYjgFgOAaA4RgAhmMAGI4BYDgGgOEYAIZjABiOAWA4BoDhGACGYwAYjgFgOAaA4RgAhmMAGI4BYDgGgOEYAIZjABiOAWA4BoDhGACGYwAYjgFgOAaA4RgAhmMAGI4BYDgGgOEYAIZjABiOAWA4BoDhGACGYwAYjgFgOAaA4RgAhmMAGI4BYDgGgOEYAIZjABiOAWA4BoDhGACGYwAYjgFgOAaA4RgAhmMAGI4BYDgGgOEYAIZjABiOAWA4BoDhGACGYwAYjgFgOAaA4RgAhmMAGI4BYDgGgOEYAIZjABiOAWA4BoDhGACGYwAYjgFgOAaA4RgAhmMAGI4BYDgGgOH8BZv7D4cJ0DguAAAAAElFTkSuQmCC")',
        imageRendering: 'pixelated',
        transform: 'scale(2)',
        zIndex: 10000,
      }}
    />
  );
}
