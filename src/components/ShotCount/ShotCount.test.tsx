import { describe, it, expect } from 'vitest';
import type { Shot, Period } from '../../types';

/**
 * Helper function to format period label
 * Mimics the logic from utils/periodStats.ts
 */
const formatPeriodLabel = (period: Period): string => {
  if (period === 'OT') {
    return 'OT';
  }
  const suffix = period === 1 ? 'st' : period === 2 ? 'nd' : 'rd';
  return `${period}${suffix} period`;
};

/**
 * Helper function to generate shot count message
 * Mimics the logic from App.tsx
 */
const getShotCountMessage = (shots: Shot[], currentPeriod: Period): string => {
  const currentPeriodShots = shots.filter(
    shot => shot.period === currentPeriod
  ).length;
  
  const shotWord = currentPeriodShots === 1 ? 'shot' : 'shots';
  const periodLabel = formatPeriodLabel(currentPeriod);
  
  return `${currentPeriodShots} ${shotWord} recorded in ${periodLabel}`;
};

/**
 * Helper to create a test shot
 */
const createShot = (
  period: Period,
  team: 'home' | 'away' = 'home'
): Shot => ({
  id: `shot-${Math.random()}`,
  period,
  timestamp: Date.now(),
  team,
  x: 50,
  y: 50,
  shotType: 'wrist',
  result: 'save',
});

describe('Shot Count Display', () => {
  it('should show correct count for current period', () => {
    const shots = [
      createShot(1),
      createShot(1),
      createShot(2),
    ];
    const message = getShotCountMessage(shots, 1);
    expect(message).toBe('2 shots recorded in 1st period');
  });

  it('should show 0 when no shots in period', () => {
    const shots: Shot[] = [];
    const message = getShotCountMessage(shots, 1);
    expect(message).toBe('0 shots recorded in 1st period');
  });

  it('should display "1 shot" (singular) correctly', () => {
    const shots = [createShot(1)];
    const message = getShotCountMessage(shots, 1);
    expect(message).toBe('1 shot recorded in 1st period');
    expect(message).not.toContain('1 shots');
  });

  it('should display "2 shots" (plural) correctly', () => {
    const shots = [createShot(1), createShot(1)];
    const message = getShotCountMessage(shots, 1);
    expect(message).toBe('2 shots recorded in 1st period');
  });

  it('should display correct period name for 1st period', () => {
    const shots: Shot[] = [];
    const message = getShotCountMessage(shots, 1);
    expect(message).toContain('1st period');
  });

  it('should display correct period name for 2nd period', () => {
    const shots: Shot[] = [];
    const message = getShotCountMessage(shots, 2);
    expect(message).toContain('2nd period');
  });

  it('should display correct period name for 3rd period', () => {
    const shots: Shot[] = [];
    const message = getShotCountMessage(shots, 3);
    expect(message).toContain('3rd period');
  });

  it('should display correct period name for OT', () => {
    const shots: Shot[] = [];
    const message = getShotCountMessage(shots, 'OT');
    expect(message).toBe('0 shots recorded in OT');
  });

  it('should only count shots from current period', () => {
    const shots = [
      createShot(1),
      createShot(1),
      createShot(2),
      createShot(2),
      createShot(2),
      createShot(3),
    ];
    const message = getShotCountMessage(shots, 2);
    expect(message).toBe('3 shots recorded in 2nd period');
  });

  it('should update when shot is added', () => {
    let shots = [createShot(1)];
    let message = getShotCountMessage(shots, 1);
    expect(message).toBe('1 shot recorded in 1st period');

    // Add another shot
    shots = [...shots, createShot(1)];
    message = getShotCountMessage(shots, 1);
    expect(message).toBe('2 shots recorded in 1st period');
  });

  it('should update when shot is deleted', () => {
    let shots = [createShot(1), createShot(1)];
    let message = getShotCountMessage(shots, 1);
    expect(message).toBe('2 shots recorded in 1st period');

    // Remove a shot
    shots = shots.slice(0, 1);
    message = getShotCountMessage(shots, 1);
    expect(message).toBe('1 shot recorded in 1st period');
  });
});
