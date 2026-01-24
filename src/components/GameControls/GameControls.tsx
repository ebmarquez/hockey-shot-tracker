import React from 'react';
import type { Period, Team } from '../../types';

interface GameControlsProps {
  currentPeriod: Period;
  onPeriodChange: (period: Period) => void;
  selectedTeam: Team | null;
  onTeamSelect: (team: Team) => void;
  homeTeam: string;
  awayTeam: string;
  onEndGame: () => void;
  onResetGame: () => void;
  onUndo: () => void;
  canUndo: boolean;
}

const GameControls: React.FC<GameControlsProps> = ({
  currentPeriod,
  onPeriodChange,
  selectedTeam,
  onTeamSelect,
  homeTeam,
  awayTeam,
  onEndGame,
  onResetGame,
  onUndo,
  canUndo,
}) => {
  const periods: Period[] = [1, 2, 3, 'OT'];

  return (
    <div className="bg-white shadow-xl rounded-xl p-5 space-y-5">
      {/* Period Selection */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
          Select Period
        </label>
        <div className="grid grid-cols-4 gap-2">
          {periods.map((period) => (
            <button
              key={period}
              onClick={() => onPeriodChange(period)}
              className={`py-4 px-3 rounded-xl font-bold transition-all min-h-[60px] text-lg
                shadow-md hover:shadow-lg active:scale-95
                ${
                  currentPeriod === period
                    ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white ring-4 ring-blue-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-300'
                }`}
            >
              {period === 'OT' ? 'OT' : period === 1 ? '1st' : period === 2 ? '2nd' : '3rd'}
            </button>
          ))}
        </div>
      </div>

      {/* Team Selection */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
          Select Team
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onTeamSelect('home')}
            className={`py-5 px-4 rounded-xl font-bold transition-all min-h-[70px]
              shadow-md hover:shadow-lg active:scale-95 flex flex-col items-center gap-2
              ${
                selectedTeam === 'home'
                  ? 'bg-gradient-to-br from-green-600 to-green-700 text-white ring-4 ring-green-300'
                  : 'bg-green-50 text-green-800 hover:bg-green-100 border-2 border-green-300'
              }`}
          >
            <span className="text-3xl">🏠</span>
            <span className="text-sm leading-tight">{homeTeam}</span>
          </button>
          <button
            onClick={() => onTeamSelect('away')}
            className={`py-5 px-4 rounded-xl font-bold transition-all min-h-[70px]
              shadow-md hover:shadow-lg active:scale-95 flex flex-col items-center gap-2
              ${
                selectedTeam === 'away'
                  ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white ring-4 ring-blue-300'
                  : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border-2 border-blue-300'
              }`}
          >
            <span className="text-3xl">✈️</span>
            <span className="text-sm leading-tight">{awayTeam}</span>
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`py-4 px-4 rounded-xl font-bold transition-all min-h-[60px]
            shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2
            ${
              canUndo
                ? 'bg-gradient-to-br from-yellow-500 to-yellow-600 text-white'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
        >
          <span className="text-2xl">↶</span>
          <span>Undo</span>
        </button>
        <button
          onClick={onResetGame}
          className="bg-gradient-to-br from-orange-500 to-orange-600 text-white font-bold py-4 px-4 
            rounded-xl transition-all min-h-[60px] shadow-md hover:shadow-lg active:scale-95
            flex items-center justify-center gap-2"
        >
          <span className="text-2xl">🔄</span>
          <span>Reset</span>
        </button>
        <button
          onClick={onEndGame}
          className="col-span-2 bg-gradient-to-br from-red-500 to-red-600 text-white font-bold py-4 px-4 
            rounded-xl transition-all min-h-[60px] shadow-md hover:shadow-lg active:scale-95
            flex items-center justify-center gap-3"
        >
          <span className="text-2xl">🛑</span>
          <span>End Game</span>
        </button>
      </div>
    </div>
  );
};

export default GameControls;
