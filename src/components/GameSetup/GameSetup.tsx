import React, { useState } from 'react';
import { storage } from '../../utils/storage';

interface GameSetupProps {
  onStart: (homeTeam: string, awayTeam: string) => void;
}

const GameSetup: React.FC<GameSetupProps> = ({ onStart }) => {
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const recentTeams = storage.loadPreferences().recentTeams;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (homeTeam.trim() && awayTeam.trim()) {
      onStart(homeTeam.trim(), awayTeam.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-7xl mb-4">🏒</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Hockey Shot Tracker</h1>
          <p className="text-gray-600 text-lg">Track shots in real-time</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="homeTeam" className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide flex items-center gap-2">
              <span className="text-xl">🏠</span> Home Team
            </label>
            <input
              type="text"
              id="homeTeam"
              value={homeTeam}
              onChange={(e) => setHomeTeam(e.target.value)}
              className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 
                focus:ring-green-300 focus:border-green-500 text-lg font-medium
                shadow-sm hover:border-gray-400 transition-all min-h-[56px]"
              placeholder="Enter home team name"
              required
            />
            {recentTeams.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {recentTeams.slice(0, 3).map((team) => (
                  <button
                    key={team}
                    type="button"
                    onClick={() => setHomeTeam(team)}
                    className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-full
                      transition-all font-medium shadow-sm hover:shadow active:scale-95"
                  >
                    {team}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="awayTeam" className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide flex items-center gap-2">
              <span className="text-xl">✈️</span> Away Team
            </label>
            <input
              type="text"
              id="awayTeam"
              value={awayTeam}
              onChange={(e) => setAwayTeam(e.target.value)}
              className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 
                focus:ring-blue-300 focus:border-blue-500 text-lg font-medium
                shadow-sm hover:border-gray-400 transition-all min-h-[56px]"
              placeholder="Enter away team name"
              required
            />
            {recentTeams.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {recentTeams.slice(0, 3).map((team) => (
                  <button
                    key={team}
                    type="button"
                    onClick={() => setAwayTeam(team)}
                    className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-full
                      transition-all font-medium shadow-sm hover:shadow active:scale-95"
                  >
                    {team}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 
              text-white font-bold py-5 px-6 rounded-xl text-xl transition-all 
              shadow-lg hover:shadow-xl active:scale-95 min-h-[68px]
              flex items-center justify-center gap-3"
          >
            <span className="text-3xl">🎮</span>
            <span>Start Game</span>
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500 space-y-1">
          <p className="flex items-center justify-center gap-2">
            <span>💾</span> All data stored locally on your device
          </p>
          <p className="flex items-center justify-center gap-2">
            <span>🔒</span> No account required
          </p>
        </div>
      </div>
    </div>
  );
};

export default GameSetup;
