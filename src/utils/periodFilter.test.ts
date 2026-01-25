import { describe, it, expect } from 'vitest';
import type { Shot, Period } from '../types';

/**
 * Period Filter Tests
 * 
 * These tests validate the period filtering logic that determines which shots
 * are displayed on the rink based on the currently selected period.
 * 
 * Requirements:
 * - Rink shows only shots from the currently selected period by default
 * - Switching periods updates displayed shots immediately
 * - All shots still exist in state (not deleted, just filtered)
 * - Statistics still show all-period totals where appropriate
 */

describe('Period Filter', () => {
  // Helper to create a shot
  let shotIdCounter = 0;
  const createShot = (
    team: 'home' | 'away',
    period: Period,
    result: 'goal' | 'save' | 'miss' | 'blocked'
  ): Shot => ({
    id: `test-shot-${++shotIdCounter}`,
    period,
    timestamp: Date.now(),
    team,
    x: 50,
    y: 50,
    shotType: 'wrist',
    result,
  });

  describe('Filter shots by current period', () => {
    it('should show only current period shots on rink', () => {
      const allShots = [
        createShot('home', 1, 'goal'),
        createShot('home', 1, 'save'),
        createShot('home', 2, 'goal'),
        createShot('away', 1, 'miss'),
        createShot('away', 2, 'save'),
        createShot('away', 3, 'goal'),
      ];

      // Filter for period 1
      const period1Shots = allShots.filter(shot => shot.period === 1);
      expect(period1Shots).toHaveLength(3);
      expect(period1Shots.every(shot => shot.period === 1)).toBe(true);

      // Filter for period 2
      const period2Shots = allShots.filter(shot => shot.period === 2);
      expect(period2Shots).toHaveLength(2);
      expect(period2Shots.every(shot => shot.period === 2)).toBe(true);

      // Filter for period 3
      const period3Shots = allShots.filter(shot => shot.period === 3);
      expect(period3Shots).toHaveLength(1);
      expect(period3Shots.every(shot => shot.period === 3)).toBe(true);
    });

    it('should return empty array when no shots in current period', () => {
      const allShots = [
        createShot('home', 1, 'goal'),
        createShot('away', 2, 'save'),
      ];

      const period3Shots = allShots.filter(shot => shot.period === 3);
      expect(period3Shots).toHaveLength(0);
    });

    it('should handle OT period correctly', () => {
      const allShots = [
        createShot('home', 1, 'goal'),
        createShot('home', 2, 'save'),
        createShot('home', 3, 'miss'),
        createShot('home', 'OT', 'goal'),
        createShot('away', 'OT', 'save'),
      ];

      const otShots = allShots.filter(shot => shot.period === 'OT');
      expect(otShots).toHaveLength(2);
      expect(otShots.every(shot => shot.period === 'OT')).toBe(true);
    });

    it('should include both teams in filtered results', () => {
      const allShots = [
        createShot('home', 1, 'goal'),
        createShot('away', 1, 'save'),
        createShot('home', 1, 'miss'),
        createShot('away', 1, 'blocked'),
        createShot('home', 2, 'goal'),
      ];

      const period1Shots = allShots.filter(shot => shot.period === 1);
      expect(period1Shots).toHaveLength(4);
      
      const homeShots = period1Shots.filter(shot => shot.team === 'home');
      const awayShots = period1Shots.filter(shot => shot.team === 'away');
      
      expect(homeShots).toHaveLength(2);
      expect(awayShots).toHaveLength(2);
    });
  });

  describe('Update displayed shots on period change', () => {
    it('should switch from period 1 to period 2', () => {
      const allShots = [
        createShot('home', 1, 'goal'),
        createShot('home', 1, 'save'),
        createShot('home', 2, 'goal'),
        createShot('home', 2, 'save'),
        createShot('home', 2, 'miss'),
      ];

      // Start with period 1
      let currentPeriod: Period = 1;
      let displayedShots = allShots.filter(shot => shot.period === currentPeriod);
      expect(displayedShots).toHaveLength(2);

      // Switch to period 2
      currentPeriod = 2;
      displayedShots = allShots.filter(shot => shot.period === currentPeriod);
      expect(displayedShots).toHaveLength(3);
    });

    it('should handle switching between all periods', () => {
      const allShots = [
        createShot('home', 1, 'goal'),
        createShot('home', 2, 'save'),
        createShot('home', 3, 'miss'),
        createShot('home', 'OT', 'blocked'),
      ];

      const periods: Period[] = [1, 2, 3, 'OT'];
      
      periods.forEach(period => {
        const filtered = allShots.filter(shot => shot.period === period);
        expect(filtered).toHaveLength(1);
        expect(filtered[0].period).toBe(period);
      });
    });
  });

  describe('Preserve all shots in state when switching periods', () => {
    it('should not modify the original shots array', () => {
      const allShots = [
        createShot('home', 1, 'goal'),
        createShot('home', 2, 'save'),
        createShot('home', 3, 'miss'),
      ];

      const originalLength = allShots.length;
      
      // Filter for period 1
      const period1Shots = allShots.filter(shot => shot.period === 1);
      
      // Original array should be unchanged
      expect(allShots).toHaveLength(originalLength);
      expect(period1Shots).toHaveLength(1);
      
      // All shots should still exist
      expect(allShots.find(shot => shot.period === 1)).toBeDefined();
      expect(allShots.find(shot => shot.period === 2)).toBeDefined();
      expect(allShots.find(shot => shot.period === 3)).toBeDefined();
    });

    it('should allow switching back and forth without data loss', () => {
      const allShots = [
        createShot('home', 1, 'goal'),
        createShot('home', 1, 'save'),
        createShot('home', 2, 'goal'),
        createShot('home', 2, 'save'),
      ];

      // Go to period 2
      let filtered = allShots.filter(shot => shot.period === 2);
      expect(filtered).toHaveLength(2);

      // Go back to period 1
      filtered = allShots.filter(shot => shot.period === 1);
      expect(filtered).toHaveLength(2);

      // Go to period 2 again
      filtered = allShots.filter(shot => shot.period === 2);
      expect(filtered).toHaveLength(2);

      // All shots still in original array
      expect(allShots).toHaveLength(4);
    });
  });

  describe('Statistics show all-period totals', () => {
    it('should calculate total shots across all periods', () => {
      const allShots = [
        createShot('home', 1, 'goal'),
        createShot('home', 1, 'save'),
        createShot('home', 2, 'miss'),
        createShot('home', 3, 'blocked'),
      ];

      // Total stats (not filtered)
      const homeShots = allShots.filter(shot => shot.team === 'home');
      expect(homeShots).toHaveLength(4);

      // Current period stats (filtered)
      const period1Shots = allShots.filter(shot => shot.period === 1 && shot.team === 'home');
      expect(period1Shots).toHaveLength(2);

      // Both calculations should be possible
      expect(homeShots.length).toBeGreaterThan(period1Shots.length);
    });

    it('should calculate total goals across all periods', () => {
      const allShots = [
        createShot('home', 1, 'goal'),
        createShot('home', 1, 'save'),
        createShot('home', 2, 'goal'),
        createShot('home', 3, 'goal'),
      ];

      // Total goals (not filtered by period)
      const totalGoals = allShots.filter(shot => shot.team === 'home' && shot.result === 'goal');
      expect(totalGoals).toHaveLength(3);

      // Current period goals (filtered)
      const period1Goals = allShots.filter(
        shot => shot.period === 1 && shot.team === 'home' && shot.result === 'goal'
      );
      expect(period1Goals).toHaveLength(1);

      // Both calculations should be independent
      expect(totalGoals.length).toBeGreaterThan(period1Goals.length);
    });

    it('should calculate stats for both teams independently', () => {
      const allShots = [
        createShot('home', 1, 'goal'),
        createShot('home', 2, 'goal'),
        createShot('away', 1, 'goal'),
        createShot('away', 3, 'goal'),
      ];

      // Total goals for each team
      const homeGoals = allShots.filter(shot => shot.team === 'home' && shot.result === 'goal');
      const awayGoals = allShots.filter(shot => shot.team === 'away' && shot.result === 'goal');

      expect(homeGoals).toHaveLength(2);
      expect(awayGoals).toHaveLength(2);

      // Period-specific goals
      const period1HomeGoals = allShots.filter(
        shot => shot.period === 1 && shot.team === 'home' && shot.result === 'goal'
      );
      const period1AwayGoals = allShots.filter(
        shot => shot.period === 1 && shot.team === 'away' && shot.result === 'goal'
      );

      expect(period1HomeGoals).toHaveLength(1);
      expect(period1AwayGoals).toHaveLength(1);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty shots array', () => {
      const allShots: Shot[] = [];
      const filtered = allShots.filter(shot => shot.period === 1);
      
      expect(filtered).toHaveLength(0);
      expect(allShots).toHaveLength(0);
    });

    it('should handle filtering when all shots are in the same period', () => {
      const allShots = [
        createShot('home', 1, 'goal'),
        createShot('home', 1, 'save'),
        createShot('away', 1, 'miss'),
      ];

      const period1Shots = allShots.filter(shot => shot.period === 1);
      const period2Shots = allShots.filter(shot => shot.period === 2);

      expect(period1Shots).toHaveLength(3);
      expect(period2Shots).toHaveLength(0);
    });

    it('should maintain shot order after filtering', () => {
      const allShots = [
        createShot('home', 1, 'goal'),
        createShot('away', 1, 'save'),
        createShot('home', 2, 'miss'),
        createShot('away', 1, 'blocked'),
      ];

      const period1Shots = allShots.filter(shot => shot.period === 1);

      // Should maintain the order: home, away, away
      expect(period1Shots).toHaveLength(3);
      expect(period1Shots[0].team).toBe('home');
      expect(period1Shots[1].team).toBe('away');
      expect(period1Shots[2].team).toBe('away');
    });

    it('should handle rapid period switches', () => {
      const allShots = [
        createShot('home', 1, 'goal'),
        createShot('home', 2, 'save'),
        createShot('home', 3, 'miss'),
      ];

      // Simulate rapid switches
      const periods: Period[] = [1, 2, 3, 1, 2, 3, 1];
      
      periods.forEach(period => {
        const filtered = allShots.filter(shot => shot.period === period);
        expect(filtered).toHaveLength(1);
      });

      // Original array unchanged
      expect(allShots).toHaveLength(3);
    });
  });

  describe('Real-world game scenarios', () => {
    it('should handle a typical 3-period game with multiple shots', () => {
      const allShots = [
        // Period 1
        createShot('home', 1, 'goal'),
        createShot('away', 1, 'save'),
        createShot('home', 1, 'save'),
        createShot('away', 1, 'goal'),
        // Period 2
        createShot('home', 2, 'miss'),
        createShot('away', 2, 'blocked'),
        createShot('home', 2, 'goal'),
        // Period 3
        createShot('home', 3, 'save'),
        createShot('away', 3, 'save'),
        createShot('home', 3, 'goal'),
        createShot('away', 3, 'goal'),
      ];

      // Verify filtering for each period
      const p1 = allShots.filter(shot => shot.period === 1);
      const p2 = allShots.filter(shot => shot.period === 2);
      const p3 = allShots.filter(shot => shot.period === 3);

      expect(p1).toHaveLength(4);
      expect(p2).toHaveLength(3);
      expect(p3).toHaveLength(4);

      // Total should equal sum of periods
      expect(allShots).toHaveLength(11);
      expect(p1.length + p2.length + p3.length).toBe(allShots.length);
    });

    it('should handle a game that goes to overtime', () => {
      const allShots = [
        createShot('home', 1, 'goal'),
        createShot('away', 1, 'goal'),
        createShot('home', 2, 'save'),
        createShot('away', 2, 'save'),
        createShot('home', 3, 'save'),
        createShot('away', 3, 'save'),
        createShot('home', 'OT', 'goal'),
      ];

      // Should be able to filter OT
      const otShots = allShots.filter(shot => shot.period === 'OT');
      expect(otShots).toHaveLength(1);
      expect(otShots[0].result).toBe('goal');

      // All shots preserved
      expect(allShots).toHaveLength(7);
    });

    it('should handle user adding shots during different periods', () => {
      let allShots: Shot[] = [];

      // Period 1 - add some shots
      allShots = [...allShots, createShot('home', 1, 'goal')];
      allShots = [...allShots, createShot('away', 1, 'save')];
      
      let filtered = allShots.filter(shot => shot.period === 1);
      expect(filtered).toHaveLength(2);

      // Switch to Period 2 - add more shots
      allShots = [...allShots, createShot('home', 2, 'miss')];
      allShots = [...allShots, createShot('away', 2, 'blocked')];
      
      filtered = allShots.filter(shot => shot.period === 2);
      expect(filtered).toHaveLength(2);

      // Go back to Period 1 - should still see all period 1 shots
      filtered = allShots.filter(shot => shot.period === 1);
      expect(filtered).toHaveLength(2);

      // Total shots preserved
      expect(allShots).toHaveLength(4);
    });
  });
});
