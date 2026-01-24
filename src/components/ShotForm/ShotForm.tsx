import React, { useState } from 'react';
import type { ShotType, ShotResult } from '../../types';

interface ShotFormProps {
  onSubmit: (shotType: ShotType, result: ShotResult) => void;
  onCancel: () => void;
}

const ShotForm: React.FC<ShotFormProps> = ({ onSubmit, onCancel }) => {
  const [shotType, setShotType] = useState<ShotType>('wrist');
  const [result, setResult] = useState<ShotResult>('save');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(shotType, result);
  };

  const shotTypes: { value: ShotType; label: string; emoji: string }[] = [
    { value: 'wrist', label: 'Wrist', emoji: '🎯' },
    { value: 'slap', label: 'Slap', emoji: '💥' },
    { value: 'snap', label: 'Snap', emoji: '⚡' },
    { value: 'backhand', label: 'Backhand', emoji: '🔄' },
    { value: 'tip', label: 'Tip', emoji: '👆' },
  ];

  const results: { value: ShotResult; label: string; color: string }[] = [
    { value: 'goal', label: 'Goal', color: 'bg-green-500 hover:bg-green-600' },
    { value: 'save', label: 'Save', color: 'bg-blue-500 hover:bg-blue-600' },
    { value: 'miss', label: 'Miss', color: 'bg-orange-500 hover:bg-orange-600' },
    { value: 'blocked', label: 'Blocked', color: 'bg-red-500 hover:bg-red-600' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Record Shot</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Shot Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Shot Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {shotTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setShotType(type.value)}
                  className={`p-4 rounded-lg border-2 transition-all min-h-[56px]
                    ${
                      shotType === type.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                >
                  <div className="text-2xl mb-1">{type.emoji}</div>
                  <div className="text-xs font-medium">{type.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Result Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Result
            </label>
            <div className="grid grid-cols-2 gap-3">
              {results.map((res) => (
                <button
                  key={res.value}
                  type="button"
                  onClick={() => setResult(res.value)}
                  className={`p-4 rounded-lg text-white font-bold transition-all min-h-[56px]
                    ${res.color}
                    ${result === res.value ? 'ring-4 ring-offset-2 ring-gray-400' : ''}`}
                >
                  {res.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-4 px-6 
                rounded-lg transition-colors min-h-[56px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 
                rounded-lg transition-colors min-h-[56px]"
            >
              Save Shot
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShotForm;
