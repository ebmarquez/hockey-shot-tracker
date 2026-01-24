import React from 'react';
import type { Shot } from '../../types';

interface ShotMarkerProps {
  shot: Shot;
  onClick?: (shot: Shot) => void;
}

const ShotMarker: React.FC<ShotMarkerProps> = ({ shot, onClick }) => {
  const isGoal = shot.result === 'goal';
  const isHome = shot.team === 'home';

  // Colors: home = red/coral, away = gray/slate
  const strokeColor = isHome ? '#f87171' : '#94a3b8'; // red-400 / slate-400
  const fillColor = isGoal ? (isHome ? '#ef4444' : '#64748b') : 'transparent'; // red-500 / slate-500

  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer"
      style={{
        left: `${shot.x}%`,
        top: `${shot.y}%`,
        minWidth: '44px',
        minHeight: '44px',
      }}
      onClick={() => onClick?.(shot)}
      title={`${shot.team} - ${shot.result} (${shot.shotType})`}
    >
      <div className="flex items-center justify-center w-full h-full">
        <svg width="24" height="24" viewBox="0 0 24 24">
          {/* Outer ring for goals */}
          {isGoal && (
            <circle
              cx="12"
              cy="12"
              r="11"
              fill="none"
              stroke={isHome ? '#fca5a5' : '#cbd5e1'}
              strokeWidth="2"
              opacity="0.7"
            />
          )}
          {/* Main circle */}
          <circle
            cx="12"
            cy="12"
            r={isGoal ? 7 : 8}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth="2"
          />
        </svg>
      </div>
    </div>
  );
};

export default ShotMarker;
