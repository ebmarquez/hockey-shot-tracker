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
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🏒</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Hockey Shot Tracker</h1>
          <p className="text-gray-600">Track shots in real-time</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="homeTeam" className="block text-sm font-medium text-gray-700 mb-2">
              Home Team
            </label>
            <input
              type="text"
              id="homeTeam"
              value={homeTeam}
              onChange={(e) => setHomeTeam(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 
                focus:ring-blue-500 focus:border-blue-500 text-lg"
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
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full
                      transition-colors"
                  >
                    {team}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="awayTeam" className="block text-sm font-medium text-gray-700 mb-2">
              Away Team
            </label>
            <input
              type="text"
              id="awayTeam"
              value={awayTeam}
              onChange={(e) => setAwayTeam(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 
                focus:ring-blue-500 focus:border-blue-500 text-lg"
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
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full
                      transition-colors"
                  >
                    {team}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 
              rounded-lg text-lg transition-colors shadow-lg active:scale-95
              min-h-[44px] min-w-[44px]"
          >
            Start Game
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>All data is stored locally on your device</p>
          <p className="mt-1">No account required</p>
        </div>
      </div>
    </div>
  );
};

export default GameSetup;
