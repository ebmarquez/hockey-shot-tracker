/**
 * Calculate shooting percentage (goals/shots * 100)
 * @param goals - Number of goals scored
 * @param shots - Total number of shots taken
 * @returns Shooting percentage as a number (0-100)
 */
export const calculateShootingPercentage = (goals: number, shots: number): number => {
  if (shots === 0) {
    return 0;
  }
  return (goals / shots) * 100;
};

/**
 * Format shooting percentage to one decimal place
 * @param percentage - Shooting percentage value
 * @returns Formatted string (e.g., "25.5%")
 */
export const formatShootingPercentage = (percentage: number): string => {
  return `${percentage.toFixed(1)}%`;
};
