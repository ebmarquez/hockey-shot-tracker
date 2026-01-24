import React from 'react';
import type { Game } from '../../types';
import { exportToPNG } from '../../utils/exportImage';
import { exportToPDF } from '../../utils/exportPDF';

interface ExportProps {
  game: Game;
  chartElementId: string;
}

const Export: React.FC<ExportProps> = ({ game, chartElementId }) => {
  const [isExporting, setIsExporting] = React.useState(false);

  const handleExportPNG = async () => {
    setIsExporting(true);
    try {
      const element = document.getElementById(chartElementId);
      if (element) {
        await exportToPNG(element, `${game.homeTeam}-vs-${game.awayTeam}.png`);
      }
    } catch (err) {
      console.error('Export PNG error:', err);
      alert('Failed to export PNG. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const element = document.getElementById(chartElementId);
      if (element) {
        await exportToPDF(game, element);
      }
    } catch (err) {
      console.error('Export PDF error:', err);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white shadow-xl rounded-xl p-5">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2 justify-center">
        <span className="text-2xl">📊</span>
        Export Game Data
      </h2>
      <div className="space-y-3">
        <button
          onClick={handleExportPNG}
          disabled={isExporting}
          className="w-full bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 
            disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-5 px-6 
            rounded-xl transition-all min-h-[68px] shadow-md hover:shadow-lg active:scale-95
            flex items-center justify-center gap-3"
        >
          <span className="text-3xl">📷</span>
          <span>{isExporting ? 'Exporting...' : 'Export as Image'}</span>
        </button>
        <button
          onClick={handleExportPDF}
          disabled={isExporting}
          className="w-full bg-gradient-to-br from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800
            disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-5 px-6 
            rounded-xl transition-all min-h-[68px] shadow-md hover:shadow-lg active:scale-95
            flex items-center justify-center gap-3"
        >
          <span className="text-3xl">📄</span>
          <span>{isExporting ? 'Exporting...' : 'Export as PDF'}</span>
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-4 text-center leading-relaxed">
        Save your shot chart and game statistics
      </p>
    </div>
  );
};

export default Export;
