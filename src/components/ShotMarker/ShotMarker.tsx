import React from 'react';
import type { Shot } from '../../types';

interface ShotMarkerProps {
  shot: Shot;
  onClick?: (shot: Shot) => void;
}

const ShotMarker: React.FC<ShotMarkerProps> = ({ shot, onClick }) => {
  const isGoal = shot.result === 'goal';
  const isHome = shot.team === 'home';

  // Colors matching the mockup - home is red/pink, away is orange/gray
  const getMarkerColor = () => {
    if (isHome) {
      return isGoal ? 'bg-red-400' : 'bg-red-300';
    } else {
      return isGoal ? 'bg-orange-400' : 'bg-slate-400';
    }
  };

  const getRingColor = () => {
    if (isHome) {
      return 'ring-red-200';
    } else {
      return 'ring-orange-200';
    }
  };

  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer"
      style={{
        left: `${shot.x}%`,
        top: `${shot.y}%`,
      }}
      onClick={() => onClick?.(shot)}
      title={`${shot.team} - ${shot.result} (${shot.shotType})`}
    >
      {/* Outer ring for goals */}
      {isGoal && (
        <div className={`absolute inset-0 w-10 h-10 -m-1 rounded-full ${getRingColor()} ring-4 opacity-60`} />
      )}
      
      {/* Main marker */}
      <div
        className={`relative w-8 h-8 rounded-full ${getMarkerColor()} 
          border-2 ${isGoal ? 'border-white' : 'border-white/60'}
          shadow-md hover:scale-110 active:scale-95 transition-transform
          flex items-center justify-center`}
      >
        {/* Inner dot for regular shots */}
        {!isGoal && (
          <div className="w-2 h-2 rounded-full bg-white/80" />
        )}
      </div>
    </div>
  );
};

export default ShotMarker;
