import React from 'react';
import type { ShotType, ShotResult } from '../../types';

interface ShotFormProps {
  onSubmit: (shotType: ShotType, result: ShotResult) => void;
  onCancel: () => void;
}

const ShotForm: React.FC<ShotFormProps> = ({ onSubmit, onCancel }) => {
  // Quick submit - defaults to wrist shot
  const handleSubmit = (result: ShotResult) => {
    onSubmit('wrist', result);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl p-5 w-full max-w-sm">
        <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Shot Result</h2>

        <div className="space-y-3">
          {/* GOAL */}
          <button
            onClick={() => handleSubmit('goal')}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-xl text-lg transition-colors flex items-center justify-center gap-3"
          >
            <span className="text-2xl">🥅</span>
            GOAL
          </button>

          {/* SAVE */}
          <button
            onClick={() => handleSubmit('save')}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-xl text-lg transition-colors flex items-center justify-center gap-3"
          >
            <span className="text-2xl">🧤</span>
            SAVE
          </button>

          {/* MISS */}
          <button
            onClick={() => handleSubmit('miss')}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 px-6 rounded-xl text-lg transition-colors flex items-center justify-center gap-3"
          >
            <span className="text-2xl">❌</span>
            MISS
          </button>

          {/* BLOCKED */}
          <button
            onClick={() => handleSubmit('blocked')}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-4 px-6 rounded-xl text-lg transition-colors flex items-center justify-center gap-3"
          >
            <span className="text-2xl">🛡️</span>
            BLOCKED
          </button>

          {/* Cancel */}
          <button
            onClick={onCancel}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium py-3 px-6 rounded-xl transition-colors mt-2"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShotForm;
