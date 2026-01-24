import { describe, it, expect } from 'vitest';
import type { Shot } from '../types';
import { 
  calculatePerPeriodStats, 
  formatPeriodLabel, 
  formatPeriodStats 
} from './periodStats';

describe('Per-Period Stats', () => {
  // Helper to create a shot
  const createShot = (
    team: 'home' | 'away',
    period: 1 | 2 | 3 | 'OT',
    result: 'goal' | 'save' | 'miss' | 'blocked'
  ): Shot => ({
    id: Math.random().toString(),
    period,
    timestamp: Date.now(),
    team,
    x: 50,
    y: 50,
    shotType: 'wrist',
    result,
  });

  describe('calculatePerPeriodStats', () => {
    it('should return empty array when no shots', () => {
      const stats = calculatePerPeriodStats([], 'home');
      expect(stats).toEqual([]);
    });

    it('should return empty array when team has no shots', () => {
      const shots = [
        createShot('away', 1, 'goal'),
        createShot('away', 2, 'save'),
      ];
      const stats = calculatePerPeriodStats(shots, 'home');
      expect(stats).toEqual([]);
    });

    it('should show period breakdown for periods with shots', () => {
      const shots = [
        createShot('home', 1, 'goal'),
        createShot('home', 1, 'save'),
        createShot('home', 1, 'save'),
        createShot('home', 2, 'goal'),
        createShot('home', 2, 'miss'),
      ];
      const stats = calculatePerPeriodStats(shots, 'home');
      
      expect(stats).toHaveLength(2);
      expect(stats[0]).toEqual({ period: 1, goals: 1, shots: 3 });
      expect(stats[1]).toEqual({ period: 2, goals: 1, shots: 2 });
    });

    it('should not show periods without shots', () => {
      const shots = [
        createShot('home', 1, 'goal'),
        createShot('home', 3, 'save'),
      ];
      const stats = calculatePerPeriodStats(shots, 'home');
      
      expect(stats).toHaveLength(2);
      expect(stats[0].period).toBe(1);
      expect(stats[1].period).toBe(3);
      // Period 2 should not be in the results
      expect(stats.find(s => s.period === 2)).toBeUndefined();
    });

    it('should handle OT period correctly', () => {
      const shots = [
        createShot('home', 1, 'goal'),
        createShot('home', 'OT', 'goal'),
        createShot('home', 'OT', 'save'),
      ];
      const stats = calculatePerPeriodStats(shots, 'home');
      
      expect(stats).toHaveLength(2);
      expect(stats[1]).toEqual({ period: 'OT', goals: 1, shots: 2 });
    });

    it('should maintain period order: 1st, 2nd, 3rd, OT', () => {
      const shots = [
        createShot('home', 'OT', 'goal'),
        createShot('home', 2, 'save'),
        createShot('home', 3, 'goal'),
        createShot('home', 1, 'miss'),
      ];
      const stats = calculatePerPeriodStats(shots, 'home');
      
      expect(stats).toHaveLength(4);
      expect(stats[0].period).toBe(1);
      expect(stats[1].period).toBe(2);
      expect(stats[2].period).toBe(3);
      expect(stats[3].period).toBe('OT');
    });

    it('should count goals correctly', () => {
      const shots = [
        createShot('home', 1, 'goal'),
        createShot('home', 1, 'goal'),
        createShot('home', 1, 'save'),
        createShot('home', 1, 'miss'),
        createShot('home', 1, 'blocked'),
      ];
      const stats = calculatePerPeriodStats(shots, 'home');
      
      expect(stats[0].goals).toBe(2);
      expect(stats[0].shots).toBe(5);
    });

    it('should update when shots are added', () => {
      let shots = [
        createShot('home', 1, 'goal'),
        createShot('home', 1, 'save'),
      ];
      let stats = calculatePerPeriodStats(shots, 'home');
      expect(stats[0]).toEqual({ period: 1, goals: 1, shots: 2 });

      // Add another shot
      shots = [...shots, createShot('home', 1, 'goal')];
      stats = calculatePerPeriodStats(shots, 'home');
      expect(stats[0]).toEqual({ period: 1, goals: 2, shots: 3 });
    });

    it('should filter by team correctly', () => {
      const shots = [
        createShot('home', 1, 'goal'),
        createShot('away', 1, 'goal'),
        createShot('home', 1, 'save'),
        createShot('away', 1, 'save'),
      ];
      
      const homeStats = calculatePerPeriodStats(shots, 'home');
      const awayStats = calculatePerPeriodStats(shots, 'away');
      
      expect(homeStats[0]).toEqual({ period: 1, goals: 1, shots: 2 });
      expect(awayStats[0]).toEqual({ period: 1, goals: 1, shots: 2 });
    });
  });

  describe('formatPeriodLabel', () => {
    it('should format 1st period correctly', () => {
      expect(formatPeriodLabel(1)).toBe('1st Period');
    });

    it('should format 2nd period correctly', () => {
      expect(formatPeriodLabel(2)).toBe('2nd Period');
    });

    it('should format 3rd period correctly', () => {
      expect(formatPeriodLabel(3)).toBe('3rd Period');
    });

    it('should format OT correctly', () => {
      expect(formatPeriodLabel('OT')).toBe('OT');
    });
  });

  describe('formatPeriodStats', () => {
    it('should format as "XG / XS"', () => {
      const stats = { period: 1 as const, goals: 1, shots: 5 };
      expect(formatPeriodStats(stats)).toBe('1G / 5S');
    });

    it('should handle zero goals', () => {
      const stats = { period: 1 as const, goals: 0, shots: 3 };
      expect(formatPeriodStats(stats)).toBe('0G / 3S');
    });

    it('should handle multiple goals', () => {
      const stats = { period: 2 as const, goals: 3, shots: 10 };
      expect(formatPeriodStats(stats)).toBe('3G / 10S');
    });
  });

  describe('Integration scenarios', () => {
    it('should provide complete period breakdown for a typical game', () => {
      const shots = [
        // Period 1: 1 goal on 5 shots
        createShot('home', 1, 'goal'),
        createShot('home', 1, 'save'),
        createShot('home', 1, 'save'),
        createShot('home', 1, 'miss'),
        createShot('home', 1, 'blocked'),
        // Period 2: 2 goals on 4 shots
        createShot('home', 2, 'goal'),
        createShot('home', 2, 'goal'),
        createShot('home', 2, 'save'),
        createShot('home', 2, 'miss'),
        // Period 3: 0 goals on 2 shots
        createShot('home', 3, 'save'),
        createShot('home', 3, 'blocked'),
      ];

      const stats = calculatePerPeriodStats(shots, 'home');
      
      expect(stats).toHaveLength(3);
      expect(formatPeriodStats(stats[0])).toBe('1G / 5S');
      expect(formatPeriodStats(stats[1])).toBe('2G / 4S');
      expect(formatPeriodStats(stats[2])).toBe('0G / 2S');
    });
  });
});
