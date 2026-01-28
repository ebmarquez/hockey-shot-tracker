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

  /**
   * Check if a point (in percentage coordinates) is within the ice rink boundary.
   * The rink has rounded corners with a 28 ft radius on a 85x200 ft surface.
   * This function checks if the point is inside the rounded rectangle shape.
   * 
   * @param xPercent - X position as percentage (0-100)
   * @param yPercent - Y position as percentage (0-100)
   * @returns true if point is within the rink boundary
   */
  const isWithinRinkBoundary = (xPercent: number, yPercent: number): boolean => {
    // Convert percentage to rink coordinates (85 wide x 200 tall)
    // Note: In the vertical rink display:
    // - screenX (horizontal) maps to rink width (0-85)
    // - screenY (vertical) maps to rink height (0-200)
    const rinkWidth = 85;
    const rinkHeight = 200;
    const cornerRadius = 28; // NHL corner radius in feet
    
    // Convert percentage to actual rink coordinates
    // xPercent is screen horizontal position -> rink Y (width)
    // yPercent is screen vertical position -> rink X (height)
    const rinkY = (xPercent / 100) * rinkWidth;  // 0-85
    const rinkX = (yPercent / 100) * rinkHeight; // 0-200
    
    // Add a small margin inside the boards (2 ft / ~2.4% of width, ~1% of height)
    const margin = 2;
    
    // Check if point is in the main rectangular area (excluding corners)
    const inMainRect = 
      rinkY >= margin && rinkY <= (rinkWidth - margin) &&
      rinkX >= margin && rinkX <= (rinkHeight - margin);
    
    if (!inMainRect) {
      return false;
    }
    
    // Check corner regions - if we're in a corner zone, verify we're inside the rounded corner
    const cornerZoneSize = cornerRadius + margin;
    
    // Top-left corner (rinkX < cornerRadius, rinkY < cornerRadius)
    if (rinkX < cornerZoneSize && rinkY < cornerZoneSize) {
      const dx = cornerZoneSize - rinkX;
      const dy = cornerZoneSize - rinkY;
      const effectiveRadius = cornerRadius - margin;
      return (dx * dx + dy * dy) <= (effectiveRadius * effectiveRadius);
    }
    
    // Top-right corner (rinkX < cornerRadius, rinkY > width - cornerRadius)
    if (rinkX < cornerZoneSize && rinkY > (rinkWidth - cornerZoneSize)) {
      const dx = cornerZoneSize - rinkX;
      const dy = rinkY - (rinkWidth - cornerZoneSize);
      const effectiveRadius = cornerRadius - margin;
      return (dx * dx + dy * dy) <= (effectiveRadius * effectiveRadius);
    }
    
    // Bottom-left corner (rinkX > height - cornerRadius, rinkY < cornerRadius)
    if (rinkX > (rinkHeight - cornerZoneSize) && rinkY < cornerZoneSize) {
      const dx = rinkX - (rinkHeight - cornerZoneSize);
      const dy = cornerZoneSize - rinkY;
      const effectiveRadius = cornerRadius - margin;
      return (dx * dx + dy * dy) <= (effectiveRadius * effectiveRadius);
    }
    
    // Bottom-right corner (rinkX > height - cornerRadius, rinkY > width - cornerRadius)
    if (rinkX > (rinkHeight - cornerZoneSize) && rinkY > (rinkWidth - cornerZoneSize)) {
      const dx = rinkX - (rinkHeight - cornerZoneSize);
      const dy = rinkY - (rinkWidth - cornerZoneSize);
      const effectiveRadius = cornerRadius - margin;
      return (dx * dx + dy * dy) <= (effectiveRadius * effectiveRadius);
    }
    
    // Point is in main area, not in a corner zone
    return true;
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
      
      // Check if click is within the rink boundary (inside the boards)
      if (!isWithinRinkBoundary(screenXPercent, screenYPercent)) {
        // Click is outside the rink boundary, ignore it
        return;
      }
      
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
         * NHL Rink - Accurate Dimensions (200 ft × 85 ft)
         * ViewBox: 85 × 200 (width × height) - 1 unit = 1 ft
         * - Corner radius: 28 ft
         * - Goal line: 11 ft from end boards
         * - Blue lines: 75 ft from end boards (50 ft apart)
         * - Center line: 100 ft (middle)
         * - Faceoff circles: 15 ft radius (30 ft diameter)
         * - End zone faceoff spots: 20 ft from goal line, 22 ft from center
         * - Goal crease: 6 ft semi-circular radius
         * - Trapezoid: 22 ft at goal line, 28 ft at boards (11 ft depth)
         */}
        <svg
          viewBox="0 0 85 200"
          className="w-full h-auto pointer-events-none mx-auto"
          preserveAspectRatio="xMidYMid meet"
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
            
            {/* Clip path for ice surface within boards (28 ft corner radius) */}
            <clipPath id="rink-clip">
              <rect x="0" y="0" width="85" height="200" rx="28" ry="28" />
            </clipPath>
          </defs>
          
          {/* Ice surface - vertical, clipped to rink shape */}
          <rect x="0" y="0" width="85" height="200" fill="url(#ice-texture)" clipPath="url(#rink-clip)" />
          
          {/* Boards (outer boundary) - 28 ft corner radius */}
          <rect x="0" y="0" width="85" height="200" fill="none" stroke="#1e3a8a" strokeWidth="2" rx="28" ry="28" />
          
          {/* Center red line - at 100 ft (center), 12 inches = 1 ft wide */}
          <rect x="0" y="99.5" width="85" height="1" fill="#dc2626" />
          
          {/* Blue lines - 75 ft from each end, 12 inches = 1 ft wide */}
          <rect x="0" y="74.5" width="85" height="1" fill="#2563eb" />
          <rect x="0" y="124.5" width="85" height="1" fill="#2563eb" />
          
          {/* Goal lines - 11 ft from end boards, 2 inches wide (~0.17 ft) */}
          <rect x="0" y="10.9" width="85" height="0.2" fill="#dc2626" />
          <rect x="0" y="188.9" width="85" height="0.2" fill="#dc2626" />
          
          {/* Center ice circle - 30 ft diameter = 15 ft radius */}
          <circle cx="42.5" cy="100" r="15" fill="none" stroke="#2563eb" strokeWidth="0.5" />
          
          {/* Center faceoff spot - 12 inches (1 ft) diameter */}
          <circle cx="42.5" cy="100" r="0.5" fill="#2563eb" />
          
          {/* End zone faceoff circles - 30 ft diameter = 15 ft radius
              Position: 20 ft from goal line (11+20=31 ft from end), 22 ft from center */}
          {/* Top zone (away zone) faceoff circles */}
          <circle cx="20.5" cy="31" r="15" fill="none" stroke="#dc2626" strokeWidth="0.5" />
          <circle cx="64.5" cy="31" r="15" fill="none" stroke="#dc2626" strokeWidth="0.5" />
          
          {/* Top zone faceoff spots - 2 ft diameter = 1 ft radius */}
          <circle cx="20.5" cy="31" r="1" fill="#dc2626" />
          <circle cx="64.5" cy="31" r="1" fill="#dc2626" />
          
          {/* Top zone faceoff circle hash marks (L-shaped) */}
          {/* Left circle hash marks */}
          <line x1="18.5" y1="29" x2="18.5" y2="26" stroke="#dc2626" strokeWidth="0.3" />
          <line x1="18.5" y1="26" x2="16.5" y2="26" stroke="#dc2626" strokeWidth="0.3" />
          <line x1="22.5" y1="29" x2="22.5" y2="26" stroke="#dc2626" strokeWidth="0.3" />
          <line x1="22.5" y1="26" x2="24.5" y2="26" stroke="#dc2626" strokeWidth="0.3" />
          <line x1="18.5" y1="33" x2="18.5" y2="36" stroke="#dc2626" strokeWidth="0.3" />
          <line x1="18.5" y1="36" x2="16.5" y2="36" stroke="#dc2626" strokeWidth="0.3" />
          <line x1="22.5" y1="33" x2="22.5" y2="36" stroke="#dc2626" strokeWidth="0.3" />
          <line x1="22.5" y1="36" x2="24.5" y2="36" stroke="#dc2626" strokeWidth="0.3" />
          {/* Right circle hash marks */}
          <line x1="62.5" y1="29" x2="62.5" y2="26" stroke="#dc2626" strokeWidth="0.3" />
          <line x1="62.5" y1="26" x2="60.5" y2="26" stroke="#dc2626" strokeWidth="0.3" />
          <line x1="66.5" y1="29" x2="66.5" y2="26" stroke="#dc2626" strokeWidth="0.3" />
          <line x1="66.5" y1="26" x2="68.5" y2="26" stroke="#dc2626" strokeWidth="0.3" />
          <line x1="62.5" y1="33" x2="62.5" y2="36" stroke="#dc2626" strokeWidth="0.3" />
          <line x1="62.5" y1="36" x2="60.5" y2="36" stroke="#dc2626" strokeWidth="0.3" />
          <line x1="66.5" y1="33" x2="66.5" y2="36" stroke="#dc2626" strokeWidth="0.3" />
          <line x1="66.5" y1="36" x2="68.5" y2="36" stroke="#dc2626" strokeWidth="0.3" />
          
          {/* Bottom zone (home zone) faceoff circles */}
          <circle cx="20.5" cy="169" r="15" fill="none" stroke="#dc2626" strokeWidth="0.5" />
          <circle cx="64.5" cy="169" r="15" fill="none" stroke="#dc2626" strokeWidth="0.5" />
          
          {/* Bottom zone faceoff spots */}
          <circle cx="20.5" cy="169" r="1" fill="#dc2626" />
          <circle cx="64.5" cy="169" r="1" fill="#dc2626" />
          
          {/* Bottom zone faceoff circle hash marks (L-shaped) */}
          {/* Left circle hash marks */}
          <line x1="18.5" y1="167" x2="18.5" y2="164" stroke="#dc2626" strokeWidth="0.3" />
          <line x1="18.5" y1="164" x2="16.5" y2="164" stroke="#dc2626" strokeWidth="0.3" />
          <line x1="22.5" y1="167" x2="22.5" y2="164" stroke="#dc2626" strokeWidth="0.3" />
          <line x1="22.5" y1="164" x2="24.5" y2="164" stroke="#dc2626" strokeWidth="0.3" />
          <line x1="18.5" y1="171" x2="18.5" y2="174" stroke="#dc2626" strokeWidth="0.3" />
          <line x1="18.5" y1="174" x2="16.5" y2="174" stroke="#dc2626" strokeWidth="0.3" />
          <line x1="22.5" y1="171" x2="22.5" y2="174" stroke="#dc2626" strokeWidth="0.3" />
          <line x1="22.5" y1="174" x2="24.5" y2="174" stroke="#dc2626" strokeWidth="0.3" />
          {/* Right circle hash marks */}
          <line x1="62.5" y1="167" x2="62.5" y2="164" stroke="#dc2626" strokeWidth="0.3" />
          <line x1="62.5" y1="164" x2="60.5" y2="164" stroke="#dc2626" strokeWidth="0.3" />
          <line x1="66.5" y1="167" x2="66.5" y2="164" stroke="#dc2626" strokeWidth="0.3" />
          <line x1="66.5" y1="164" x2="68.5" y2="164" stroke="#dc2626" strokeWidth="0.3" />
          <line x1="62.5" y1="171" x2="62.5" y2="174" stroke="#dc2626" strokeWidth="0.3" />
          <line x1="62.5" y1="174" x2="60.5" y2="174" stroke="#dc2626" strokeWidth="0.3" />
          <line x1="66.5" y1="171" x2="66.5" y2="174" stroke="#dc2626" strokeWidth="0.3" />
          <line x1="66.5" y1="174" x2="68.5" y2="174" stroke="#dc2626" strokeWidth="0.3" />
          
          {/* Neutral zone faceoff spots - 2 ft diameter, located 5 ft from blue lines
              Top neutral zone: y = 75 - 5 = 70
              Bottom neutral zone: y = 125 + 5 = 130
              X positions: 20.5 and 64.5 (same as end zone circles) */}
          <circle cx="20.5" cy="70" r="1" fill="#dc2626" />
          <circle cx="64.5" cy="70" r="1" fill="#dc2626" />
          <circle cx="20.5" cy="130" r="1" fill="#dc2626" />
          <circle cx="64.5" cy="130" r="1" fill="#dc2626" />
          
          {/* Goal crease - Top (away zone)
              Semi-circular, 6 ft radius from center of goal line
              Goal is centered at x=42.5, goal line at y=11 */}
          <path 
            d="M 36.5 11 A 6 6 0 0 1 48.5 11" 
            fill="#60a5fa" 
            fillOpacity="0.3" 
            stroke="#dc2626" 
            strokeWidth="0.3"
          />
          
          {/* Goal crease - Bottom (home zone)
              Semi-circular, 6 ft radius from center of goal line
              Goal line at y=189 */}
          <path 
            d="M 36.5 189 A 6 6 0 0 0 48.5 189" 
            fill="#60a5fa" 
            fillOpacity="0.3" 
            stroke="#dc2626" 
            strokeWidth="0.3"
          />
          
          {/* Goal - Top (away zone)
              Goal opening: 6 ft wide (72 inches), centered at x=42.5
              Goal depth: ~3.33 ft (40 inches) behind goal line
              Goal line at y=11, so goal extends from y=11 to y=7.67 */}
          <rect x="39.5" y="7.67" width="6" height="3.33" fill="none" stroke="#1f2937" strokeWidth="0.5" />
          
          {/* Goal - Bottom (home zone)
              Goal line at y=189, so goal extends from y=189 to y=192.33 */}
          <rect x="39.5" y="189" width="6" height="3.33" fill="none" stroke="#1f2937" strokeWidth="0.5" />
          
          {/* Trapezoid behind goals - Top (away zone)
              Base at goal line: 22 ft wide (11 ft each side from center)
              Base at end boards: 28 ft wide (14 ft each side from center)
              Goal line at y=11, end boards at y=0
              Center at x=42.5 */}
          <path 
            d="M 31.5 11 L 28.5 0 L 56.5 0 L 53.5 11" 
            fill="none" 
            stroke="#dc2626" 
            strokeWidth="0.3"
            opacity="0.7"
          />
          
          {/* Trapezoid behind goals - Bottom (home zone)
              Goal line at y=189, end boards at y=200 */}
          <path 
            d="M 31.5 189 L 28.5 200 L 56.5 200 L 53.5 189" 
            fill="none" 
            stroke="#dc2626" 
            strokeWidth="0.3"
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
