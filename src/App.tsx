import React, { useState } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import GameSetup from './components/GameSetup/GameSetup';
import Rink from './components/Rink/Rink';
import ShotMarker from './components/ShotMarker/ShotMarker';
import ShotForm from './components/ShotForm/ShotForm';
import GameControls from './components/GameControls/GameControls';
import Statistics from './components/Statistics/Statistics';
import Export from './components/Export/Export';
import type { ShotType, ShotResult } from './types';

const GameView: React.FC = () => {
  const { state, startGame, endGame, resetGame, setPeriod, selectTeam, addShot, undoLastShot } = useGame();
  const [pendingLocation, setPendingLocation] = useState<{ x: number; y: number } | null>(null);

  const handleStartGame = (homeTeam: string, awayTeam: string) => {
    startGame(homeTeam, awayTeam);
  };

  const handleShotLocation = (x: number, y: number) => {
    if (state.selectedTeam) {
      setPendingLocation({ x, y });
    } else {
      alert('Please select a team first');
    }
  };

  const handleShotSubmit = (shotType: ShotType, result: ShotResult) => {
    if (pendingLocation) {
      addShot(pendingLocation.x, pendingLocation.y, shotType, result);
      setPendingLocation(null);
    }
  };

  const handleShotCancel = () => {
    setPendingLocation(null);
  };

  const handleResetGame = () => {
    if (confirm('Reset game? This will clear all shots and scores but keep the teams.')) {
      resetGame();
    }
  };

  if (!state.isGameActive || !state.game) {
    return <GameSetup onStart={handleStartGame} />;
  }

  // Calculate scores and SOG
  const homeShots = state.game.shots.filter(s => s.team === 'home');
  const awayShots = state.game.shots.filter(s => s.team === 'away');
  const homeGoals = homeShots.filter(s => s.result === 'goal').length;
  const awayGoals = awayShots.filter(s => s.result === 'goal').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
        {/* Scoreboard Header */}
        <div className="bg-white rounded-xl shadow-xl p-4 mb-4">
          <div className="flex items-center justify-between">
            {/* Home Team */}
            <div className="flex-1 text-center">
              <div className="text-sm text-gray-600 font-medium mb-1">HOME</div>
              <div className="text-2xl sm:text-3xl font-bold text-green-700">{state.game.homeTeam}</div>
              <div className="flex items-center justify-center gap-4 mt-2">
                <div>
                  <div className="text-4xl sm:text-5xl font-bold text-green-600">{homeGoals}</div>
                  <div className="text-xs text-gray-500">Goals</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-semibold text-gray-700">{homeShots.length}</div>
                  <div className="text-xs text-gray-500">SOG</div>
                </div>
              </div>
            </div>

            {/* Period Indicator */}
            <div className="px-4">
              <div className="text-center bg-blue-600 text-white rounded-lg px-4 py-2">
                <div className="text-xs font-medium">PERIOD</div>
                <div className="text-2xl font-bold">
                  {state.game.currentPeriod === 'OT' ? 'OT' : state.game.currentPeriod}
                </div>
              </div>
            </div>

            {/* Away Team */}
            <div className="flex-1 text-center">
              <div className="text-sm text-gray-600 font-medium mb-1">AWAY</div>
              <div className="text-2xl sm:text-3xl font-bold text-blue-700">{state.game.awayTeam}</div>
              <div className="flex items-center justify-center gap-4 mt-2">
                <div>
                  <div className="text-4xl sm:text-5xl font-bold text-blue-600">{awayGoals}</div>
                  <div className="text-xs text-gray-500">Goals</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-semibold text-gray-700">{awayShots.length}</div>
                  <div className="text-xs text-gray-500">SOG</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column - Controls */}
          <div className="space-y-4">
            <GameControls
              currentPeriod={state.game.currentPeriod}
              onPeriodChange={setPeriod}
              selectedTeam={state.selectedTeam}
              onTeamSelect={selectTeam}
              homeTeam={state.game.homeTeam}
              awayTeam={state.game.awayTeam}
              onEndGame={endGame}
              onResetGame={handleResetGame}
              onUndo={undoLastShot}
              canUndo={state.game.shots.length > 0}
            />
            <Statistics game={state.game} />
          </div>

          {/* Center Column - Rink */}
          <div className="lg:col-span-2 space-y-4">
            <div id="shot-chart" className="bg-white rounded-lg p-4 shadow-lg">
              <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
                Rink - Tap to Record Shot
              </h2>
              <Rink onShotLocation={handleShotLocation}>
                {state.game.shots.map((shot) => (
                  <ShotMarker key={shot.id} shot={shot} />
                ))}
              </Rink>
              {state.selectedTeam && (
                <div className="mt-3 text-center text-sm text-gray-600">
                  Selected: <span className="font-bold">
                    {state.selectedTeam === 'home' ? state.game.homeTeam : state.game.awayTeam}
                  </span> - Tap on rink to mark shot location
                </div>
              )}
            </div>
            <Export game={state.game} chartElementId="shot-chart" />
          </div>
        </div>
      </div>

      {/* Shot Form Modal */}
      {pendingLocation && (
        <ShotForm onSubmit={handleShotSubmit} onCancel={handleShotCancel} />
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

