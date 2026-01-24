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
  onUndo,
  canUndo,
}) => {
  const periods: Period[] = [1, 2, 3, 'OT'];

  return (
    <div className="bg-white shadow-lg rounded-lg p-4 space-y-4">
      {/* Period Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Period</label>
        <div className="grid grid-cols-4 gap-2">
          {periods.map((period) => (
            <button
              key={period}
              onClick={() => onPeriodChange(period)}
              className={`py-3 px-4 rounded-lg font-bold transition-all min-h-[48px]
                ${
                  currentPeriod === period
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              {period === 'OT' ? 'OT' : period === 1 ? '1st' : period === 2 ? '2nd' : '3rd'}
            </button>
          ))}
        </div>
      </div>

      {/* Team Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Team</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onTeamSelect('home')}
            className={`py-4 px-4 rounded-lg font-bold transition-all min-h-[56px]
              ${
                selectedTeam === 'home'
                  ? 'bg-green-600 text-white ring-4 ring-green-300'
                  : 'bg-green-100 text-green-800 hover:bg-green-200'
              }`}
          >
            🏠 {homeTeam}
          </button>
          <button
            onClick={() => onTeamSelect('away')}
            className={`py-4 px-4 rounded-lg font-bold transition-all min-h-[56px]
              ${
                selectedTeam === 'away'
                  ? 'bg-blue-600 text-white ring-4 ring-blue-300'
                  : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
              }`}
          >
            ✈️ {awayTeam}
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all min-h-[48px]
            ${
              canUndo
                ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
        >
          ↶ Undo
        </button>
        <button
          onClick={onEndGame}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 
            rounded-lg transition-all min-h-[48px]"
        >
          End Game
        </button>
      </div>
    </div>
  );
};

export default GameControls;
