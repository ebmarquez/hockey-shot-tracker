import React, { useEffect, useRef } from 'react';
import type { Game } from '../../types';
import { triggerHaptic } from '../../utils/touch';

interface EndGameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onViewSummary: () => void;
  onNewGame: () => void;
  game: Game;
}

const EndGameDialog: React.FC<EndGameDialogProps> = ({
  isOpen,
  onClose,
  onViewSummary,
  onNewGame,
  game,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Calculate goals
  const homeGoals = game.shots.filter(s => s.team === 'home' && s.result === 'goal').length;
  const awayGoals = game.shots.filter(s => s.team === 'away' && s.result === 'goal').length;

  // Focus trap and escape key handler
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';

    // Focus the close button on open
    closeButtonRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleViewSummary = () => {
    triggerHaptic(10);
    onViewSummary();
  };

  const handleNewGame = () => {
    triggerHaptic(20);
    onNewGame();
  };

  const handleClose = () => {
    triggerHaptic(10);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={handleClose}
    >
      <div 
        ref={dialogRef}
        className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="end-game-dialog-title"
      >
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-4 text-center">
          <h2 id="end-game-dialog-title" className="text-xl font-bold">
            Game Complete!
          </h2>
        </div>

        {/* Content - Score Display */}
        <div className="p-6 space-y-4">
          {/* Home Team Score */}
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <span className="text-lg font-semibold text-gray-900">{game.homeTeam}</span>
            <span className="text-3xl font-bold text-red-500 tabular-nums">{homeGoals}</span>
          </div>

          {/* Away Team Score */}
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <span className="text-lg font-semibold text-gray-900">{game.awayTeam}</span>
            <span className="text-3xl font-bold text-blue-500 tabular-nums">{awayGoals}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 px-6 pb-6">
          {/* Primary Action - View Summary */}
          <button
            onClick={handleViewSummary}
            className="w-full min-h-[48px] px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold text-base hover:bg-blue-700 active:bg-blue-800 transition-colors"
          >
            View Summary
          </button>

          {/* Secondary Actions */}
          <div className="flex gap-3">
            <button
              ref={closeButtonRef}
              onClick={handleClose}
              className="flex-1 min-h-[48px] px-6 py-3 rounded-lg border border-gray-300 bg-white text-gray-700 font-semibold text-base hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleNewGame}
              className="flex-1 min-h-[48px] px-6 py-3 rounded-lg border border-red-300 bg-white text-red-700 font-semibold text-base hover:bg-red-50 active:bg-red-100 transition-colors"
            >
              New Game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EndGameDialog;
