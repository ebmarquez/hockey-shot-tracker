import React, { useEffect, useRef } from 'react';
import type { Shot } from '../../types';

interface DeleteShotDialogProps {
  shot: Shot;
  homeTeam: string;
  awayTeam: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteShotDialog: React.FC<DeleteShotDialogProps> = ({
  shot,
  homeTeam,
  awayTeam,
  onConfirm,
  onCancel,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Focus trap and escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  // Format timestamp
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Format period label
  const formatPeriod = (period: number | 'OT') => {
    if (period === 'OT') return 'OT';
    if (period === 1) return '1st';
    if (period === 2) return '2nd';
    if (period === 3) return '3rd';
    return `${period}`;
  };

  // Format result
  const formatResult = (result: string) => {
    return result.charAt(0).toUpperCase() + result.slice(1);
  };

  const teamName = shot.team === 'home' ? homeTeam : awayTeam;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onCancel}
    >
      <div 
        ref={dialogRef}
        className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        {/* Header */}
        <div className="bg-red-600 text-white px-6 py-4">
          <h2 id="dialog-title" className="text-xl font-bold">
            Delete Shot?
          </h2>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-500">Team:</span>
              <span className="text-base font-semibold text-gray-900">{teamName}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-500">Period:</span>
              <span className="text-base font-semibold text-gray-900">{formatPeriod(shot.period)}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-500">Result:</span>
              <span className="text-base font-semibold text-gray-900">{formatResult(shot.result)}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-500">Time:</span>
              <span className="text-base font-semibold text-gray-900">{formatTime(shot.timestamp)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onCancel}
            className="flex-1 min-h-[48px] px-6 py-3 rounded-lg border border-gray-300 bg-white text-gray-700 font-semibold text-base hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 min-h-[48px] px-6 py-3 rounded-lg bg-red-600 text-white font-semibold text-base hover:bg-red-700 active:bg-red-800 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteShotDialog;
