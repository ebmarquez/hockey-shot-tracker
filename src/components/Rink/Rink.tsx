import React, { useRef, useState, useEffect } from 'react';
import { usePinchZoom } from '../../hooks/usePinchZoom';

interface RinkProps {
  onShotLocation: (x: number, y: number) => void;
  children?: React.ReactNode;
  homeTeamName?: string;
  awayTeamName?: string;
}

const Rink: React.FC<RinkProps> = ({ onShotLocation, children, homeTeamName, awayTeamName }) => {
  const rinkRef = useRef<HTMLDivElement>(null);
  const panTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Pan state
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startTouch, setStartTouch] = useState<{ x: number; y: number } | null>(null);
  
  // Pinch-to-zoom state with callback for pan offset reset
  const handleScaleChange = (newScale: number, didReset: boolean) => {
    // Reset pan offset when zooming back to 1x
    if (didReset || newScale <= 1.1) {
      setOffset({ x: 0, y: 0 });
    }
  };

  const {
    scale,
    isPinching,
    handlePinchStart,
    handlePinchMove,
    handlePinchEnd,
  } = usePinchZoom({ 
    minScale: 1, 
    maxScale: 3, 
    resetThreshold: 0.1,
    onScaleChange: handleScaleChange,
  });

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (panTimeoutRef.current) {
        clearTimeout(panTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Constrain pan offset to rink boundaries
   */
  const constrainToBounds = (newOffset: { x: number; y: number }, currentScale: number, containerSize: { width: number; height: number }): { x: number; y: number } => {
    if (currentScale <= 1) {
      return { x: 0, y: 0 };
    }
    
    // Calculate maximum offset based on scale
    const maxOffsetX = (containerSize.width * (currentScale - 1)) / 2;
    const maxOffsetY = (containerSize.height * (currentScale - 1)) / 2;
    
    return {
      x: Math.max(-maxOffsetX, Math.min(maxOffsetX, newOffset.x)),
      y: Math.max(-maxOffsetY, Math.min(maxOffsetY, newOffset.y))
    };
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Two-finger pinch gesture
      handlePinchStart(e.touches);
    } else if (e.touches.length === 1 && scale > 1) {
      setStartTouch({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      setIsPanning(false);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Two-finger pinch gesture
      handlePinchMove(e.touches);
      e.preventDefault(); // Prevent scrolling during pinch
    } else if (e.touches.length === 1 && startTouch && scale > 1 && rinkRef.current) {
      const dx = e.touches[0].clientX - startTouch.x;
      const dy = e.touches[0].clientY - startTouch.y;
      
      // Apply movement threshold to distinguish tap from pan
      const MOVEMENT_THRESHOLD = 10;
      if (!isPanning && (Math.abs(dx) > MOVEMENT_THRESHOLD || Math.abs(dy) > MOVEMENT_THRESHOLD)) {
        setIsPanning(true);
      }
      
      if (isPanning) {
        const rect = rinkRef.current.getBoundingClientRect();
        const newOffset = constrainToBounds(
          { x: offset.x + dx, y: offset.y + dy },
          scale,
          { width: rect.width, height: rect.height }
        );
        setOffset(newOffset);
        setStartTouch({ x: e.touches[0].clientX, y: e.touches[0].clientY });
        e.preventDefault(); // Prevent scrolling while panning
      }
    }
  };

  const handleTouchEnd = () => {
    // Handle pinch end if we were pinching
    if (isPinching) {
      handlePinchEnd();
      // Note: Pan offset reset is handled by onScaleChange callback
    }
    
    setStartTouch(null);
    // Keep isPanning state for a brief moment to prevent tap from triggering shot placement
    if (panTimeoutRef.current) {
      clearTimeout(panTimeoutRef.current);
    }
    panTimeoutRef.current = setTimeout(() => setIsPanning(false), 50);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Don't register click if we were just panning or pinching
    if (isPanning || isPinching) {
      return;
    }
    
    if (rinkRef.current) {
      const rect = rinkRef.current.getBoundingClientRect();
      
      // Account for pan offset when zoomed
      let x = ((e.clientX - rect.left) / rect.width) * 100;
      let y = ((e.clientY - rect.top) / rect.height) * 100;
      
      if (scale > 1) {
        // Adjust coordinates for pan offset
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const clickOffsetX = (e.clientX - rect.left) - centerX;
        const clickOffsetY = (e.clientY - rect.top) - centerY;
        
        // Compensate for scale and pan
        x = ((clickOffsetX - offset.x) / scale + centerX) / rect.width * 100;
        y = ((clickOffsetY - offset.y) / scale + centerY) / rect.height * 100;
      }
      
      onShotLocation(
        Math.max(0, Math.min(100, x)),
        Math.max(0, Math.min(100, y))
      );
    }
  };

  return (
    <div className="relative w-full overflow-hidden">
      <div 
        ref={rinkRef}
        className="relative cursor-crosshair"
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `scale(${scale}) translate(${offset.x}px, ${offset.y}px)`,
          transformOrigin: 'center center',
          transition: isPanning || isPinching ? 'none' : 'transform 0.2s ease-out',
          touchAction: scale > 1 ? 'none' : 'auto'
        }}
      >
        <svg
          viewBox="0 0 200 85"
          className="w-full h-auto pointer-events-none"
          style={{ maxHeight: '60vh' }}
        >
          {/* Ice surface with gradient */}
          <defs>
            <linearGradient id="ice-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#e8f4f8', stopOpacity: 1 }} />
              <stop offset="50%" style={{ stopColor: '#ffffff', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#e8f4f8', stopOpacity: 1 }} />
            </linearGradient>
            
            {/* Ice texture pattern */}
            <pattern id="ice-texture" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <rect width="20" height="20" fill="url(#ice-gradient)" />
              <circle cx="10" cy="10" r="0.3" fill="#d0e7f0" opacity="0.3" />
            </pattern>
          </defs>
          
          {/* Ice surface */}
          <rect x="0" y="0" width="200" height="85" fill="url(#ice-texture)" />
          
          {/* Boards (outer boundary) */}
          <rect x="0" y="0" width="200" height="85" fill="none" stroke="#1e3a8a" strokeWidth="1.2" rx="4" />
          
          {/* Center red line */}
          <rect x="98.5" y="0" width="3" height="85" fill="#dc2626" />
          
          {/* Blue lines */}
          <rect x="58.5" y="0" width="2.5" height="85" fill="#2563eb" />
          <rect x="139" y="0" width="2.5" height="85" fill="#2563eb" />
          
          {/* Goal lines (thin red) */}
          <rect x="10.5" y="0" width="1" height="85" fill="#dc2626" />
          <rect x="188.5" y="0" width="1" height="85" fill="#dc2626" />
          
          {/* Center ice circle */}
          <circle cx="100" cy="42.5" r="15" fill="none" stroke="#2563eb" strokeWidth="1" />
          <circle cx="100" cy="42.5" r="1" fill="#2563eb" />
          
          {/* Center faceoff spot detail */}
          <line x1="92" y1="42.5" x2="108" y2="42.5" stroke="#2563eb" strokeWidth="0.5" />
          <line x1="100" y1="34.5" x2="100" y2="50.5" stroke="#2563eb" strokeWidth="0.5" />
          
          {/* Left zone faceoff circles */}
          <circle cx="31" cy="20.5" r="15" fill="none" stroke="#dc2626" strokeWidth="1" />
          <circle cx="31" cy="64.5" r="15" fill="none" stroke="#dc2626" strokeWidth="1" />
          
          {/* Left zone faceoff spots */}
          <circle cx="31" cy="20.5" r="1" fill="#dc2626" />
          <circle cx="31" cy="64.5" r="1" fill="#dc2626" />
          
          {/* Left zone faceoff details */}
          <rect x="26" y="15.5" width="2" height="10" fill="#dc2626" />
          <rect x="33" y="15.5" width="2" height="10" fill="#dc2626" />
          <rect x="26" y="59.5" width="2" height="10" fill="#dc2626" />
          <rect x="33" y="59.5" width="2" height="10" fill="#dc2626" />
          
          {/* Right zone faceoff circles */}
          <circle cx="169" cy="20.5" r="15" fill="none" stroke="#dc2626" strokeWidth="1" />
          <circle cx="169" cy="64.5" r="15" fill="none" stroke="#dc2626" strokeWidth="1" />
          
          {/* Right zone faceoff spots */}
          <circle cx="169" cy="20.5" r="1" fill="#dc2626" />
          <circle cx="169" cy="64.5" r="1" fill="#dc2626" />
          
          {/* Right zone faceoff details */}
          <rect x="164" y="15.5" width="2" height="10" fill="#dc2626" />
          <rect x="171" y="15.5" width="2" height="10" fill="#dc2626" />
          <rect x="164" y="59.5" width="2" height="10" fill="#dc2626" />
          <rect x="171" y="59.5" width="2" height="10" fill="#dc2626" />
          
          {/* Neutral zone faceoff spots */}
          <circle cx="80" cy="20.5" r="1" fill="#dc2626" />
          <circle cx="80" cy="64.5" r="1" fill="#dc2626" />
          <circle cx="120" cy="20.5" r="1" fill="#dc2626" />
          <circle cx="120" cy="64.5" r="1" fill="#dc2626" />
          
          {/* Goal creases - Left */}
          <path 
            d="M 11 37 L 5 37 Q 5 42.5 5 42.5 Q 5 48 5 48 L 11 48 Z" 
            fill="#60a5fa" 
            fillOpacity="0.4" 
            stroke="#2563eb" 
            strokeWidth="1"
          />
          
          {/* Goal creases - Right */}
          <path 
            d="M 189 37 L 195 37 Q 195 42.5 195 42.5 Q 195 48 195 48 L 189 48 Z" 
            fill="#60a5fa" 
            fillOpacity="0.4" 
            stroke="#2563eb" 
            strokeWidth="1"
          />
          
          {/* Goals - Left */}
          <rect x="8.5" y="39.5" width="2.5" height="6" fill="none" stroke="#1f2937" strokeWidth="0.8" />
          <line x1="8.5" y1="39.5" x2="11" y2="39.5" stroke="#1f2937" strokeWidth="0.8" />
          <line x1="8.5" y1="45.5" x2="11" y2="45.5" stroke="#1f2937" strokeWidth="0.8" />
          
          {/* Goals - Right */}
          <rect x="189" y="39.5" width="2.5" height="6" fill="none" stroke="#1f2937" strokeWidth="0.8" />
          <line x1="189" y1="39.5" x2="191.5" y2="39.5" stroke="#1f2937" strokeWidth="0.8" />
          <line x1="189" y1="45.5" x2="191.5" y2="45.5" stroke="#1f2937" strokeWidth="0.8" />
          
          {/* Trapezoid behind goals - Left */}
          <path 
            d="M 11 28 L 0 23 L 0 62 L 11 57 Z" 
            fill="none" 
            stroke="#dc2626" 
            strokeWidth="0.6"
            opacity="0.7"
          />
          
          {/* Trapezoid behind goals - Right */}
          <path 
            d="M 189 28 L 200 23 L 200 62 L 189 57 Z" 
            fill="none" 
            stroke="#dc2626" 
            strokeWidth="0.6"
            opacity="0.7"
          />
        </svg>
        
        {/* Shot markers overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {children}
        </div>
      </div>
      
      {/* Zone Labels */}
      <div className="flex justify-between px-2 mt-1">
        <span className="text-gray-400 text-sm">
          {awayTeamName ? `${awayTeamName} Zone` : 'Away Zone'}
        </span>
        <span className="text-gray-400 text-sm">
          {homeTeamName ? `${homeTeamName} Zone` : 'Home Zone'}
        </span>
      </div>
    </div>
  );
};

export default Rink;
