import { describe, it, expect } from 'vitest';
import { calculateShootingPercentage, formatShootingPercentage } from './shootingPercentage';

describe('Shooting Percentage', () => {
  describe('calculateShootingPercentage', () => {
    it('should calculate 0.0% with no shots', () => {
      const result = calculateShootingPercentage(0, 0);
      expect(result).toBe(0);
    });

    it('should calculate 0.0% with no goals but has shots', () => {
      const result = calculateShootingPercentage(0, 10);
      expect(result).toBe(0);
    });

    it('should calculate correct percentage (goals/shots * 100)', () => {
      const result = calculateShootingPercentage(5, 20);
      expect(result).toBe(25);
    });

    it('should calculate 100% when all shots are goals', () => {
      const result = calculateShootingPercentage(10, 10);
      expect(result).toBe(100);
    });

    it('should handle decimal results correctly', () => {
      const result = calculateShootingPercentage(3, 7);
      expect(result).toBeCloseTo(42.857142857142854, 5);
    });

    it('should calculate percentage for single shot goal', () => {
      const result = calculateShootingPercentage(1, 1);
      expect(result).toBe(100);
    });

    it('should calculate percentage for single shot miss', () => {
      const result = calculateShootingPercentage(0, 1);
      expect(result).toBe(0);
    });
  });

  describe('formatShootingPercentage', () => {
    it('should format to one decimal place', () => {
      const result = formatShootingPercentage(25.5);
      expect(result).toBe('25.5%');
    });

    it('should format 0.0% correctly', () => {
      const result = formatShootingPercentage(0);
      expect(result).toBe('0.0%');
    });

    it('should format 100% correctly', () => {
      const result = formatShootingPercentage(100);
      expect(result).toBe('100.0%');
    });

    it('should round to one decimal place', () => {
      const result = formatShootingPercentage(42.857142857142854);
      expect(result).toBe('42.9%');
    });

    it('should format small percentages correctly', () => {
      const result = formatShootingPercentage(5.56);
      expect(result).toBe('5.6%');
    });

    it('should format percentages with trailing zeros', () => {
      const result = formatShootingPercentage(33.0);
      expect(result).toBe('33.0%');
    });
  });

  describe('Integration scenarios', () => {
    it('should handle typical game scenario', () => {
      // Team has 25 shots, 5 goals
      const percentage = calculateShootingPercentage(5, 25);
      const formatted = formatShootingPercentage(percentage);
      expect(formatted).toBe('20.0%');
    });

    it('should update when shot is added (no goal)', () => {
      // Start: 5 goals on 25 shots = 20%
      let percentage = calculateShootingPercentage(5, 25);
      expect(percentage).toBe(20);

      // Add a shot (miss): 5 goals on 26 shots = 19.23%
      percentage = calculateShootingPercentage(5, 26);
      expect(formatShootingPercentage(percentage)).toBe('19.2%');
    });

    it('should update when goal is added', () => {
      // Start: 5 goals on 25 shots = 20%
      let percentage = calculateShootingPercentage(5, 25);
      expect(percentage).toBe(20);

      // Add a goal: 6 goals on 26 shots = 23.08%
      percentage = calculateShootingPercentage(6, 26);
      expect(formatShootingPercentage(percentage)).toBe('23.1%');
    });
  });
});
