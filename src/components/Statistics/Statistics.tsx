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

  const StatCard: React.FC<{ label: string; value: string | number; color?: string }> = ({
    label,
    value,
    color = 'text-gray-800',
  }) => (
    <div className="text-center">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-600">{label}</div>
    </div>
  );

  return (
    <div className="bg-white shadow-lg rounded-lg p-4 space-y-4">
      <h2 className="text-xl font-bold text-gray-800 text-center">Game Statistics</h2>

      {/* Home Team Stats */}
      <div className="bg-green-50 rounded-lg p-4">
        <h3 className="font-bold text-green-800 mb-3 text-center">🏠 {game.homeTeam}</h3>
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Shots" value={homeStats.totalShots} color="text-green-700" />
          <StatCard label="Goals" value={homeStats.goals} color="text-green-700" />
          <StatCard
            label="Shooting %"
            value={`${homeStats.shootingPercentage.toFixed(1)}%`}
            color="text-green-700"
          />
        </div>
        <div className="grid grid-cols-4 gap-2 mt-3 text-xs">
          <div className="text-center">
            <div className="font-bold text-green-700">{homeStats.saves}</div>
            <div className="text-gray-600">Saves</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-green-700">{homeStats.misses}</div>
            <div className="text-gray-600">Misses</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-green-700">{homeStats.blocked}</div>
            <div className="text-gray-600">Blocked</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-green-700">
              {homeStats.shotsByPeriod[game.currentPeriod]}
            </div>
            <div className="text-gray-600">This Period</div>
          </div>
        </div>
      </div>

      {/* Away Team Stats */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="font-bold text-blue-800 mb-3 text-center">✈️ {game.awayTeam}</h3>
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Shots" value={awayStats.totalShots} color="text-blue-700" />
          <StatCard label="Goals" value={awayStats.goals} color="text-blue-700" />
          <StatCard
            label="Shooting %"
            value={`${awayStats.shootingPercentage.toFixed(1)}%`}
            color="text-blue-700"
          />
        </div>
        <div className="grid grid-cols-4 gap-2 mt-3 text-xs">
          <div className="text-center">
            <div className="font-bold text-blue-700">{awayStats.saves}</div>
            <div className="text-gray-600">Saves</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-blue-700">{awayStats.misses}</div>
            <div className="text-gray-600">Misses</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-blue-700">{awayStats.blocked}</div>
            <div className="text-gray-600">Blocked</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-blue-700">
              {awayStats.shotsByPeriod[game.currentPeriod]}
            </div>
            <div className="text-gray-600">This Period</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
