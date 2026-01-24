import React, { useRef, useState } from 'react';
import { getTouchCoordinates, triggerHaptic } from '../../utils/touch';
import { storage } from '../../utils/storage';

interface RinkProps {
  onShotLocation: (x: number, y: number) => void;
  children?: React.ReactNode;
}

const Rink: React.FC<RinkProps> = ({ onShotLocation, children }) => {
  const rinkRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [isPinching, setIsPinching] = useState(false);
  const [initialDistance, setInitialDistance] = useState(0);
  const [initialScale, setInitialScale] = useState(1);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      // Pinch zoom start
      setIsPinching(true);
      const distance = getDistance(e.touches[0], e.touches[1]);
      setInitialDistance(distance);
      setInitialScale(scale);
      e.preventDefault();
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && isPinching) {
      // Pinch zoom
      const distance = getDistance(e.touches[0], e.touches[1]);
      const newScale = Math.max(1, Math.min(3, initialScale * (distance / initialDistance)));
      setScale(newScale);
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length < 2) {
      setIsPinching(false);
    }

    // Single tap for shot location
    if (e.touches.length === 0 && !isPinching && rinkRef.current) {
      const coords = getTouchCoordinates(e, rinkRef.current);
      onShotLocation(coords.x, coords.y);
      
      // Haptic feedback
      const prefs = storage.loadPreferences();
      if (prefs.hapticFeedback) {
        triggerHaptic(10);
      }
    }
  };

  const getDistance = (touch1: React.Touch, touch2: React.Touch): number => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (rinkRef.current) {
      const rect = rinkRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      onShotLocation(
        Math.max(0, Math.min(100, x)),
        Math.max(0, Math.min(100, y))
      );
      
      // Haptic feedback
      const prefs = storage.loadPreferences();
      if (prefs.hapticFeedback) {
        triggerHaptic(10);
      }
    }
  };

  return (
    <div className="relative w-full overflow-hidden bg-gray-900 rounded-xl shadow-2xl">
      {/* Zone Labels */}
      <div className="absolute top-3 left-0 right-0 z-10 flex justify-between px-6 pointer-events-none">
        <div className="bg-green-600 text-white px-6 py-2 rounded-full shadow-xl font-bold text-base tracking-wider">
          HOME ZONE
        </div>
        <div className="bg-blue-600 text-white px-6 py-2 rounded-full shadow-xl font-bold text-base tracking-wider">
          AWAY ZONE
        </div>
      </div>
      
      <div
        ref={rinkRef}
        className="relative select-none touch-none"
        style={{
          transform: `scale(${scale})`,
          transition: isPinching ? 'none' : 'transform 0.2s ease-out',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
      >
        <svg
          viewBox="0 0 200 85"
          className="w-full h-auto"
          style={{ maxHeight: '70vh' }}
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
    </div>
  );
};

export default Rink;
