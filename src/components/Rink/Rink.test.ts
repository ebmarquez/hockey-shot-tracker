import { describe, it, expect } from 'vitest';
import {
  mapDesktopClick,
  mapMobileTouch,
  percentToSvgCoords,
  svgToPercentCoords,
  getTeamFromPosition,
  type BoundingRect,
} from '../../utils/coordinateMapping';

/**
 * IceRink Touch/Click Mapping Tests
 * 
 * This test suite validates the coordinate mapping logic in the IceRink component,
 * ensuring that touch and click events are correctly translated to rink coordinates.
 * 
 * Coordinate Spaces:
 * 1. Screen/Client Space: Where the user touches (pixels)
 * 2. Percentage Space: Normalized coordinates (0-100)
 * 3. SVG ViewBox Space: Internal SVG coordinates (200x85)
 * 
 * NHL Convention:
 * - Away team attacks LEFT side (x < 50 in percentage space)
 * - Home team attacks RIGHT side (x >= 50 in percentage space)
 */

describe('IceRink Coordinate Mapping', () => {
  // Standard desktop rink dimensions (simulating a 600x255 pixel element)
  const desktopRect: BoundingRect = {
    left: 100,
    top: 200,
    width: 600,
    height: 255, // Maintains 200:85 aspect ratio
  };

  // Mobile rotated rink dimensions (portrait orientation, 300x700)
  const mobileRect: BoundingRect = {
    left: 50,
    top: 100,
    width: 300,
    height: 700,
  };

  describe('Desktop Click Mapping', () => {
    it('should map center click to center of rink (50%, 50%)', () => {
      const centerX = desktopRect.left + desktopRect.width / 2; // 400
      const centerY = desktopRect.top + desktopRect.height / 2; // 327.5

      const coords = mapDesktopClick(centerX, centerY, desktopRect);

      expect(coords.x).toBeCloseTo(50, 1);
      expect(coords.y).toBeCloseTo(50, 1);
    });

    it('should map top-left corner to (0, 0)', () => {
      const coords = mapDesktopClick(desktopRect.left, desktopRect.top, desktopRect);

      expect(coords.x).toBe(0);
      expect(coords.y).toBe(0);
    });

    it('should map bottom-right corner to (100, 100)', () => {
      const coords = mapDesktopClick(
        desktopRect.left + desktopRect.width,
        desktopRect.top + desktopRect.height,
        desktopRect
      );

      expect(coords.x).toBe(100);
      expect(coords.y).toBe(100);
    });

    it('should map left side click to away zone (x < 50)', () => {
      // Click at 25% from left
      const clickX = desktopRect.left + desktopRect.width * 0.25;
      const clickY = desktopRect.top + desktopRect.height / 2;

      const coords = mapDesktopClick(clickX, clickY, desktopRect);

      expect(coords.x).toBeCloseTo(25, 1);
      expect(coords.x).toBeLessThan(50);
    });

    it('should map right side click to home zone (x >= 50)', () => {
      // Click at 75% from left
      const clickX = desktopRect.left + desktopRect.width * 0.75;
      const clickY = desktopRect.top + desktopRect.height / 2;

      const coords = mapDesktopClick(clickX, clickY, desktopRect);

      expect(coords.x).toBeCloseTo(75, 1);
      expect(coords.x).toBeGreaterThanOrEqual(50);
    });

    it('should clamp coordinates outside element bounds', () => {
      // Click outside the element (negative)
      const coordsLeft = mapDesktopClick(desktopRect.left - 50, desktopRect.top, desktopRect);
      expect(coordsLeft.x).toBe(0);

      // Click outside the element (past right edge)
      const coordsRight = mapDesktopClick(
        desktopRect.left + desktopRect.width + 50,
        desktopRect.top,
        desktopRect
      );
      expect(coordsRight.x).toBe(100);
    });
  });

  describe('Mobile Touch Mapping (Rotated 90°)', () => {
    /**
     * In mobile rotated view:
     * - User sees rink vertically (goals at top and bottom)
     * - Touching TOP of screen -> HIGH X value (home attacks right)
     * - Touching BOTTOM of screen -> LOW X value (away attacks left)
     */

    it('should map top touch to high X (home zone)', () => {
      // Touch near top of rotated rink
      const touchX = mobileRect.left + mobileRect.width / 2; // center horizontally
      const touchY = mobileRect.top + 50; // near top

      const coords = mapMobileTouch(touchX, touchY, mobileRect);

      // Near top should give high X (close to 100)
      expect(coords.x).toBeGreaterThan(90);
    });

    it('should map bottom touch to low X (away zone)', () => {
      // Touch near bottom of rotated rink
      const touchX = mobileRect.left + mobileRect.width / 2; // center horizontally
      const touchY = mobileRect.top + mobileRect.height - 50; // near bottom

      const coords = mapMobileTouch(touchX, touchY, mobileRect);

      // Near bottom should give low X (close to 0)
      expect(coords.x).toBeLessThan(10);
    });

    it('should map center touch to center of rink', () => {
      const touchX = mobileRect.left + mobileRect.width / 2;
      const touchY = mobileRect.top + mobileRect.height / 2;

      const coords = mapMobileTouch(touchX, touchY, mobileRect);

      expect(coords.x).toBeCloseTo(50, 1);
      expect(coords.y).toBeCloseTo(50, 1);
    });

    it('should map left edge touch to low Y', () => {
      const touchX = mobileRect.left; // left edge
      const touchY = mobileRect.top + mobileRect.height / 2;

      const coords = mapMobileTouch(touchX, touchY, mobileRect);

      expect(coords.y).toBe(0);
    });

    it('should map right edge touch to high Y', () => {
      const touchX = mobileRect.left + mobileRect.width; // right edge
      const touchY = mobileRect.top + mobileRect.height / 2;

      const coords = mapMobileTouch(touchX, touchY, mobileRect);

      expect(coords.y).toBe(100);
    });
  });

  describe('Percentage to SVG Coordinate Conversion', () => {
    it('should convert (0, 0) percent to (0, 0) SVG', () => {
      const svgCoords = percentToSvgCoords({ x: 0, y: 0 });

      expect(svgCoords.x).toBe(0);
      expect(svgCoords.y).toBe(0);
    });

    it('should convert (100, 100) percent to (200, 85) SVG', () => {
      const svgCoords = percentToSvgCoords({ x: 100, y: 100 });

      expect(svgCoords.x).toBe(200);
      expect(svgCoords.y).toBe(85);
    });

    it('should convert (50, 50) percent to (100, 42.5) SVG', () => {
      const svgCoords = percentToSvgCoords({ x: 50, y: 50 });

      expect(svgCoords.x).toBe(100);
      expect(svgCoords.y).toBe(42.5);
    });

    it('should convert center red line position correctly', () => {
      // Center red line is at x=100 in SVG space (50% in percent space)
      const svgCoords = percentToSvgCoords({ x: 50, y: 50 });

      expect(svgCoords.x).toBe(100); // Center ice
    });
  });

  describe('SVG to Percentage Coordinate Conversion', () => {
    it('should convert (0, 0) SVG to (0, 0) percent', () => {
      const percentCoords = svgToPercentCoords({ x: 0, y: 0 });

      expect(percentCoords.x).toBe(0);
      expect(percentCoords.y).toBe(0);
    });

    it('should convert (200, 85) SVG to (100, 100) percent', () => {
      const percentCoords = svgToPercentCoords({ x: 200, y: 85 });

      expect(percentCoords.x).toBe(100);
      expect(percentCoords.y).toBe(100);
    });

    it('should be inverse of percentToSvgCoords', () => {
      const original = { x: 35.7, y: 67.2 };
      const svgCoords = percentToSvgCoords(original);
      const backToPercent = svgToPercentCoords(svgCoords);

      expect(backToPercent.x).toBeCloseTo(original.x, 5);
      expect(backToPercent.y).toBeCloseTo(original.y, 5);
    });
  });

  describe('Team Zone Detection', () => {
    it('should return "away" for x < 50 (left side)', () => {
      expect(getTeamFromPosition(0)).toBe('away');
      expect(getTeamFromPosition(25)).toBe('away');
      expect(getTeamFromPosition(49.9)).toBe('away');
    });

    it('should return "home" for x >= 50 (right side)', () => {
      expect(getTeamFromPosition(50)).toBe('home');
      expect(getTeamFromPosition(75)).toBe('home');
      expect(getTeamFromPosition(100)).toBe('home');
    });

    it('should assign correct team from desktop click on left side', () => {
      // Click at 25% from left
      const clickX = desktopRect.left + desktopRect.width * 0.25;
      const clickY = desktopRect.top + desktopRect.height / 2;

      const coords = mapDesktopClick(clickX, clickY, desktopRect);
      const team = getTeamFromPosition(coords.x);

      expect(team).toBe('away');
    });

    it('should assign correct team from desktop click on right side', () => {
      // Click at 75% from left
      const clickX = desktopRect.left + desktopRect.width * 0.75;
      const clickY = desktopRect.top + desktopRect.height / 2;

      const coords = mapDesktopClick(clickX, clickY, desktopRect);
      const team = getTeamFromPosition(coords.x);

      expect(team).toBe('home');
    });

    it('should assign correct team from mobile touch at top (home zone)', () => {
      // Touch near top of rotated rink -> high X -> home
      const touchX = mobileRect.left + mobileRect.width / 2;
      const touchY = mobileRect.top + 50;

      const coords = mapMobileTouch(touchX, touchY, mobileRect);
      const team = getTeamFromPosition(coords.x);

      expect(team).toBe('home');
    });

    it('should assign correct team from mobile touch at bottom (away zone)', () => {
      // Touch near bottom of rotated rink -> low X -> away
      const touchX = mobileRect.left + mobileRect.width / 2;
      const touchY = mobileRect.top + mobileRect.height - 50;

      const coords = mapMobileTouch(touchX, touchY, mobileRect);
      const team = getTeamFromPosition(coords.x);

      expect(team).toBe('away');
    });
  });

  describe('Boundary Validation', () => {
    it('should clamp desktop X coordinates to 0-100', () => {
      // Far left of element
      const coordsLeft = mapDesktopClick(desktopRect.left - 100, desktopRect.top, desktopRect);
      expect(coordsLeft.x).toBe(0);

      // Far right of element
      const coordsRight = mapDesktopClick(
        desktopRect.left + desktopRect.width + 100,
        desktopRect.top,
        desktopRect
      );
      expect(coordsRight.x).toBe(100);
    });

    it('should clamp desktop Y coordinates to 0-100', () => {
      // Above element
      const coordsTop = mapDesktopClick(desktopRect.left, desktopRect.top - 100, desktopRect);
      expect(coordsTop.y).toBe(0);

      // Below element
      const coordsBottom = mapDesktopClick(
        desktopRect.left,
        desktopRect.top + desktopRect.height + 100,
        desktopRect
      );
      expect(coordsBottom.y).toBe(100);
    });

    it('should clamp mobile coordinates to 0-100', () => {
      // Touch above element
      const coordsTop = mapMobileTouch(
        mobileRect.left + mobileRect.width / 2,
        mobileRect.top - 100,
        mobileRect
      );
      expect(coordsTop.x).toBe(100); // Clamped high X

      // Touch below element
      const coordsBottom = mapMobileTouch(
        mobileRect.left + mobileRect.width / 2,
        mobileRect.top + mobileRect.height + 100,
        mobileRect
      );
      expect(coordsBottom.x).toBe(0); // Clamped low X
    });
  });

  describe('Real-World Scenarios', () => {
    it('should correctly map a goal shot in front of home net (right side)', () => {
      // Clicking near the right goal crease area (85% from left, 50% height)
      const clickX = desktopRect.left + desktopRect.width * 0.85;
      const clickY = desktopRect.top + desktopRect.height * 0.5;

      const coords = mapDesktopClick(clickX, clickY, desktopRect);
      const svgCoords = percentToSvgCoords(coords);
      const team = getTeamFromPosition(coords.x);

      // Should be in home zone (right side)
      expect(team).toBe('home');
      // SVG X should be near the right goal (around 170)
      expect(svgCoords.x).toBeCloseTo(170, 0);
      // SVG Y should be center (around 42.5)
      expect(svgCoords.y).toBeCloseTo(42.5, 0);
    });

    it('should correctly map a shot from the blue line (away zone)', () => {
      // Clicking at the left blue line (about 30% from left)
      const clickX = desktopRect.left + desktopRect.width * 0.30;
      const clickY = desktopRect.top + desktopRect.height * 0.5;

      const coords = mapDesktopClick(clickX, clickY, desktopRect);
      const svgCoords = percentToSvgCoords(coords);
      const team = getTeamFromPosition(coords.x);

      // Should be in away zone
      expect(team).toBe('away');
      // SVG X should be around the blue line (60 in SVG space)
      expect(svgCoords.x).toBeCloseTo(60, 0);
    });

    it('should handle rapid consecutive clicks at different positions', () => {
      const positions = [
        { xPercent: 10, yPercent: 30 },
        { xPercent: 90, yPercent: 70 },
        { xPercent: 50, yPercent: 50 },
        { xPercent: 25, yPercent: 25 },
        { xPercent: 75, yPercent: 75 },
      ];

      positions.forEach(({ xPercent, yPercent }) => {
        const clickX = desktopRect.left + desktopRect.width * (xPercent / 100);
        const clickY = desktopRect.top + desktopRect.height * (yPercent / 100);

        const coords = mapDesktopClick(clickX, clickY, desktopRect);

        expect(coords.x).toBeCloseTo(xPercent, 1);
        expect(coords.y).toBeCloseTo(yPercent, 1);
      });
    });
  });
});
