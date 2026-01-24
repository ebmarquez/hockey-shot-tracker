import React from 'react';
import type { Shot } from '../../types';

interface ShotMarkerProps {
  shot: Shot;
  onClick?: (shot: Shot) => void;
}

const ShotMarker: React.FC<ShotMarkerProps> = ({ shot, onClick }) => {
  const getColor = () => {
    switch (shot.result) {
      case 'goal':
        return shot.team === 'home' ? 'bg-green-500' : 'bg-blue-500';
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

  return (
    <div
      className={`absolute w-6 h-6 rounded-full ${getColor()} border-2 border-white shadow-lg 
        flex items-center justify-center text-white text-xs font-bold cursor-pointer
        transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto
        hover:scale-125 active:scale-110 transition-transform`}
      style={{
        left: `${shot.x}%`,
        top: `${shot.y}%`,
      }}
      onClick={() => onClick?.(shot)}
      title={`${shot.team} - ${shot.result} (${shot.shotType})`}
    >
      {shot.result === 'goal' && '⚫'}
    </div>
  );
};

export default ShotMarker;
