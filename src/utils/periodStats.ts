import type { Shot, Period, Team } from '../types';

export interface PeriodStats {
  period: Period;
  goals: number;
  shots: number;
}

/**
 * Calculate stats for each period that has at least one shot
 * @param shots - Array of shots to analyze
 * @param team - Team to filter shots by
 * @returns Array of PeriodStats ordered by period (1st, 2nd, 3rd, OT)
 */
export const calculatePerPeriodStats = (shots: Shot[], team: Team): PeriodStats[] => {
  // Group shots by period
  const periodMap = new Map<Period, Shot[]>();
  
  shots
    .filter(shot => shot.team === team)
    .forEach(shot => {
      const existing = periodMap.get(shot.period) || [];
      periodMap.set(shot.period, [...existing, shot]);
    });

  // Convert to stats array, maintaining period order (1, 2, 3, OT)
  const periodOrder: Period[] = [1, 2, 3, 'OT'];
  const stats: PeriodStats[] = [];

  periodOrder.forEach(period => {
    const periodShots = periodMap.get(period);
    if (periodShots && periodShots.length > 0) {
      const goals = periodShots.filter(shot => shot.result === 'goal').length;
      stats.push({
        period,
        goals,
        shots: periodShots.length,
      });
    }
  });

  return stats;
};

/**
 * Format period label for display
 * @param period - Period number or 'OT'
 * @returns Formatted string (e.g., "1st Period", "2nd Period", "OT")
 */
export const formatPeriodLabel = (period: Period): string => {
  if (period === 'OT') {
    return 'OT';
  }
  const suffix = period === 1 ? 'st' : period === 2 ? 'nd' : 'rd';
  return `${period}${suffix} Period`;
};

/**
 * Format period stats for display
 * @param stats - PeriodStats object
 * @returns Formatted string (e.g., "1G / 5S")
 */
export const formatPeriodStats = (stats: PeriodStats): string => {
  return `${stats.goals}G / ${stats.shots}S`;
};
