import React, { useRef, useState, useEffect, useCallback } from 'react';
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
  // Transform origin for pinch zoom centering
  const [transformOrigin, setTransformOrigin] = useState('center center');
  
  // Pinch-to-zoom state with callback for pan offset reset
  const handleScaleChange = useCallback((_newScale: number, didReset: boolean) => {
    // Reset pan offset when zooming back to 1x (didReset indicates scale was snapped to minScale)
    if (didReset) {
      setOffset({ x: 0, y: 0 });
      setTransformOrigin('center center');
    }
  }, []);

  const {
    scale,
    isPinching,
    pinchCenter,
    handlePinchStart,
    handlePinchMove,
    handlePinchEnd,
  } = usePinchZoom({ 
    minScale: 1, 
    maxScale: 3, 
    resetThreshold: 0.1,
    onScaleChange: handleScaleChange,
  });

  // Update transform origin when pinch center changes
  useEffect(() => {
    if (pinchCenter && rinkRef.current) {
      const rect = rinkRef.current.getBoundingClientRect();
      const originX = ((pinchCenter.x - rect.left) / rect.width) * 100;
      const originY = ((pinchCenter.y - rect.top) / rect.height) * 100;
      setTransformOrigin(`${originX}% ${originY}%`);
    }
  }, [pinchCenter]);

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
      // Two-finger pinch gesture - clear startTouch to avoid unexpected pan behavior
      setStartTouch(null);
      handlePinchStart(e.nativeEvent.touches);
    } else if (e.touches.length === 1 && scale > 1) {
      setStartTouch({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      setIsPanning(false);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Two-finger pinch gesture
      handlePinchMove(e.nativeEvent.touches);
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
      
      // Get click position relative to the transformed element's bounding box
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      
      // The visual transform applied by usePinchZoom is a scale(s) followed by a translate(dx, dy)
      // around a transform-origin managed by that hook.
      // To approximately invert this transformation for click handling:
      // 1. getBoundingClientRect() gives us the bounding box AFTER transform
      // 2. The click position is measured relative to this transformed bounding box
      // 3. We treat the bounding box center as the reference point that matches how `offset`
      //    is computed in usePinchZoom, then subtract the translate offset and divide by scale.
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Position relative to center of transformed element
      const relX = clickX - centerX;
      const relY = clickY - centerY;
      
      // getBoundingClientRect() already includes the current translate offset,
      // so we only need to undo the scaling here.
      const afterScale = {
        x: relX / scale,
        y: relY / scale
      };
      
      // Convert back to absolute position (relative to original unscaled element)
      const originalWidth = rect.width / scale;
      const originalHeight = rect.height / scale;
      const originalX = afterScale.x + originalWidth / 2;
      const originalY = afterScale.y + originalHeight / 2;
      
      // For vertical rink: screen Y maps to rink X (inverted), screen X maps to rink Y
      // Top of screen = away zone (low X), Bottom of screen = home zone (high X)
      const screenXPercent = (originalX / originalWidth) * 100;
      const screenYPercent = (originalY / originalHeight) * 100;
      
      // Convert vertical screen coordinates to horizontal rink coordinates
      // Screen top (Y=0) -> Rink left (X=0, away zone)
      // Screen bottom (Y=100) -> Rink right (X=100, home zone)
      const rinkX = screenYPercent;  // Screen Y becomes rink X
      const rinkY = screenXPercent;  // Screen X becomes rink Y
      
      onShotLocation(
        Math.max(0, Math.min(100, rinkX)),
        Math.max(0, Math.min(100, rinkY))
      );
    }
  };

  return (
    <div className="relative w-full overflow-hidden">
      {/* Zone Label - Top (Away Zone) - smaller on mobile */}
      <div className="flex justify-center px-1 sm:px-2 mb-0.5 sm:mb-1">
        <span className="text-gray-400 text-xs sm:text-sm">
          {awayTeamName ? `${awayTeamName} Zone` : 'Away Zone'}
        </span>
      </div>
      
      <div 
        ref={rinkRef}
        className="relative cursor-crosshair"
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `scale(${scale}) translate(${offset.x}px, ${offset.y}px)`,
          transformOrigin: transformOrigin,
          transition: isPanning || isPinching ? 'none' : 'transform 0.2s ease-out',
          touchAction: scale > 1 ? 'none' : 'auto'
        }}
      >
        {/* 
         * Rink sizing for mobile optimization:
         * - maxHeight: Uses CSS calc to fill available space
         * - On mobile: 100vh minus header (~60px), period selector (~80px), and bottom controls (~100px)
         * - minHeight: 400px ensures usable touch targets on small screens
         */}
        <svg
          viewBox="0 0 85 200"
          className="w-full h-auto pointer-events-none mx-auto"
          style={{ 
            maxHeight: 'calc(100vh - 240px)',
            minHeight: '400px'
          }}
        >
          {/* Ice surface with gradient - vertical orientation */}
          <defs>
            <linearGradient id="ice-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
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
          
          {/* Ice surface - vertical */}
          <rect x="0" y="0" width="85" height="200" fill="url(#ice-texture)" />
          
          {/* Boards (outer boundary) - vertical */}
          <rect x="0" y="0" width="85" height="200" fill="none" stroke="#1e3a8a" strokeWidth="1.2" rx="4" />
          
          {/* Center red line - horizontal in vertical rink */}
          <rect x="0" y="98.5" width="85" height="3" fill="#dc2626" />
          
          {/* Blue lines - horizontal in vertical rink */}
          <rect x="0" y="58.5" width="85" height="2.5" fill="#2563eb" />
          <rect x="0" y="139" width="85" height="2.5" fill="#2563eb" />
          
          {/* Goal lines (thin red) - horizontal in vertical rink */}
          <rect x="0" y="10.5" width="85" height="1" fill="#dc2626" />
          <rect x="0" y="188.5" width="85" height="1" fill="#dc2626" />
          
          {/* Center ice circle */}
          <circle cx="42.5" cy="100" r="15" fill="none" stroke="#2563eb" strokeWidth="1" />
          <circle cx="42.5" cy="100" r="1" fill="#2563eb" />
          
          {/* Center faceoff spot detail */}
          <line x1="42.5" y1="92" x2="42.5" y2="108" stroke="#2563eb" strokeWidth="0.5" />
          <line x1="34.5" y1="100" x2="50.5" y2="100" stroke="#2563eb" strokeWidth="0.5" />
          
          {/* Top zone faceoff circles (was left zone) */}
          <circle cx="20.5" cy="31" r="15" fill="none" stroke="#dc2626" strokeWidth="1" />
          <circle cx="64.5" cy="31" r="15" fill="none" stroke="#dc2626" strokeWidth="1" />
          
          {/* Top zone faceoff spots */}
          <circle cx="20.5" cy="31" r="1" fill="#dc2626" />
          <circle cx="64.5" cy="31" r="1" fill="#dc2626" />
          
          {/* Top zone faceoff details */}
          <rect x="15.5" y="26" width="10" height="2" fill="#dc2626" />
          <rect x="15.5" y="33" width="10" height="2" fill="#dc2626" />
          <rect x="59.5" y="26" width="10" height="2" fill="#dc2626" />
          <rect x="59.5" y="33" width="10" height="2" fill="#dc2626" />
          
          {/* Bottom zone faceoff circles (was right zone) */}
          <circle cx="20.5" cy="169" r="15" fill="none" stroke="#dc2626" strokeWidth="1" />
          <circle cx="64.5" cy="169" r="15" fill="none" stroke="#dc2626" strokeWidth="1" />
          
          {/* Bottom zone faceoff spots */}
          <circle cx="20.5" cy="169" r="1" fill="#dc2626" />
          <circle cx="64.5" cy="169" r="1" fill="#dc2626" />
          
          {/* Bottom zone faceoff details */}
          <rect x="15.5" y="164" width="10" height="2" fill="#dc2626" />
          <rect x="15.5" y="171" width="10" height="2" fill="#dc2626" />
          <rect x="59.5" y="164" width="10" height="2" fill="#dc2626" />
          <rect x="59.5" y="171" width="10" height="2" fill="#dc2626" />
          
          {/* Neutral zone faceoff spots */}
          <circle cx="20.5" cy="80" r="1" fill="#dc2626" />
          <circle cx="64.5" cy="80" r="1" fill="#dc2626" />
          <circle cx="20.5" cy="120" r="1" fill="#dc2626" />
          <circle cx="64.5" cy="120" r="1" fill="#dc2626" />
          
          {/* Goal crease - Top (was left) */}
          <path 
            d="M 37 11 L 37 5 Q 42.5 5 42.5 5 Q 48 5 48 5 L 48 11 Z" 
            fill="#60a5fa" 
            fillOpacity="0.4" 
            stroke="#2563eb" 
            strokeWidth="1"
          />
          
          {/* Goal crease - Bottom (was right) */}
          <path 
            d="M 37 189 L 37 195 Q 42.5 195 42.5 195 Q 48 195 48 195 L 48 189 Z" 
            fill="#60a5fa" 
            fillOpacity="0.4" 
            stroke="#2563eb" 
            strokeWidth="1"
          />
          
          {/* Goal - Top (was left) */}
          <rect x="39.5" y="8.5" width="6" height="2.5" fill="none" stroke="#1f2937" strokeWidth="0.8" />
          <line x1="39.5" y1="8.5" x2="39.5" y2="11" stroke="#1f2937" strokeWidth="0.8" />
          <line x1="45.5" y1="8.5" x2="45.5" y2="11" stroke="#1f2937" strokeWidth="0.8" />
          
          {/* Goal - Bottom (was right) */}
          <rect x="39.5" y="189" width="6" height="2.5" fill="none" stroke="#1f2937" strokeWidth="0.8" />
          <line x1="39.5" y1="189" x2="39.5" y2="191.5" stroke="#1f2937" strokeWidth="0.8" />
          <line x1="45.5" y1="189" x2="45.5" y2="191.5" stroke="#1f2937" strokeWidth="0.8" />
          
          {/* Trapezoid behind goals - Top (was left) */}
          <path 
            d="M 28 11 L 23 0 L 62 0 L 57 11 Z" 
            fill="none" 
            stroke="#dc2626" 
            strokeWidth="0.6"
            opacity="0.7"
          />
          
          {/* Trapezoid behind goals - Bottom (was right) */}
          <path 
            d="M 28 189 L 23 200 L 62 200 L 57 189 Z" 
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
      
      {/* Zone Label - Bottom (Home Zone) - smaller on mobile */}
      <div className="flex justify-center px-1 sm:px-2 mt-0.5 sm:mt-1">
        <span className="text-gray-400 text-xs sm:text-sm">
          {homeTeamName ? `${homeTeamName} Zone` : 'Home Zone'}
        </span>
      </div>
    </div>
  );
};

export default Rink;
