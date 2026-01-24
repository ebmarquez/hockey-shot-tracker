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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated ice rink background pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="rink-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <circle cx="50" cy="50" r="30" fill="none" stroke="#60a5fa" strokeWidth="2" />
              <circle cx="50" cy="50" r="3" fill="#60a5fa" />
              <line x1="0" y1="50" x2="100" y2="50" stroke="#dc2626" strokeWidth="1.5" />
            </pattern>
          </defs>
          <rect width="400" height="400" fill="url(#rink-pattern)" />
        </svg>
      </div>

      {/* Floating puck animation */}
      <div className="absolute top-1/4 left-1/4 w-16 h-16 rounded-full bg-slate-800 border-4 border-slate-600 opacity-20 animate-pulse" />
      <div className="absolute bottom-1/3 right-1/4 w-12 h-12 rounded-full bg-slate-800 border-4 border-slate-600 opacity-15 animate-pulse" style={{ animationDelay: '1s' }} />

      {/* Main card */}
      <div className="relative z-10 w-full max-w-md">
        {/* Hero section with animated hockey graphic */}
        <div className="text-center mb-6">
          <div className="relative inline-block">
            {/* Glowing ring behind icon */}
            <div className="absolute inset-0 w-28 h-28 sm:w-32 sm:h-32 mx-auto rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 blur-xl opacity-60 animate-pulse" />
            
            {/* Main icon container */}
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 mx-auto bg-gradient-to-br from-slate-800 to-slate-900 rounded-full flex items-center justify-center border-4 border-cyan-400/50 shadow-2xl shadow-cyan-500/30">
              {/* Hockey stick and puck SVG */}
              <svg className="w-16 h-16 sm:w-20 sm:h-20" viewBox="0 0 64 64" fill="none">
                {/* Stick */}
                <path d="M12 52L44 20C46 18 48 18 50 20L52 22C54 24 54 26 52 28L20 60C18 62 16 62 14 60L12 58C10 56 10 54 12 52Z" fill="url(#stick-gradient)" />
                {/* Blade */}
                <path d="M8 56L12 52L20 60L16 64C14 64 10 62 8 60C6 58 6 58 8 56Z" fill="#f59e0b" />
                {/* Puck */}
                <ellipse cx="44" cy="44" rx="10" ry="4" fill="#1e293b" />
                <ellipse cx="44" cy="42" rx="10" ry="4" fill="#334155" />
                <defs>
                  <linearGradient id="stick-gradient" x1="12" y1="52" x2="52" y2="20">
                    <stop stopColor="#f8fafc" />
                    <stop offset="1" stopColor="#cbd5e1" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-black text-white mt-6 tracking-tight">
            Shot<span className="text-cyan-400">Tracker</span>
          </h1>
          <p className="text-slate-400 text-lg mt-2">Real-time hockey shot tracking</p>
        </div>

        {/* Form card with glassmorphism */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Home Team Input */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />
              <input
                type="text"
                id="homeTeam"
                value={homeTeam}
                onChange={(e) => setHomeTeam(e.target.value)}
                className="w-full pl-10 pr-4 py-4 bg-white/10 border-2 border-white/20 rounded-xl
                  focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 focus:bg-white/15
                  text-lg font-semibold text-white placeholder-slate-400
                  transition-all min-h-[56px]"
                placeholder="Home Team"
                required
              />
              {recentTeams.length > 0 && !homeTeam && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                  {recentTeams.slice(0, 2).map((team) => (
                    <button
                      key={team}
                      type="button"
                      onClick={() => setHomeTeam(team)}
                      className="px-2 py-1 text-xs bg-white/20 hover:bg-white/30 rounded-full text-white/80 transition-all"
                    >
                      {team.slice(0, 8)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* VS Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              <span className="text-slate-400 font-bold text-sm">VS</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            </div>

            {/* Away Team Input */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-orange-400 shadow-lg shadow-orange-400/50" />
              <input
                type="text"
                id="awayTeam"
                value={awayTeam}
                onChange={(e) => setAwayTeam(e.target.value)}
                className="w-full pl-10 pr-4 py-4 bg-white/10 border-2 border-white/20 rounded-xl
                  focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 focus:bg-white/15
                  text-lg font-semibold text-white placeholder-slate-400
                  transition-all min-h-[56px]"
                placeholder="Away Team"
                required
              />
              {recentTeams.length > 0 && !awayTeam && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                  {recentTeams.slice(0, 2).map((team) => (
                    <button
                      key={team}
                      type="button"
                      onClick={() => setAwayTeam(team)}
                      className="px-2 py-1 text-xs bg-white/20 hover:bg-white/30 rounded-full text-white/80 transition-all"
                    >
                      {team.slice(0, 8)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Start Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:from-cyan-400 hover:via-blue-400 hover:to-purple-400
                text-white font-bold py-5 px-6 rounded-xl text-xl transition-all
                shadow-lg shadow-blue-500/40 hover:shadow-blue-500/60 min-h-[64px]
                flex items-center justify-center gap-3 group
                focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              <svg className="w-6 h-6 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
              <span>Drop the Puck</span>
            </button>
          </form>
        </div>

        {/* Bottom info */}
        <div className="mt-6 flex justify-center gap-6 text-sm text-slate-500">
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z" />
            </svg>
            Offline Ready
          </span>
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            Private & Secure
          </span>
        </div>
      </div>
    </div>
  );
};

export default GameSetup;
