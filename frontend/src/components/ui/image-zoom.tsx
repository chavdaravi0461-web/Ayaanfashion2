'use client';

import { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface ImageZoomProps {
  src: string;
  alt: string;
  className?: string;
}

const FALLBACK = '/placeholder.svg';

export function ImageZoom({ src, alt, className }: ImageZoomProps) {
  const [zoom, setZoom] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [imgSrc, setImgSrc] = useState(src);
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPosition({ x, y });
  };

  const handleTouchStart = useCallback(() => {
    setZoom(true);
  }, []);

  const handleTouchEnd = useCallback(() => {
    setZoom(false);
  }, []);

  const handleImgError = useCallback(() => {
    setImgSrc(FALLBACK);
  }, []);

  const isTouchDevice = typeof window !== 'undefined' && 'ontouchstart' in window;

  return (
    <div
      ref={ref}
      className={cn('relative overflow-hidden', isTouchDevice ? 'cursor-pointer' : 'cursor-crosshair', className)}
      {...(isTouchDevice
        ? { onTouchStart: handleTouchStart, onTouchEnd: handleTouchEnd }
        : { onMouseEnter: () => setZoom(true), onMouseLeave: () => setZoom(false), onMouseMove: handleMouseMove }
      )}
    >
      <img
        src={imgSrc}
        alt={alt}
        onError={handleImgError}
        className="w-full h-full object-cover"
        style={{
          transform: zoom ? 'scale(1.8)' : 'scale(1)',
          transformOrigin: `${position.x}% ${position.y}%`,
          transition: 'transform 0.3s ease',
        }}
      />
    </div>
  );
}
