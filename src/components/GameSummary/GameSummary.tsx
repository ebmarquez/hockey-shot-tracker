import React, { useEffect, useRef, useState } from 'react';
import type { Game, Shot, Period } from '../../types';
import ShotMarker from '../ShotMarker/ShotMarker';
import { calculateShootingPercentage } from '../../utils/shootingPercentage';
import { calculatePerPeriodStats, formatPeriodLabel } from '../../utils/periodStats';
import { exportToPNG } from '../../utils/exportImage';
import { exportToPDF } from '../../utils/exportPDF';

interface GameSummaryProps {
  isOpen: boolean;
  onClose: () => void;
  game: Game;
}

/**
 * MiniRink component - A scaled-down version of the Rink for period shot maps
 */
const MiniRink: React.FC<{ shots: Shot[]; period: Period }> = ({ shots, period }) => {
  const periodShots = shots.filter(shot => shot.period === period);

  return (
    <div className="relative w-full">
      <div className="relative">
        <svg
          viewBox="0 0 200 85"
          className="w-full h-auto"
        >
          {/* Ice surface with gradient */}
          <defs>
            <linearGradient id={`ice-gradient-${period}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#e8f4f8', stopOpacity: 1 }} />
              <stop offset="50%" style={{ stopColor: '#ffffff', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#e8f4f8', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          
          {/* Ice surface */}
          <rect x="0" y="0" width="200" height="85" fill={`url(#ice-gradient-${period})`} />
          
          {/* Boards */}
          <rect x="0" y="0" width="200" height="85" fill="none" stroke="#1e3a8a" strokeWidth="1.5" rx="4" />
          
          {/* Center red line */}
          <rect x="98.5" y="0" width="3" height="85" fill="#dc2626" />
          
          {/* Blue lines */}
          <rect x="58.5" y="0" width="2.5" height="85" fill="#2563eb" />
          <rect x="139" y="0" width="2.5" height="85" fill="#2563eb" />
          
          {/* Goal lines */}
          <rect x="10.5" y="0" width="1" height="85" fill="#dc2626" />
          <rect x="188.5" y="0" width="1" height="85" fill="#dc2626" />
          
          {/* Center ice circle */}
          <circle cx="100" cy="42.5" r="15" fill="none" stroke="#2563eb" strokeWidth="1" />
        </svg>
        
        {/* Shot markers overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {periodShots.map((shot) => (
            <ShotMarker key={shot.id} shot={shot} />
          ))}
        </div>
      </div>
    </div>
  );
};

const GameSummary: React.FC<GameSummaryProps> = ({ isOpen, onClose, game }) => {
  const summaryRef = useRef<HTMLDivElement>(null);
  const shotMapRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Calculate stats
  const homeShots = game.shots.filter(s => s.team === 'home');
  const awayShots = game.shots.filter(s => s.team === 'away');
  const homeGoals = homeShots.filter(s => s.result === 'goal').length;
  const awayGoals = awayShots.filter(s => s.result === 'goal').length;
  
  const homeShootingPct = calculateShootingPercentage(homeGoals, homeShots.length);
  const awayShootingPct = calculateShootingPercentage(awayGoals, awayShots.length);

  // Define all periods and determine which have shots
  const allPeriods: Period[] = [1, 2, 3, 'OT'];
  const periodsWithShots = allPeriods.filter(period => 
    game.shots.some(shot => shot.period === period)
  );
  // If no shots, show all regular periods
  const periodsToShow: Period[] = periodsWithShots.length > 0 ? periodsWithShots : [1, 2, 3];

  // Sort shots by timestamp (newest first)
  const sortedShots = [...game.shots].sort((a, b) => b.timestamp - a.timestamp);

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

  // Format period label for shot list
  const formatPeriodShort = (period: Period): string => {
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

  // Per-period stats using existing utility
  const homePerPeriodStats = calculatePerPeriodStats(game.shots, 'home');
  const awayPerPeriodStats = calculatePerPeriodStats(game.shots, 'away');

  // Export handlers
  const handleExportPNG = async () => {
    setIsExporting(true);
    try {
      if (shotMapRef.current) {
        await exportToPNG(shotMapRef.current, `${game.homeTeam}-vs-${game.awayTeam}-summary.png`);
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
      if (shotMapRef.current) {
        await exportToPDF(game, shotMapRef.current);
      }
    } catch (err) {
      console.error('Export PDF error:', err);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        ref={summaryRef}
        className="bg-white w-full min-h-screen md:min-h-0 md:max-w-2xl md:my-4 md:rounded-xl md:shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="summary-title"
      >
        {/* Header */}
        <div className="bg-blue-600 text-white px-4 py-4 sticky top-0 z-10">
          <div className="flex items-center">
            <button
              onClick={onClose}
              className="p-2 -ml-2 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Close summary"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 id="summary-title" className="text-xl font-bold flex-1 text-center pr-10">
              GAME SUMMARY
            </h1>
          </div>
        </div>

        {/* Final Score */}
        <div className="bg-gray-50 px-4 py-6 border-b border-gray-200">
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Home</div>
              <div className="text-lg font-bold text-gray-900">{game.homeTeam}</div>
            </div>
            <div className="text-center px-4">
              <div className="text-4xl font-bold tabular-nums">
                <span className="text-red-500">{homeGoals}</span>
                <span className="text-gray-400 mx-2">-</span>
                <span className="text-blue-500">{awayGoals}</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Away</div>
              <div className="text-lg font-bold text-gray-900">{game.awayTeam}</div>
            </div>
          </div>
        </div>

        {/* Period Shot Maps */}
        <div className="px-4 py-4 border-b border-gray-200" ref={shotMapRef}>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 text-center">
            Shot Maps by Period
          </h2>
          <div className={`grid gap-3 ${periodsToShow.length <= 3 ? 'grid-cols-3' : 'grid-cols-2 md:grid-cols-4'}`}>
            {periodsToShow.map((period) => {
              const periodShots = game.shots.filter(s => s.period === period);
              return (
                <div key={period} className="bg-white rounded-lg border border-gray-200 p-2">
                  <div className="text-xs font-semibold text-center text-gray-600 mb-1">
                    {formatPeriodLabel(period)}
                  </div>
                  <MiniRink shots={game.shots} period={period} />
                  <div className="text-xs text-center text-gray-500 mt-1">
                    {periodShots.length} {periodShots.length === 1 ? 'shot' : 'shots'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Shot List */}
        <div className="px-4 py-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Shot List
          </h2>
          {sortedShots.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-2 px-2 text-left font-semibold text-gray-600">Period</th>
                    <th className="py-2 px-2 text-left font-semibold text-gray-600">Team</th>
                    <th className="py-2 px-2 text-left font-semibold text-gray-600">Time</th>
                    <th className="py-2 px-2 text-left font-semibold text-gray-600">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedShots.map((shot) => (
                    <tr key={shot.id} className="border-b border-gray-100 last:border-b-0">
                      <td className="py-2 px-2 text-gray-900">{formatPeriodShort(shot.period)}</td>
                      <td className="py-2 px-2">
                        <span className={`font-medium ${shot.team === 'home' ? 'text-red-600' : 'text-blue-600'}`}>
                          {shot.team === 'home' ? game.homeTeam : game.awayTeam}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-gray-900 tabular-nums">{formatTime(shot.timestamp)}</td>
                      <td className="py-2 px-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          shot.result === 'goal' 
                            ? 'bg-green-100 text-green-800' 
                            : shot.result === 'save'
                            ? 'bg-blue-100 text-blue-800'
                            : shot.result === 'miss'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {formatResult(shot.result)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-4">
              No shots recorded
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="px-4 py-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Statistics
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-2 px-2 text-left font-semibold text-gray-600"></th>
                  <th className="py-2 px-3 text-center font-semibold text-red-600">{game.homeTeam}</th>
                  <th className="py-2 px-3 text-center font-semibold text-blue-600">{game.awayTeam}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-2 px-2 font-medium text-gray-700">Total Shots</td>
                  <td className="py-2 px-3 text-center tabular-nums">{homeShots.length}</td>
                  <td className="py-2 px-3 text-center tabular-nums">{awayShots.length}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 px-2 font-medium text-gray-700">Goals</td>
                  <td className="py-2 px-3 text-center tabular-nums font-bold">{homeGoals}</td>
                  <td className="py-2 px-3 text-center tabular-nums font-bold">{awayGoals}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 px-2 font-medium text-gray-700">Shooting %</td>
                  <td className="py-2 px-3 text-center tabular-nums">{homeShootingPct.toFixed(1)}%</td>
                  <td className="py-2 px-3 text-center tabular-nums">{awayShootingPct.toFixed(1)}%</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Per-Period Breakdown */}
          {(homePerPeriodStats.length > 0 || awayPerPeriodStats.length > 0) && (
            <div className="mt-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                By Period
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {/* Home Team Period Stats */}
                <div className="bg-red-50 rounded-lg p-3">
                  <div className="text-xs font-semibold text-red-600 mb-2">{game.homeTeam}</div>
                  {homePerPeriodStats.length > 0 ? (
                    <div className="space-y-1">
                      {homePerPeriodStats.map(stat => (
                        <div key={stat.period} className="flex justify-between text-xs">
                          <span className="text-gray-600">{formatPeriodLabel(stat.period)}</span>
                          <span className="font-semibold text-gray-800 tabular-nums">{stat.goals}G / {stat.shots}S</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500">No shots</div>
                  )}
                </div>

                {/* Away Team Period Stats */}
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="text-xs font-semibold text-blue-600 mb-2">{game.awayTeam}</div>
                  {awayPerPeriodStats.length > 0 ? (
                    <div className="space-y-1">
                      {awayPerPeriodStats.map(stat => (
                        <div key={stat.period} className="flex justify-between text-xs">
                          <span className="text-gray-600">{formatPeriodLabel(stat.period)}</span>
                          <span className="font-semibold text-gray-800 tabular-nums">{stat.goals}G / {stat.shots}S</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500">No shots</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Export Buttons */}
        <div className="px-4 py-6 bg-gray-50">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleExportPNG}
              disabled={isExporting}
              className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 font-semibold py-4 px-4 
                rounded-lg transition-colors min-h-[56px] hover:bg-gray-50 active:bg-gray-100
                disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{isExporting ? 'Exporting...' : 'Export PNG'}</span>
            </button>
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-4 px-4 
                rounded-lg transition-colors min-h-[56px] hover:bg-blue-700 active:bg-blue-800
                disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>{isExporting ? 'Exporting...' : 'Export PDF'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameSummary;
