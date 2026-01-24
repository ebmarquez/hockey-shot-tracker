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
    <div className="bg-slate-800/50 rounded-2xl border border-white/10 p-4">
      <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">
        Export Game Data
      </h2>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleExportPNG}
          disabled={isExporting}
          className="bg-slate-700/50 hover:bg-slate-700 active:bg-slate-600
            disabled:bg-slate-800/50 disabled:text-slate-600 disabled:cursor-not-allowed
            text-slate-300 font-semibold py-4 px-4 
            rounded-xl transition-all min-h-[56px] border border-white/10
            flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{isExporting ? 'Exporting...' : 'Save Image'}</span>
        </button>
        <button
          onClick={handleExportPDF}
          disabled={isExporting}
          className="bg-slate-700/50 hover:bg-slate-700 active:bg-slate-600
            disabled:bg-slate-800/50 disabled:text-slate-600 disabled:cursor-not-allowed
            text-slate-300 font-semibold py-4 px-4 
            rounded-xl transition-all min-h-[56px] border border-white/10
            flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>{isExporting ? 'Exporting...' : 'Save PDF'}</span>
        </button>
      </div>
    </div>
  );
};

export default Export;
