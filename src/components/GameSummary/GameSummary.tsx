import React, { useEffect, useRef, useState } from 'react';
import type { Game, Shot, Team, Period } from '../../types';
import { calculateShootingPercentage } from '../../utils/shootingPercentage';
import { calculatePerPeriodStats, formatPeriodLabel } from '../../utils/periodStats';
import { exportToPNG, elementToCanvas, canvasToBlob } from '../../utils/exportImage';
import { exportToPDF } from '../../utils/exportPDF';
import { shareGameSummary } from '../../utils/share';

interface GameSummaryProps {
  isOpen: boolean;
  onClose: () => void;
  game: Game;
}

/**
 * ShotMarkerSummary - A shot marker for summary view that correctly maps coordinates
 * Uses the same vertical rink coordinate system as the main Rink component
 */
const ShotMarkerSummary: React.FC<{ shot: Shot }> = ({ shot }) => {
  const isGoal = shot.result === 'goal';
  const isHome = shot.team === 'home';

  // Colors: home = red/coral, away = gray/slate
  const strokeColor = isHome ? '#f87171' : '#94a3b8';
  const fillColor = isGoal ? (isHome ? '#ef4444' : '#64748b') : 'transparent';

  // For vertical rink: transform horizontal rink coordinates to vertical screen coordinates
  // Same transformation as the main Rink's ShotMarker
  // Rink X (0-100, left to right) -> Screen Y (0-100, top to bottom)
  // Rink Y (0-100, top to bottom) -> Screen X (0-100, left to right)
  const screenLeft = shot.y;  // Rink Y becomes screen X
  const screenTop = shot.x;   // Rink X becomes screen Y

  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      style={{
        left: `${screenLeft}%`,
        top: `${screenTop}%`,
      }}
      title={`${shot.team} - ${shot.result} (${shot.shotType})`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24">
        {/* Outer ring for goals */}
        {isGoal && (
          <circle
            cx="12"
            cy="12"
            r="11"
            fill="none"
            stroke={isHome ? '#fca5a5' : '#cbd5e1'}
            strokeWidth="2"
            opacity="0.7"
          />
        )}
        {/* Main circle */}
        <circle
          cx="12"
          cy="12"
          r={isGoal ? 7 : 8}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth="2"
        />
      </svg>
    </div>
  );
};

/**
 * TeamShotMap component - A vertical rink showing shots for a specific team
 * Uses the same vertical orientation as the main Rink for correct shot alignment
 */
