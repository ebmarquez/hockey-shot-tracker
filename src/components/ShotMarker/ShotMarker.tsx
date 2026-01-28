import React from 'react';
import type { Shot } from '../../types';

interface ShotMarkerProps {
  shot: Shot;
  onClick?: (shot: Shot) => void;
  isDeletable?: boolean;
}

const ShotMarker: React.FC<ShotMarkerProps> = ({ shot, onClick, isDeletable = false }) => {
  const isGoal = shot.result === 'goal';
  const isHome = shot.team === 'home';

  // Colors: home = red/coral, away = gray/slate
  const strokeColor = isHome ? '#f87171' : '#94a3b8'; // red-400 / slate-400
  const fillColor = isGoal ? (isHome ? '#ef4444' : '#64748b') : 'transparent'; // red-500 / slate-500

  // For vertical rink: transform horizontal rink coordinates to vertical screen coordinates
  // Rink X (0-100, left to right) -> Screen Y (0-100, top to bottom)
  // Rink Y (0-100, top to bottom) -> Screen X (0-100, left to right)
  const screenLeft = shot.y;  // Rink Y becomes screen X
  const screenTop = shot.x;   // Rink X becomes screen Y

  return (
    <div
      className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${isDeletable ? 'pointer-events-auto cursor-pointer' : 'pointer-events-none'}`}
      style={{
        left: `${screenLeft}%`,
        top: `${screenTop}%`,
        minWidth: '44px',
        minHeight: '44px',
      }}
      onClick={(e) => {
        if (isDeletable) {
          e.stopPropagation();
          onClick?.(shot);
        }
      }}
      title={isDeletable ? `Click to delete: ${shot.team} - ${shot.result} (${shot.shotType})` : `${shot.team} - ${shot.result} (${shot.shotType})`}
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
          {/* Delete indicator when in delete mode */}
          {isDeletable && (
            <g transform="translate(12, 12)">
              <circle cx="0" cy="0" r="10" fill="rgba(239, 68, 68, 0.2)" />
              <path 
                d="M-3,-3 L3,3 M3,-3 L-3,3" 
                stroke="#ef4444" 
                strokeWidth="2" 
                strokeLinecap="round"
              />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};

export default ShotMarker;
