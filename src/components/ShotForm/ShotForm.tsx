import React, { useState } from 'react';
import type { ShotType, ShotResult } from '../../types';

interface ShotFormProps {
  onSubmit: (shotType: ShotType, result: ShotResult) => void;
  onCancel: () => void;
}

const ShotForm: React.FC<ShotFormProps> = ({ onSubmit, onCancel }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isGoal, setIsGoal] = useState<boolean | null>(null);
  const [shotType, setShotType] = useState<ShotType>('wrist');

  const handleQuickSelect = (goal: boolean) => {
    setIsGoal(goal);
    setShowDetails(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isGoal === null) return;
    
    const result: ShotResult = isGoal ? 'goal' : 'save';
    onSubmit(shotType, result);
  };

  const shotTypes: { value: ShotType; label: string; emoji: string }[] = [
    { value: 'wrist', label: 'Wrist', emoji: '🎯' },
    { value: 'slap', label: 'Slap', emoji: '💥' },
    { value: 'snap', label: 'Snap', emoji: '⚡' },
    { value: 'backhand', label: 'Backhand', emoji: '🔄' },
    { value: 'tip', label: 'Tip', emoji: '👆' },
  ];

  // Initial simple view - just Shot or Goal
  if (!showDetails) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">What happened?</h2>

          <div className="space-y-4">
            <button
              onClick={() => handleQuickSelect(true)}
              className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 
                text-white font-bold py-8 px-8 rounded-xl text-2xl
                transition-all shadow-lg min-h-[80px] flex items-center justify-center gap-4"
            >
              <span className="text-4xl">🥅</span>
              <span>GOAL</span>
            </button>

            <button
              onClick={() => handleQuickSelect(false)}
              className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 
                text-white font-bold py-8 px-8 rounded-xl text-2xl
                transition-all shadow-lg min-h-[80px] flex items-center justify-center gap-4"
            >
              <span className="text-4xl">🏒</span>
              <span>SHOT</span>
            </button>

            <button
              onClick={onCancel}
              className="w-full bg-gray-300 hover:bg-gray-400 active:bg-gray-500 
                text-gray-800 font-bold py-4 px-6 rounded-lg
                transition-all min-h-[56px] mt-4"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Detailed view - select shot type
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {isGoal ? '🥅 Goal!' : '🏒 Shot'}
        </h2>
        <p className="text-gray-600 mb-4">Select shot type:</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Shot Type Selection */}
          <div className="grid grid-cols-3 gap-2">
            {shotTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setShotType(type.value)}
                className={`p-4 rounded-lg border-2 transition-all min-h-[64px]
                  ${
                    shotType === type.value
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-300'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
              >
                <div className="text-3xl mb-1">{type.emoji}</div>
                <div className="text-xs font-medium">{type.label}</div>
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowDetails(false)}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-4 px-6 
                rounded-lg transition-colors min-h-[56px]"
            >
              Back
            </button>
            <button
              type="submit"
              className={`flex-2 ${isGoal ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} 
                text-white font-bold py-4 px-8 rounded-lg transition-colors min-h-[56px] flex-grow`}
            >
              Save {isGoal ? 'Goal' : 'Shot'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShotForm;
