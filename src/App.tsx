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
  const { state, startGame, endGame, setPeriod, selectTeam, addShot, undoLastShot } = useGame();
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

  if (!state.isGameActive || !state.game) {
    return <GameSetup onStart={handleStartGame} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-4 mb-4 shadow-lg">
          <h1 className="text-2xl font-bold text-center">🏒 Hockey Shot Tracker</h1>
          <div className="text-center mt-2">
            <span className="text-lg">{state.game.homeTeam} vs {state.game.awayTeam}</span>
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

