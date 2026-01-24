import React from 'react';
import type { Shot } from '../../types';

interface ShotMarkerProps {
  shot: Shot;
  onClick?: (shot: Shot) => void;
}

const ShotMarker: React.FC<ShotMarkerProps> = ({ shot, onClick }) => {
  const getColor = () => {
    if (shot.result === 'goal') {
      // Goals are always bright and prominent
      return shot.team === 'home' ? 'bg-green-500 ring-4 ring-green-300' : 'bg-blue-500 ring-4 ring-blue-300';
    }
    // Regular shots are more subdued
    switch (shot.result) {
      case 'save':
        return shot.team === 'home' ? 'bg-yellow-500' : 'bg-cyan-500';
      case 'miss':
        return shot.team === 'home' ? 'bg-orange-500' : 'bg-purple-500';
      case 'blocked':
        return shot.team === 'home' ? 'bg-red-500' : 'bg-indigo-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getSize = () => {
    // Goals are larger
    return shot.result === 'goal' ? 'w-8 h-8' : 'w-6 h-6';
  };

  return (
    <div
      className={`absolute ${getSize()} rounded-full ${getColor()} border-2 border-white shadow-lg 
        flex items-center justify-center text-white text-sm font-bold cursor-pointer
        transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto
        hover:scale-125 active:scale-110 transition-transform`}
      style={{
        left: `${shot.x}%`,
        top: `${shot.y}%`,
      }}
      onClick={() => onClick?.(shot)}
      title={`${shot.team} - ${shot.result} (${shot.shotType})`}
    >
      {shot.result === 'goal' && <span className="text-lg">⚽</span>}
    </div>
  );
};

export default ShotMarker;
