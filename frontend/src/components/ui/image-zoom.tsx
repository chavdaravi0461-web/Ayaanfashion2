'use client';

import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface ImageZoomProps {
  src: string;
  alt: string;
  className?: string;
}

export function ImageZoom({ src, alt, className }: ImageZoomProps) {
  const [zoom, setZoom] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPosition({ x, y });
  };

  return (
    <div
      ref={ref}
      className={cn('relative overflow-hidden cursor-crosshair', className)}
      onMouseEnter={() => setZoom(true)}
      onMouseLeave={() => setZoom(false)}
      onMouseMove={handleMouseMove}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        style={{
          transform: zoom ? 'scale(2)' : 'scale(1)',
          transformOrigin: `${position.x}% ${position.y}%`,
          transition: zoom ? 'none' : 'transform 0.3s ease',
        }}
      />
    </div>
  );
}
