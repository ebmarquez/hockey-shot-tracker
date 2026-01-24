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
    <div className="relative w-full overflow-hidden bg-gray-100 rounded-lg">
      {/* Zone Labels */}
      <div className="absolute top-2 left-0 right-0 z-10 flex justify-between px-4 pointer-events-none">
        <div className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg font-bold text-sm">
          HOME
        </div>
        <div className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg font-bold text-sm">
          AWAY
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
          {/* Ice surface */}
          <rect x="0" y="0" width="200" height="85" fill="#f0f4f8" />
          
          {/* Boards */}
          <rect x="0" y="0" width="200" height="85" fill="none" stroke="#1e40af" strokeWidth="0.5" />
          
          {/* Center red line */}
          <line x1="100" y1="0" x2="100" y2="85" stroke="#dc2626" strokeWidth="0.8" />
          
          {/* Blue lines */}
          <line x1="60" y1="0" x2="60" y2="85" stroke="#2563eb" strokeWidth="0.8" />
          <line x1="140" y1="0" x2="140" y2="85" stroke="#2563eb" strokeWidth="0.8" />
          
          {/* Goal lines */}
          <line x1="11" y1="0" x2="11" y2="85" stroke="#dc2626" strokeWidth="0.5" />
          <line x1="189" y1="0" x2="189" y2="85" stroke="#dc2626" strokeWidth="0.5" />
          
          {/* Center ice circle */}
          <circle cx="100" cy="42.5" r="15" fill="none" stroke="#2563eb" strokeWidth="0.5" />
          <circle cx="100" cy="42.5" r="0.8" fill="#2563eb" />
          
          {/* Faceoff circles - Left zone */}
          <circle cx="31" cy="20.5" r="15" fill="none" stroke="#dc2626" strokeWidth="0.5" />
          <circle cx="31" cy="64.5" r="15" fill="none" stroke="#dc2626" strokeWidth="0.5" />
          <circle cx="31" cy="20.5" r="0.8" fill="#dc2626" />
          <circle cx="31" cy="64.5" r="0.8" fill="#dc2626" />
          
          {/* Faceoff circles - Right zone */}
          <circle cx="169" cy="20.5" r="15" fill="none" stroke="#dc2626" strokeWidth="0.5" />
          <circle cx="169" cy="64.5" r="15" fill="none" stroke="#dc2626" strokeWidth="0.5" />
          <circle cx="169" cy="20.5" r="0.8" fill="#dc2626" />
          <circle cx="169" cy="64.5" r="0.8" fill="#dc2626" />
          
          {/* Neutral zone faceoff spots */}
          <circle cx="80" cy="20.5" r="0.8" fill="#dc2626" />
          <circle cx="80" cy="64.5" r="0.8" fill="#dc2626" />
          <circle cx="120" cy="20.5" r="0.8" fill="#dc2626" />
          <circle cx="120" cy="64.5" r="0.8" fill="#dc2626" />
          
          {/* Goal creases */}
          <path d="M 11 37.5 L 8 37.5 A 6 6 0 0 0 8 47.5 L 11 47.5 Z" fill="#4299e1" fillOpacity="0.3" stroke="#2563eb" strokeWidth="0.5" />
          <path d="M 189 37.5 L 192 37.5 A 6 6 0 0 1 192 47.5 L 189 47.5 Z" fill="#4299e1" fillOpacity="0.3" stroke="#2563eb" strokeWidth="0.5" />
          
          {/* Goals */}
          <rect x="9" y="39.5" width="2" height="6" fill="none" stroke="#000" strokeWidth="0.3" />
          <rect x="189" y="39.5" width="2" height="6" fill="none" stroke="#000" strokeWidth="0.3" />
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