const TeamShotMap: React.FC<{ shots: Shot[]; team: Team; teamName: string }> = ({ shots, team, teamName }) => {
  const teamShots = shots.filter(shot => shot.team === team);
  const goals = teamShots.filter(s => s.result === 'goal').length;
  const isHome = team === 'home';
  const uniqueId = `team-${team}`;

  return (
    <div className="flex flex-col items-center">
      {/* Team label */}
      <div className={`text-xs font-semibold uppercase tracking-wide mb-1 ${isHome ? 'text-red-600' : 'text-blue-600'}`}>
        {teamName}
      </div>
      
      {/* Vertical Rink */}
      <div className="relative w-full max-w-[120px]">
        <svg
          viewBox="0 0 85 200"
          className="w-full h-auto"
        >
          {/* Ice surface with gradient - vertical orientation */}
          <defs>
            <linearGradient id={`ice-gradient-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#e8f4f8', stopOpacity: 1 }} />
              <stop offset="50%" style={{ stopColor: '#ffffff', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#e8f4f8', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          
          {/* Ice surface - vertical */}
          <rect x="0" y="0" width="85" height="200" fill={`url(#ice-gradient-${uniqueId})`} />
          
          {/* Boards (outer boundary) - vertical */}
          <rect x="0" y="0" width="85" height="200" fill="none" stroke="#1e3a8a" strokeWidth="1.2" rx="4" />
          
          {/* Center red line - horizontal in vertical rink */}
          <rect x="0" y="98.5" width="85" height="3" fill="#dc2626" />
          
          {/* Blue lines - horizontal in vertical rink */}
          <rect x="0" y="58.5" width="85" height="2.5" fill="#2563eb" />
          <rect x="0" y="139" width="85" height="2.5" fill="#2563eb" />
          
          {/* Goal lines (thin red) - horizontal in vertical rink */}
          <rect x="0" y="10.5" width="85" height="1" fill="#dc2626" />
          <rect x="0" y="188.5" width="85" height="1" fill="#dc2626" />
          
          {/* Center ice circle */}
          <circle cx="42.5" cy="100" r="15" fill="none" stroke="#2563eb" strokeWidth="1" />
          <circle cx="42.5" cy="100" r="1" fill="#2563eb" />
          
          {/* Top zone faceoff circles */}
          <circle cx="20.5" cy="31" r="15" fill="none" stroke="#dc2626" strokeWidth="1" />
          <circle cx="64.5" cy="31" r="15" fill="none" stroke="#dc2626" strokeWidth="1" />
          
          {/* Bottom zone faceoff circles */}
          <circle cx="20.5" cy="169" r="15" fill="none" stroke="#dc2626" strokeWidth="1" />
          <circle cx="64.5" cy="169" r="15" fill="none" stroke="#dc2626" strokeWidth="1" />
          
          {/* Goal crease - Top */}
          <path 
            d="M 37 11 L 37 5 Q 42.5 5 42.5 5 Q 48 5 48 5 L 48 11 Z" 
            fill="#60a5fa" 
            fillOpacity="0.4" 
            stroke="#2563eb" 
            strokeWidth="1"
          />
          
          {/* Goal crease - Bottom */}
          <path 
            d="M 37 189 L 37 195 Q 42.5 195 42.5 195 Q 48 195 48 195 L 48 189 Z" 
            fill="#60a5fa" 
            fillOpacity="0.4" 
            stroke="#2563eb" 
            strokeWidth="1"
          />
          
          {/* Goal - Top */}
          <rect x="39.5" y="8.5" width="6" height="2.5" fill="none" stroke="#1f2937" strokeWidth="0.8" />
          
          {/* Goal - Bottom */}
          <rect x="39.5" y="189" width="6" height="2.5" fill="none" stroke="#1f2937" strokeWidth="0.8" />
        </svg>
        
        {/* Shot markers overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {teamShots.map((shot) => (
            <ShotMarkerSummary key={shot.id} shot={shot} />
          ))}
        </div>
      </div>
      
      {/* Stats below rink */}
      <div className="text-xs text-center mt-1 text-gray-600">
        {teamShots.length} {teamShots.length === 1 ? 'shot' : 'shots'} • {goals} {goals === 1 ? 'goal' : 'goals'}
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

  const handleShare = async () => {
    setIsExporting(true);
    try {
      if (shotMapRef.current) {
        const canvas = await elementToCanvas(shotMapRef.current);
        const blob = await canvasToBlob(canvas);
        const filename = `${game.homeTeam}-vs-${game.awayTeam}-summary.png`;
        const title = 'Hockey Game Summary';
        const text = `Final Score: ${game.homeTeam} ${homeGoals} - ${awayGoals} ${game.awayTeam}`;
        
        await shareGameSummary(blob, filename, title, text);
      }
    } catch (err) {
      console.error('Share error:', err);
      alert('Failed to share game summary. Please try again.');
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

        {/* Team Shot Maps - Home on left, Away on right */}
        <div className="px-4 py-4 border-b border-gray-200" ref={shotMapRef}>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 text-center">
            Shot Maps by Team
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {/* Home Team Shot Map */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <TeamShotMap shots={game.shots} team="home" teamName={game.homeTeam} />
            </div>
            
            {/* Away Team Shot Map */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <TeamShotMap shots={game.shots} team="away" teamName={game.awayTeam} />
            </div>
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
          <div className="grid grid-cols-3 gap-3">
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
              <span className="hidden sm:inline">{isExporting ? 'Exporting...' : 'Export PNG'}</span>
              <span className="sm:hidden">{isExporting ? '...' : 'PNG'}</span>
            </button>
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 font-semibold py-4 px-4 
                rounded-lg transition-colors min-h-[56px] hover:bg-gray-50 active:bg-gray-100
                disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="hidden sm:inline">{isExporting ? 'Exporting...' : 'Export PDF'}</span>
              <span className="sm:hidden">{isExporting ? '...' : 'PDF'}</span>
            </button>
            <button
              onClick={handleShare}
              disabled={isExporting}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-4 px-4 
                rounded-lg transition-colors min-h-[56px] hover:bg-blue-700 active:bg-blue-800
                disabled:bg-blue-300 disabled:cursor-not-allowed"
              aria-label="Share game summary"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span className="hidden sm:inline">{isExporting ? 'Sharing...' : 'Share'}</span>
              <span className="sm:hidden">{isExporting ? '...' : 'Share'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameSummary;
