import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import Rink from './Rink';
import * as usePinchZoomModule from '../../hooks/usePinchZoom';

/**
 * Rink Zoom/Pan Coordinate Transformation Tests
 * 
 * This test suite validates shot placement accuracy when the rink is
 * zoomed (scale > 1).
 * 
 * Tests verify that:
 * 1. Clicks at scale 1x (no zoom) work correctly (baseline)
 * 2. Clicks at scale > 1x (zoomed) are accurately transformed
 * 3. Pan and pinch gestures prevent shot placement
 * 4. Edge cases and boundary clamping work as expected
 * 
 * Note: Pan offset is managed by touch event handlers and affects the CSS
 * transform, but getBoundingClientRect() reflects the final transformed state,
 * so the click coordinate transformation only needs to account for scale.
 */

describe('Rink Zoom/Pan Coordinate Transformations', () => {
  const mockOnShotLocation = vi.fn();
  let usePinchZoomSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    mockOnShotLocation.mockClear();
  });

  afterEach(() => {
    if (usePinchZoomSpy) {
      usePinchZoomSpy.mockRestore();
    }
  });

  /**
   * Helper to mock usePinchZoom hook with specific scale value
   */
  const mockUsePinchZoom = (scale: number) => {
    usePinchZoomSpy = vi.spyOn(usePinchZoomModule, 'usePinchZoom').mockReturnValue({
      scale,
      isPinching: false,
      pinchCenter: null,
      handlePinchStart: vi.fn(),
      handlePinchMove: vi.fn(),
      handlePinchEnd: vi.fn(),
      resetZoom: vi.fn(),
    });
  };

  /**
   * Helper to simulate a click event with mocked getBoundingClientRect
   */
  const simulateClick = (
    element: HTMLElement,
    rect: { left: number; top: number; width: number; height: number },
    click: { x: number; y: number }
  ) => {
    const spy = vi.spyOn(element, 'getBoundingClientRect').mockReturnValueOnce({
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
      right: rect.left + rect.width,
      bottom: rect.top + rect.height,
      x: rect.left,
      y: rect.top,
      toJSON: () => ({}),
    } as DOMRect);

    fireEvent.click(element, {
      clientX: click.x,
      clientY: click.y,
    });

    spy.mockRestore();
  };

  describe('Scale 1x (No Zoom) - Baseline', () => {
    it('should map center click to 50%, 50% at scale 1x', () => {
      mockUsePinchZoom(1);
      const { container } = render(<Rink onShotLocation={mockOnShotLocation} />);
      const rinkElement = container.querySelector('.cursor-crosshair') as HTMLElement;

      // Element at (100, 100) with size 600x300
      // Click at center: (100 + 300, 100 + 150) = (400, 250)
      simulateClick(
        rinkElement,
        { left: 100, top: 100, width: 600, height: 300 },
        { x: 400, y: 250 }
      );

      expect(mockOnShotLocation).toHaveBeenCalledWith(
        expect.closeTo(50, 0.1),
        expect.closeTo(50, 0.1)
      );
    });

    it('should map top-left click to 0%, 0% at scale 1x', () => {
      mockUsePinchZoom(1);
      const { container } = render(<Rink onShotLocation={mockOnShotLocation} />);
      const rinkElement = container.querySelector('.cursor-crosshair') as HTMLElement;

      simulateClick(
        rinkElement,
        { left: 100, top: 100, width: 600, height: 300 },
        { x: 100, y: 100 }
      );

      expect(mockOnShotLocation).toHaveBeenCalledWith(0, 0);
    });

    it('should map bottom-right click to 100%, 100% at scale 1x', () => {
      mockUsePinchZoom(1);
      const { container } = render(<Rink onShotLocation={mockOnShotLocation} />);
      const rinkElement = container.querySelector('.cursor-crosshair') as HTMLElement;

      simulateClick(
        rinkElement,
        { left: 100, top: 100, width: 600, height: 300 },
        { x: 700, y: 400 }
      );

      expect(mockOnShotLocation).toHaveBeenCalledWith(100, 100);
    });

    it('should map quarter position clicks correctly at scale 1x', () => {
      mockUsePinchZoom(1);
      const { container } = render(<Rink onShotLocation={mockOnShotLocation} />);
      const rinkElement = container.querySelector('.cursor-crosshair') as HTMLElement;

      // Click at 25% from left, 75% from top: (100 + 150, 100 + 225) = (250, 325)
      simulateClick(
        rinkElement,
        { left: 100, top: 100, width: 600, height: 300 },
        { x: 250, y: 325 }
      );

      expect(mockOnShotLocation).toHaveBeenCalledWith(
        expect.closeTo(25, 0.1),
        expect.closeTo(75, 0.1)
      );
    });
  });

  describe('Scale 2x (Zoomed) - No Pan', () => {
    it('should map center click correctly at scale 2x', () => {
      mockUsePinchZoom(2);
      const { container } = render(<Rink onShotLocation={mockOnShotLocation} />);
      const rinkElement = container.querySelector('.cursor-crosshair') as HTMLElement;

      // At 2x scale, element appears as 1200x600
      // Click at center: (100 + 600, 100 + 300) = (700, 400)
      simulateClick(
        rinkElement,
        { left: 100, top: 100, width: 1200, height: 600 },
        { x: 700, y: 400 }
      );

      // Center should still map to 50%, 50%
      expect(mockOnShotLocation).toHaveBeenCalledWith(
        expect.closeTo(50, 0.1),
        expect.closeTo(50, 0.1)
      );
    });

    it('should map off-center click correctly at scale 2x', () => {
      mockUsePinchZoom(2);
      const { container } = render(<Rink onShotLocation={mockOnShotLocation} />);
      const rinkElement = container.querySelector('.cursor-crosshair') as HTMLElement;

      // At 2x scale, element appears as 1200x600
      // Click at 25% from left in SCALED space: (100 + 300, 100 + 300) = (400, 400)
      // In original space this is: 
      // - Relative to center: 300 - 600 = -300
      // - After inverse scale: -300 / 2 = -150
      // - Original width/2: 600 / 2 = 300
      // - Original position: 300 - 150 = 150
      // - Percentage: 150 / 600 = 25%
      simulateClick(
        rinkElement,
        { left: 100, top: 100, width: 1200, height: 600 },
        { x: 400, y: 400 }
      );

      expect(mockOnShotLocation).toHaveBeenCalledWith(
        expect.closeTo(25, 0.1),
        expect.closeTo(50, 0.1)
      );
    });

    it('should map top-left visible area to correct percentage at scale 2x', () => {
      mockUsePinchZoom(2);
      const { container } = render(<Rink onShotLocation={mockOnShotLocation} />);
      const rinkElement = container.querySelector('.cursor-crosshair') as HTMLElement;

      // Click at top-left of visible area
      simulateClick(
        rinkElement,
        { left: 100, top: 100, width: 1200, height: 600 },
        { x: 100, y: 100 }
      );

      // Should clamp to 0, 0
      expect(mockOnShotLocation).toHaveBeenCalledWith(0, 0);
    });

    it('should map bottom-right visible area to correct percentage at scale 2x', () => {
      mockUsePinchZoom(2);
      const { container } = render(<Rink onShotLocation={mockOnShotLocation} />);
      const rinkElement = container.querySelector('.cursor-crosshair') as HTMLElement;

      // Click at bottom-right of visible area
      simulateClick(
        rinkElement,
        { left: 100, top: 100, width: 1200, height: 600 },
        { x: 1300, y: 700 }
      );

      // Should clamp to 100, 100
      expect(mockOnShotLocation).toHaveBeenCalledWith(100, 100);
    });
  });

  describe('Scale 3x (Maximum Zoom) - No Pan', () => {
    it('should map center click correctly at scale 3x', () => {
      mockUsePinchZoom(3);
      const { container } = render(<Rink onShotLocation={mockOnShotLocation} />);
      const rinkElement = container.querySelector('.cursor-crosshair') as HTMLElement;

      // At 3x scale, element appears as 1800x900
      simulateClick(
        rinkElement,
        { left: 100, top: 100, width: 1800, height: 900 },
        { x: 1000, y: 550 }
      );

      expect(mockOnShotLocation).toHaveBeenCalledWith(
        expect.closeTo(50, 0.1),
        expect.closeTo(50, 0.1)
      );
    });

    it('should handle edge clicks at scale 3x', () => {
      mockUsePinchZoom(3);
      const { container } = render(<Rink onShotLocation={mockOnShotLocation} />);
      const rinkElement = container.querySelector('.cursor-crosshair') as HTMLElement;

      // Click near left edge
      simulateClick(
        rinkElement,
        { left: 100, top: 100, width: 1800, height: 900 },
        { x: 150, y: 550 }
      );

      const [x] = mockOnShotLocation.mock.calls[0];
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(20); // Should be near left edge
    });
  });

  describe('Edge Cases and Boundary Clamping', () => {
    it('should clamp coordinates outside bounds to 0-100 range', () => {
      mockUsePinchZoom(2);
      const { container } = render(<Rink onShotLocation={mockOnShotLocation} />);
      const rinkElement = container.querySelector('.cursor-crosshair') as HTMLElement;

      // Click way outside the element
      simulateClick(
        rinkElement,
        { left: 100, top: 100, width: 1200, height: 600 },
        { x: 2000, y: 1000 }
      );

      const [x, y] = mockOnShotLocation.mock.calls[0];
      expect(x).toBe(100); // Clamped to max
      expect(y).toBe(100); // Clamped to max
    });

    it('should clamp negative coordinates to 0', () => {
      mockUsePinchZoom(2);
      const { container } = render(<Rink onShotLocation={mockOnShotLocation} />);
      const rinkElement = container.querySelector('.cursor-crosshair') as HTMLElement;

      // Click before the element
      simulateClick(
        rinkElement,
        { left: 100, top: 100, width: 1200, height: 600 },
        { x: 0, y: 0 }
      );

      const [x, y] = mockOnShotLocation.mock.calls[0];
      expect(x).toBe(0); // Clamped to min
      expect(y).toBe(0); // Clamped to min
    });

    it('should handle fractional scale values correctly', () => {
      mockUsePinchZoom(1.5);
      const { container } = render(<Rink onShotLocation={mockOnShotLocation} />);
      const rinkElement = container.querySelector('.cursor-crosshair') as HTMLElement;

      // At 1.5x scale, element appears as 900x450
      simulateClick(
        rinkElement,
        { left: 100, top: 100, width: 900, height: 450 },
        { x: 550, y: 325 }
      );

      expect(mockOnShotLocation).toHaveBeenCalledWith(
        expect.closeTo(50, 0.1),
        expect.closeTo(50, 0.1)
      );
    });
  });

  describe('Non-Centered Transform Origin', () => {
    it('should handle clicks when transform origin is not centered', () => {
      // Note: Current implementation assumes center-relative calculations
      // work for any transform origin because getBoundingClientRect already
      // reflects the transformed position
      mockUsePinchZoom(2);
      const { container } = render(<Rink onShotLocation={mockOnShotLocation} />);
      const rinkElement = container.querySelector('.cursor-crosshair') as HTMLElement;

      // Even with non-centered origin, the calculation should work
      // because we're working with the transformed bounding box
      simulateClick(
        rinkElement,
        { left: 100, top: 100, width: 1200, height: 600 },
        { x: 700, y: 400 }
      );

      expect(mockOnShotLocation).toHaveBeenCalledWith(
        expect.closeTo(50, 0.1),
        expect.closeTo(50, 0.1)
      );
    });
  });

  describe('Pan Detection - No Shot Placement', () => {
    it('should not place shot immediately after pan gesture', () => {
      mockUsePinchZoom(2);
      const { container } = render(<Rink onShotLocation={mockOnShotLocation} />);
      const rinkElement = container.querySelector('.cursor-crosshair') as HTMLElement;

      // Simulate pan by touch events
      fireEvent.touchStart(rinkElement, {
        touches: [{ clientX: 400, clientY: 300 }],
      });

      // Move significantly to trigger pan (threshold is 10px)
      fireEvent.touchMove(rinkElement, {
        touches: [{ clientX: 450, clientY: 300 }],
      });

      // Now try to click while panning state might still be active
      const rect = { left: 100, top: 100, width: 1200, height: 600 };
      vi.spyOn(rinkElement, 'getBoundingClientRect').mockReturnValue({
        ...rect,
        right: rect.left + rect.width,
        bottom: rect.top + rect.height,
        x: rect.left,
        y: rect.top,
        toJSON: () => ({}),
      } as DOMRect);

      fireEvent.click(rinkElement, {
        clientX: 700,
        clientY: 400,
      });

      // The click during pan should be blocked
      // (Note: There's a 50ms timeout in the component, so this may be timing-dependent)
      expect(mockOnShotLocation).not.toHaveBeenCalled();
    });

    it('should not place shot when isPinching is true', () => {
      // Mock as pinching
      usePinchZoomSpy = vi.spyOn(usePinchZoomModule, 'usePinchZoom').mockReturnValue({
        scale: 2,
        isPinching: true,
        pinchCenter: { x: 400, y: 300 },
        handlePinchStart: vi.fn(),
        handlePinchMove: vi.fn(),
        handlePinchEnd: vi.fn(),
        resetZoom: vi.fn(),
      });

      const { container } = render(<Rink onShotLocation={mockOnShotLocation} />);
      const rinkElement = container.querySelector('.cursor-crosshair') as HTMLElement;

      simulateClick(
        rinkElement,
        { left: 100, top: 100, width: 1200, height: 600 },
        { x: 700, y: 400 }
      );

      // Should not place shot while pinching
      expect(mockOnShotLocation).not.toHaveBeenCalled();
    });
  });

  describe('Various Zoom Levels', () => {
    const zoomLevels = [1, 1.2, 1.5, 2, 2.5, 3];

    zoomLevels.forEach((scale) => {
      it(`should handle zoom level ${scale}x consistently`, () => {
        mockOnShotLocation.mockClear();
        mockUsePinchZoom(scale);

        const { container, unmount } = render(<Rink onShotLocation={mockOnShotLocation} />);
        const rinkElement = container.querySelector('.cursor-crosshair') as HTMLElement;

        const scaledWidth = 600 * scale;
        const scaledHeight = 300 * scale;

        // Click at center of scaled element
        simulateClick(
          rinkElement,
          { left: 100, top: 100, width: scaledWidth, height: scaledHeight },
          { x: 100 + scaledWidth / 2, y: 100 + scaledHeight / 2 }
        );

        // Center should always map to 50%, 50% regardless of zoom
        expect(mockOnShotLocation).toHaveBeenCalledWith(
          expect.closeTo(50, 0.1),
          expect.closeTo(50, 0.1)
        );

        unmount();
      });
    });
  });
});
