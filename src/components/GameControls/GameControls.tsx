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
    <div className="bg-white shadow-lg shadow-slate-200/50 rounded-2xl p-4 sm:p-5 space-y-5 border border-slate-100">
      {/* Period Selection */}
      <div>
        <label className="block text-xs font-bold text-slate-500 mb-2.5 uppercase tracking-wider">
          Period
        </label>
        <div className="grid grid-cols-4 gap-2">
          {periods.map((period) => (
            <button
              key={period}
              onClick={() => onPeriodChange(period)}
              className={`py-3 sm:py-4 px-2 rounded-xl font-bold transition-all min-h-[52px] sm:min-h-[60px] text-base sm:text-lg
                focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
                ${
                  currentPeriod === period
                    ? 'bg-gradient-to-br from-slate-700 to-slate-800 text-white shadow-lg shadow-slate-400/30'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 active:bg-slate-300'
                }`}
            >
              {period === 'OT' ? 'OT' : period === 1 ? '1st' : period === 2 ? '2nd' : '3rd'}
            </button>
          ))}
        </div>
      </div>

      {/* Team Selection */}
      <div>
        <label className="block text-xs font-bold text-slate-500 mb-2.5 uppercase tracking-wider">
          Recording shots for
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onTeamSelect('home')}
            className={`py-4 sm:py-5 px-3 rounded-xl font-bold transition-all min-h-[72px] sm:min-h-[80px]
              focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2
              flex flex-col items-center justify-center gap-1.5
              ${
                selectedTeam === 'home'
                  ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg shadow-green-400/30 ring-2 ring-green-400'
                  : 'bg-green-50 text-green-700 hover:bg-green-100 active:bg-green-200 border-2 border-green-200'
              }`}
          >
            <span className="text-2xl sm:text-3xl">🏠</span>
            <span className="text-sm sm:text-base leading-tight truncate max-w-full px-1">{homeTeam}</span>
          </button>
          <button
            onClick={() => onTeamSelect('away')}
            className={`py-4 sm:py-5 px-3 rounded-xl font-bold transition-all min-h-[72px] sm:min-h-[80px]
              focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
              flex flex-col items-center justify-center gap-1.5
              ${
                selectedTeam === 'away'
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-400/30 ring-2 ring-blue-400'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100 active:bg-blue-200 border-2 border-blue-200'
              }`}
          >
            <span className="text-2xl sm:text-3xl">✈️</span>
            <span className="text-sm sm:text-base leading-tight truncate max-w-full px-1">{awayTeam}</span>
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-100 pt-4">
        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`py-3 sm:py-4 px-3 rounded-xl font-semibold transition-all min-h-[52px] sm:min-h-[56px]
              focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2
              flex items-center justify-center gap-2
              ${
                canUndo
                  ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 active:bg-amber-300'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            <span>Undo</span>
          </button>
          <button
            onClick={onResetGame}
            className="bg-slate-100 text-slate-600 hover:bg-slate-200 active:bg-slate-300
              font-semibold py-3 sm:py-4 px-3 rounded-xl transition-all min-h-[52px] sm:min-h-[56px]
              focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2
              flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Reset</span>
          </button>
          <button
            onClick={onEndGame}
            className="col-span-2 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700
              text-white font-semibold py-3 sm:py-4 px-3 rounded-xl transition-all min-h-[52px] sm:min-h-[56px]
              shadow-lg shadow-red-400/20 hover:shadow-red-400/30
              focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2
              flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
            <span>End Game</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameControls;
