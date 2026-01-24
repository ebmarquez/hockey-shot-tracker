import React, { useState } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { useToast } from './context/ToastContext';
import Rink from './components/Rink/Rink';
import ShotMarker from './components/ShotMarker/ShotMarker';
import ShotForm from './components/ShotForm/ShotForm';
import DeleteShotDialog from './components/DeleteShotDialog/DeleteShotDialog';
import type { Shot, ShotType, ShotResult, Period, Team } from './types';
import { calculateShootingPercentage } from './utils/shootingPercentage';
import { triggerHaptic } from './utils/touch';
import { calculatePerPeriodStats, formatPeriodLabel, formatPeriodStats } from './utils/periodStats';

const GameView: React.FC = () => {
  const { state, startGame, resetGame, setPeriod, selectTeam, setTeamName, addShot, removeShot, undoLastShot } = useGame();
  const { showToast } = useToast();
  const [pendingLocation, setPendingLocation] = useState<{ x: number; y: number } | null>(null);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editValue, setEditValue] = useState('');
  const [shotToDelete, setShotToDelete] = useState<Shot | null>(null);

  // Auto-start game with default teams if not active
  React.useEffect(() => {
    if (!state.isGameActive) {
      startGame('Home', 'Away');
    }
  }, [state.isGameActive, startGame]);

  const handleShotLocation = (x: number, y: number) => {
    // NHL Convention: tap left = away shot, tap right = home shot
    const team = x < 50 ? 'away' : 'home';
    selectTeam(team);
    setPendingLocation({ x, y });
  };

  const handleShotSubmit = (shotType: ShotType, result: ShotResult) => {
    if (pendingLocation) {
      addShot(pendingLocation.x, pendingLocation.y, shotType, result);
      setPendingLocation(null);
      
      // Show toast notification
      if (result === 'goal') {
        showToast('🎉 GOAL! 🎉', 'celebration', 5000);
      } else {
        showToast('Shot recorded', 'success');
      }
    }
  };

  const handleShotCancel = () => {
    setPendingLocation(null);
  };

  const handleResetGame = () => {
    if (confirm('Reset game? This will clear all shots.')) {
      resetGame();
      showToast('Game reset', 'info');
    }
  };

  const handleEndGame = () => {
    if (confirm('End game and start fresh?')) {
      resetGame();
    }
  };

  const handleEditTeamName = (team: Team) => {
    const currentName = team === 'home' ? state.game?.homeTeam : state.game?.awayTeam;
    setEditingTeam(team);
    setEditValue(currentName || '');
  };

  const handleSaveTeamName = () => {
    if (editingTeam && editValue.trim()) {
      setTeamName(editingTeam, editValue.trim());
      setEditingTeam(null);
      setEditValue('');
    } else if (editingTeam) {
      // Reject empty names - just cancel the edit
      setEditingTeam(null);
      setEditValue('');
    }
  };

  const handleCancelEdit = () => {
    setEditingTeam(null);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveTeamName();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleShotMarkerClick = (shot: Shot) => {
    setShotToDelete(shot);
  };

  const handleDeleteConfirm = () => {
    if (shotToDelete) {
      removeShot(shotToDelete.id);
      triggerHaptic(20);
      setShotToDelete(null);
      showToast('Shot deleted', 'warning');
    }
  };

  const handleDeleteCancel = () => {
    setShotToDelete(null);
  };

  const handlePeriodChange = (period: Period) => {
    setPeriod(period);
    const periodLabel = period === 'OT' ? 'Overtime' : period === 1 ? '1st Period' : period === 2 ? '2nd Period' : '3rd Period';
    showToast(`Period changed to ${periodLabel}`, 'info');
  };

  if (!state.game) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">Loading...</div>;
  }

  // Calculate stats
  const homeShots = state.game.shots.filter(s => s.team === 'home');
  const awayShots = state.game.shots.filter(s => s.team === 'away');
  const homeGoals = homeShots.filter(s => s.result === 'goal').length;
  const awayGoals = awayShots.filter(s => s.result === 'goal').length;
  
  // Current period stats
  const homePeriodShots = homeShots.filter(s => s.period === state.game!.currentPeriod);
  const awayPeriodShots = awayShots.filter(s => s.period === state.game!.currentPeriod);
  const homePeriodGoals = homePeriodShots.filter(s => s.result === 'goal').length;
  const awayPeriodGoals = awayPeriodShots.filter(s => s.result === 'goal').length;
  
  // Shooting percentages
  const homeShootingPct = calculateShootingPercentage(homeGoals, homeShots.length);
  const awayShootingPct = calculateShootingPercentage(awayGoals, awayShots.length);
  const homePeriodShootingPct = calculateShootingPercentage(homePeriodGoals, homePeriodShots.length);
  const awayPeriodShootingPct = calculateShootingPercentage(awayPeriodGoals, awayPeriodShots.length);

  // Per-period breakdown
  const homePerPeriodStats = calculatePerPeriodStats(state.game.shots, 'home');
  const awayPerPeriodStats = calculatePerPeriodStats(state.game.shots, 'away');

  const periods: Period[] = [1, 2, 3, 'OT'];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="flex items-center justify-center gap-3 px-4 py-3">
          <button
            onClick={handleEndGame}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium text-sm hover:bg-gray-50 active:bg-gray-100"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z"/>
            </svg>
            End Game
          </button>
          <button
            onClick={handleResetGame}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium text-sm hover:bg-gray-50 active:bg-gray-100"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
            </svg>
            Reset Game
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4">
        {/* Team Cards */}
        <div className="flex gap-4 mb-4">
          {/* Home Team Card */}
          <div className={`flex-1 rounded-xl p-4 transition-all ${
            state.selectedTeam === 'home' ? 'bg-red-100 ring-2 ring-red-400' : 'bg-red-50'
          }`}>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">HOME</div>
            {editingTeam === 'home' ? (
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleSaveTeamName}
                onKeyDown={handleKeyDown}
                autoFocus
                className="text-base font-semibold text-gray-900 mt-1 pb-2 border-b-2 border-blue-500 bg-transparent w-full focus:outline-none"
                onFocus={(e) => e.target.select()}
              />
            ) : (
              <div 
                onClick={() => handleEditTeamName('home')}
                className="text-base font-semibold text-gray-900 mt-1 pb-2 border-b border-gray-300 cursor-pointer hover:border-blue-500 transition-colors min-h-[44px] flex items-center"
              >
                {state.game.homeTeam}
              </div>
            )}
            
            <div className="mt-4">
              <div className="text-xs text-gray-500 mb-2">Current Period</div>
              <div className="flex gap-8">
                <div>
                  <div className="text-4xl font-bold text-red-400 tabular-nums">{homePeriodShots.length}</div>
                  <div className="text-xs text-gray-500">Shots</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-red-400 tabular-nums">{homePeriodGoals}</div>
                  <div className="text-xs text-gray-500">Goals</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-red-400 tabular-nums">{homePeriodShootingPct.toFixed(1)}%</div>
                  <div className="text-xs text-gray-500">Sh%</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-red-200">
              <span className="text-xs text-gray-500">Game Total</span>
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-white rounded text-sm font-semibold text-gray-700 border border-gray-200">
                  {homeShots.length} S
                </span>
                <span className="px-2 py-1 bg-white rounded text-sm font-semibold text-gray-700 border border-gray-200">
                  {homeGoals} G
                </span>
                <span className="px-2 py-1 bg-white rounded text-sm font-semibold text-gray-700 border border-gray-200 tabular-nums">
                  {homeShootingPct.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Per-Period Breakdown */}
            {homePerPeriodStats.length > 0 && (
              <div className="mt-3 pt-3 border-t border-red-200">
                <div className="text-xs text-gray-500 mb-2">By Period</div>
                <div className="space-y-1">
                  {homePerPeriodStats.map(stats => (
                    <div key={stats.period} className="flex justify-between items-center text-xs">
                      <span className="text-gray-600">{formatPeriodLabel(stats.period)}</span>
                      <span className="font-semibold text-gray-700 tabular-nums">{formatPeriodStats(stats)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Away Team Card */}
          <div className={`flex-1 rounded-xl p-4 transition-all ${
            state.selectedTeam === 'away' ? 'bg-red-100 ring-2 ring-blue-400' : 'bg-red-50'
          }`}>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">AWAY</div>
            {editingTeam === 'away' ? (
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleSaveTeamName}
                onKeyDown={handleKeyDown}
                autoFocus
                className="text-base font-semibold text-gray-900 mt-1 pb-2 border-b-2 border-blue-500 bg-transparent w-full focus:outline-none"
                onFocus={(e) => e.target.select()}
              />
            ) : (
              <div 
                onClick={() => handleEditTeamName('away')}
                className="text-base font-semibold text-gray-900 mt-1 pb-2 border-b border-gray-300 cursor-pointer hover:border-blue-500 transition-colors min-h-[44px] flex items-center"
              >
                {state.game.awayTeam}
              </div>
            )}
            
            <div className="mt-4">
              <div className="text-xs text-gray-500 mb-2">Current Period</div>
              <div className="flex gap-8">
                <div>
                  <div className="text-4xl font-bold text-orange-400 tabular-nums">{awayPeriodShots.length}</div>
                  <div className="text-xs text-gray-500">Shots</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-orange-400 tabular-nums">{awayPeriodGoals}</div>
                  <div className="text-xs text-gray-500">Goals</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-orange-400 tabular-nums">{awayPeriodShootingPct.toFixed(1)}%</div>
                  <div className="text-xs text-gray-500">Sh%</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-red-200">
              <span className="text-xs text-gray-500">Game Total</span>
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-white rounded text-sm font-semibold text-gray-700 border border-gray-200">
                  {awayShots.length} S
                </span>
                <span className="px-2 py-1 bg-white rounded text-sm font-semibold text-gray-700 border border-gray-200">
                  {awayGoals} G
                </span>
                <span className="px-2 py-1 bg-white rounded text-sm font-semibold text-gray-700 border border-gray-200 tabular-nums">
                  {awayShootingPct.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Per-Period Breakdown */}
            {awayPerPeriodStats.length > 0 && (
              <div className="mt-3 pt-3 border-t border-red-200">
                <div className="text-xs text-gray-500 mb-2">By Period</div>
                <div className="space-y-1">
                  {awayPerPeriodStats.map(stats => (
                    <div key={stats.period} className="flex justify-between items-center text-xs">
                      <span className="text-gray-600">{formatPeriodLabel(stats.period)}</span>
                      <span className="font-semibold text-gray-700 tabular-nums">{formatPeriodStats(stats)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Rink Card */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          {/* Period Selector */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-center gap-2 mb-3">
              <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
              </svg>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Period</span>
            </div>
            <div className="flex justify-center gap-2">
              {periods.map((period) => (
                <button
                  key={period}
                  onClick={() => handlePeriodChange(period)}
                  className={`px-5 py-2 rounded-lg font-semibold text-sm min-w-[60px] transition-colors border
                    ${state.game!.currentPeriod === period
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 active:bg-gray-100'
                    }`}
                >
                  {period === 'OT' ? 'OT' : period === 1 ? '1st' : period === 2 ? '2nd' : '3rd'}
                </button>
              ))}
            </div>
          </div>
          
          {/* Rink */}
          <div className="p-2">
            <Rink onShotLocation={handleShotLocation}>
              {state.game.shots.map((shot) => (
                <ShotMarker key={shot.id} shot={shot} onClick={handleShotMarkerClick} />
              ))}
            </Rink>
          </div>

          {/* Undo Button */}
          {state.game.shots.length > 0 && (
            <div className="p-3 border-t border-gray-100">
              <button
                onClick={undoLastShot}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-amber-50 text-amber-700 font-medium text-sm hover:bg-amber-100 active:bg-amber-200 border border-amber-200"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/>
                </svg>
                Undo Last Shot
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Shot Form Modal */}
      {pendingLocation && (
        <ShotForm onSubmit={handleShotSubmit} onCancel={handleShotCancel} />
      )}

      {/* Delete Shot Dialog */}
      {shotToDelete && state.game && (
        <DeleteShotDialog
          shot={shotToDelete}
          homeTeam={state.game.homeTeam}
          awayTeam={state.game.awayTeam}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}
    </div>
  );
};

function App() {
  return (
    <GameProvider>
      <GameView />
    </GameProvider>
  );
}

export default App;

