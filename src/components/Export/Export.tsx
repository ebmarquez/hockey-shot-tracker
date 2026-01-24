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
    <div className="bg-white shadow-lg rounded-lg p-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Export</h2>
      <div className="space-y-3">
        <button
          onClick={handleExportPNG}
          disabled={isExporting}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 
            text-white font-bold py-4 px-6 rounded-lg transition-all min-h-[56px]
            flex items-center justify-center gap-2"
        >
          {isExporting ? '⏳ Exporting...' : '📷 Export as PNG'}
        </button>
        <button
          onClick={handleExportPDF}
          disabled={isExporting}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 
            text-white font-bold py-4 px-6 rounded-lg transition-all min-h-[56px]
            flex items-center justify-center gap-2"
        >
          {isExporting ? '⏳ Exporting...' : '📄 Export as PDF'}
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-3 text-center">
        Export your shot chart and statistics
      </p>
    </div>
  );
};

export default Export;
