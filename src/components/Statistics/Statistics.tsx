import React from 'react';
import type { Game, GameStats, Team } from '../../types';

interface StatisticsProps {
  game: Game;
}

const Statistics: React.FC<StatisticsProps> = ({ game }) => {
  const getTeamStats = (team: Team): GameStats => {
    const teamShots = game.shots.filter(shot => shot.team === team);
    const goals = teamShots.filter(shot => shot.result === 'goal').length;
    const saves = teamShots.filter(shot => shot.result === 'save').length;
    const misses = teamShots.filter(shot => shot.result === 'miss').length;
    const blocked = teamShots.filter(shot => shot.result === 'blocked').length;
    const totalShots = teamShots.length;
    const shootingPercentage = totalShots > 0 ? (goals / totalShots) * 100 : 0;

    const shotsByPeriod = {
      1: teamShots.filter(s => s.period === 1).length,
      2: teamShots.filter(s => s.period === 2).length,
      3: teamShots.filter(s => s.period === 3).length,
      'OT': teamShots.filter(s => s.period === 'OT').length,
    } as Record<typeof game.currentPeriod, number>;

    const shotsByType = {
      wrist: teamShots.filter(s => s.shotType === 'wrist').length,
      slap: teamShots.filter(s => s.shotType === 'slap').length,
      snap: teamShots.filter(s => s.shotType === 'snap').length,
      backhand: teamShots.filter(s => s.shotType === 'backhand').length,
      tip: teamShots.filter(s => s.shotType === 'tip').length,
    };

    return {
      totalShots,
      goals,
      saves,
      misses,
      blocked,
      shootingPercentage,
      shotsByPeriod,
      shotsByType,
    };
  };

  const homeStats = getTeamStats('home');
  const awayStats = getTeamStats('away');

  return (
    <div className="bg-slate-800/50 rounded-2xl border border-white/10 p-4 space-y-4">
      <h2 className="text-lg font-bold text-white text-center">Full Game Statistics</h2>

      {/* Home Team Stats */}
      <div className="bg-gradient-to-br from-emerald-900/40 to-emerald-950/40 rounded-xl p-4 border border-emerald-500/20">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />
          <h3 className="font-bold text-white text-sm uppercase tracking-wide">{game.homeTeam}</h3>
        </div>
        <div className="grid grid-cols-4 gap-3 text-center">
          <div>
            <div className="text-2xl font-bold text-emerald-400 tabular-nums">{homeStats.totalShots}</div>
            <div className="text-xs text-slate-400">Shots</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-400 tabular-nums">{homeStats.goals}</div>
            <div className="text-xs text-slate-400">Goals</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-400 tabular-nums">{homeStats.saves}</div>
            <div className="text-xs text-slate-400">Saves</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-400 tabular-nums">{homeStats.shootingPercentage.toFixed(0)}%</div>
            <div className="text-xs text-slate-400">Sh%</div>
          </div>
        </div>
        {/* Shots by Period */}
        <div className="mt-3 pt-3 border-t border-emerald-500/20">
          <div className="text-xs text-slate-500 mb-2">Shots by Period</div>
          <div className="flex gap-2">
            {[1, 2, 3, 'OT'].map((p) => (
              <div key={p} className="flex-1 text-center bg-emerald-900/30 rounded-lg py-1.5">
                <div className="text-xs text-slate-500">{p === 'OT' ? 'OT' : `P${p}`}</div>
                <div className="text-sm font-semibold text-emerald-300">{homeStats.shotsByPeriod[p as keyof typeof homeStats.shotsByPeriod] || 0}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Away Team Stats */}
      <div className="bg-gradient-to-br from-orange-900/40 to-orange-950/40 rounded-xl p-4 border border-orange-500/20">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2.5 h-2.5 rounded-full bg-orange-400 shadow-lg shadow-orange-400/50" />
          <h3 className="font-bold text-white text-sm uppercase tracking-wide">{game.awayTeam}</h3>
        </div>
        <div className="grid grid-cols-4 gap-3 text-center">
          <div>
            <div className="text-2xl font-bold text-orange-400 tabular-nums">{awayStats.totalShots}</div>
            <div className="text-xs text-slate-400">Shots</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-400 tabular-nums">{awayStats.goals}</div>
            <div className="text-xs text-slate-400">Goals</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-400 tabular-nums">{awayStats.saves}</div>
            <div className="text-xs text-slate-400">Saves</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-400 tabular-nums">{awayStats.shootingPercentage.toFixed(0)}%</div>
            <div className="text-xs text-slate-400">Sh%</div>
          </div>
        </div>
        {/* Shots by Period */}
        <div className="mt-3 pt-3 border-t border-orange-500/20">
          <div className="text-xs text-slate-500 mb-2">Shots by Period</div>
          <div className="flex gap-2">
            {[1, 2, 3, 'OT'].map((p) => (
              <div key={p} className="flex-1 text-center bg-orange-900/30 rounded-lg py-1.5">
                <div className="text-xs text-slate-500">{p === 'OT' ? 'OT' : `P${p}`}</div>
                <div className="text-sm font-semibold text-orange-300">{awayStats.shotsByPeriod[p as keyof typeof awayStats.shotsByPeriod] || 0}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
