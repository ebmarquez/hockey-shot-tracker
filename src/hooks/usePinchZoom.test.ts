import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePinchZoom } from './usePinchZoom';

/**
 * Pinch-to-Zoom Hook Tests
 *
 * This test suite validates the pinch zoom functionality including:
 * 1. Scale management (1x to 3x range)
 * 2. Pinch gesture detection and handling
 * 3. Reset behavior when scale approaches minimum
 * 4. Boundary clamping
 */

/**
 * Create a mock TouchList with two touch points at specified positions
 */
const createMockTouches = (
  x1: number,
  y1: number,
  x2: number,
  y2: number
): TouchList => {
  const touch1 = {
    clientX: x1,
    clientY: y1,
    identifier: 0,
    pageX: x1,
    pageY: y1,
    radiusX: 0,
    radiusY: 0,
    rotationAngle: 0,
    screenX: x1,
    screenY: y1,
    force: 1,
    target: document.body,
  } as Touch;

  const touch2 = {
    clientX: x2,
    clientY: y2,
    identifier: 1,
    pageX: x2,
    pageY: y2,
    radiusX: 0,
    radiusY: 0,
    rotationAngle: 0,
    screenX: x2,
    screenY: y2,
    force: 1,
    target: document.body,
  } as Touch;

  return {
    0: touch1,
    1: touch2,
    length: 2,
    item: (index: number) => (index === 0 ? touch1 : touch2),
    [Symbol.iterator]: function* () {
      yield touch1;
      yield touch2;
    },
  } as TouchList;
};

describe('usePinchZoom', () => {
  describe('Initial State', () => {
    it('should initialize with scale of 1', () => {
      const { result } = renderHook(() => usePinchZoom());
      expect(result.current.scale).toBe(1);
    });

    it('should initialize with isPinching as false', () => {
      const { result } = renderHook(() => usePinchZoom());
      expect(result.current.isPinching).toBe(false);
    });

    it('should initialize with pinchCenter as null', () => {
      const { result } = renderHook(() => usePinchZoom());
      expect(result.current.pinchCenter).toBeNull();
    });
  });

  describe('Pinch Gesture Start', () => {
    it('should set isPinching to true when pinch starts', () => {
      const { result } = renderHook(() => usePinchZoom());
      const touches = createMockTouches(100, 100, 200, 200);

      act(() => {
        result.current.handlePinchStart(touches);
      });

      expect(result.current.isPinching).toBe(true);
    });

    it('should calculate pinch center midpoint', () => {
      const { result } = renderHook(() => usePinchZoom());
      const touches = createMockTouches(100, 100, 200, 200);

      act(() => {
        result.current.handlePinchStart(touches);
      });

      expect(result.current.pinchCenter).toEqual({ x: 150, y: 150 });
    });
  });

  describe('Zoom In (Pinch Out Gesture)', () => {
    it('should zoom in when fingers move apart', () => {
      const { result } = renderHook(() => usePinchZoom());

      // Start pinch with fingers 100px apart
      const startTouches = createMockTouches(100, 150, 200, 150);
      act(() => {
        result.current.handlePinchStart(startTouches);
      });

      // Move fingers to 200px apart (double the distance = 2x scale)
      const moveTouches = createMockTouches(50, 150, 250, 150);
      act(() => {
        result.current.handlePinchMove(moveTouches);
      });

      expect(result.current.scale).toBe(2);
    });

    it('should clamp scale to maximum of 3x', () => {
      const { result } = renderHook(() => usePinchZoom({ maxScale: 3 }));

      // Start pinch with fingers 50px apart
      const startTouches = createMockTouches(125, 150, 175, 150);
      act(() => {
        result.current.handlePinchStart(startTouches);
      });

      // Move fingers to 250px apart (5x the distance)
      const moveTouches = createMockTouches(25, 150, 275, 150);
      act(() => {
        result.current.handlePinchMove(moveTouches);
      });

      expect(result.current.scale).toBe(3);
    });
  });

  describe('Zoom Out (Pinch In Gesture)', () => {
    it('should zoom out when fingers move together', () => {
      const { result } = renderHook(() => usePinchZoom());

      // Start at 2x zoom
      const startTouches = createMockTouches(50, 150, 250, 150);
      act(() => {
        result.current.handlePinchStart(startTouches);
      });

      // First zoom to 2x
      const zoomTouches = createMockTouches(0, 150, 300, 150);
      act(() => {
        result.current.handlePinchMove(zoomTouches);
      });

      // End first pinch
      act(() => {
        result.current.handlePinchEnd();
      });

      // Now start a new pinch to zoom out
      const newStartTouches = createMockTouches(50, 150, 250, 150);
      act(() => {
        result.current.handlePinchStart(newStartTouches);
      });

      // Move fingers closer (half the distance = 0.5x multiplier)
      const closeTouches = createMockTouches(125, 150, 175, 150);
      act(() => {
        result.current.handlePinchMove(closeTouches);
      });

      expect(result.current.scale).toBeLessThan(1.5);
    });

    it('should clamp scale to minimum of 1x', () => {
      const { result } = renderHook(() => usePinchZoom({ minScale: 1 }));

      // Start pinch with fingers 200px apart
      const startTouches = createMockTouches(0, 150, 200, 150);
      act(() => {
        result.current.handlePinchStart(startTouches);
      });

      // Move fingers very close (10px apart)
      const moveTouches = createMockTouches(95, 150, 105, 150);
      act(() => {
        result.current.handlePinchMove(moveTouches);
      });

      expect(result.current.scale).toBe(1);
    });
  });

  describe('Reset Behavior', () => {
    it('should reset to 1x when scale approaches minimum', () => {
      const { result } = renderHook(() =>
        usePinchZoom({ minScale: 1, resetThreshold: 0.2 })
      );

      // Start at default (1x) and do a very slight zoom
      const startTouches = createMockTouches(100, 150, 200, 150);
      act(() => {
        result.current.handlePinchStart(startTouches);
      });

      // Small zoom to about 1.05x (just barely above 1)
      const smallZoomTouches = createMockTouches(98, 150, 207, 150);
      act(() => {
        result.current.handlePinchMove(smallZoomTouches);
      });

      // The scale should be around 1.09 which is below 1 + 0.2 = 1.2 threshold
      expect(result.current.scale).toBeLessThan(1.2);

      // End pinch - should reset to 1x since scale < 1 + 0.2
      act(() => {
        result.current.handlePinchEnd();
      });

      expect(result.current.scale).toBe(1);
    });

    it('should not reset when scale is above threshold', () => {
      const { result } = renderHook(() =>
        usePinchZoom({ minScale: 1, maxScale: 3, resetThreshold: 0.1 })
      );

      // Start pinch
      const startTouches = createMockTouches(100, 150, 200, 150);
      act(() => {
        result.current.handlePinchStart(startTouches);
      });

      // Zoom to 1.5x
      const zoomTouches = createMockTouches(75, 150, 225, 150);
      act(() => {
        result.current.handlePinchMove(zoomTouches);
      });

      // End pinch - should keep the 1.5x zoom
      act(() => {
        result.current.handlePinchEnd();
      });

      expect(result.current.scale).toBe(1.5);
    });

    it('should reset zoom to 1x when resetZoom is called', () => {
      const { result } = renderHook(() => usePinchZoom());

      // Zoom to 2x
      const startTouches = createMockTouches(100, 150, 200, 150);
      act(() => {
        result.current.handlePinchStart(startTouches);
      });

      const zoomTouches = createMockTouches(50, 150, 250, 150);
      act(() => {
        result.current.handlePinchMove(zoomTouches);
      });

      act(() => {
        result.current.handlePinchEnd();
      });

      expect(result.current.scale).toBe(2);

      // Reset zoom
      act(() => {
        result.current.resetZoom();
      });

      expect(result.current.scale).toBe(1);
      expect(result.current.isPinching).toBe(false);
      expect(result.current.pinchCenter).toBeNull();
    });
  });

  describe('Pinch End', () => {
    it('should set isPinching to false when pinch ends', () => {
      const { result } = renderHook(() => usePinchZoom());
      const touches = createMockTouches(100, 100, 200, 200);

      act(() => {
        result.current.handlePinchStart(touches);
      });

      expect(result.current.isPinching).toBe(true);

      act(() => {
        result.current.handlePinchEnd();
      });

      expect(result.current.isPinching).toBe(false);
    });

    it('should clear pinchCenter when pinch ends', () => {
      const { result } = renderHook(() => usePinchZoom());
      const touches = createMockTouches(100, 100, 200, 200);

      act(() => {
        result.current.handlePinchStart(touches);
      });

      expect(result.current.pinchCenter).not.toBeNull();

      act(() => {
        result.current.handlePinchEnd();
      });

      expect(result.current.pinchCenter).toBeNull();
    });
  });

  describe('Continuous Pinch', () => {
    it('should update pinch center during movement', () => {
      const { result } = renderHook(() => usePinchZoom());

      // Start pinch
      const startTouches = createMockTouches(100, 100, 200, 200);
      act(() => {
        result.current.handlePinchStart(startTouches);
      });

      expect(result.current.pinchCenter).toEqual({ x: 150, y: 150 });

      // Move touches - center shifts
      const moveTouches = createMockTouches(50, 50, 250, 250);
      act(() => {
        result.current.handlePinchMove(moveTouches);
      });

      expect(result.current.pinchCenter).toEqual({ x: 150, y: 150 });
    });

    it('should handle multiple scale changes in sequence', () => {
      const { result } = renderHook(() =>
        usePinchZoom({ minScale: 1, maxScale: 3 })
      );

      // First pinch: zoom to 1.5x
      const start1 = createMockTouches(100, 150, 200, 150);
      act(() => {
        result.current.handlePinchStart(start1);
      });

      const move1 = createMockTouches(75, 150, 225, 150);
      act(() => {
        result.current.handlePinchMove(move1);
      });

      act(() => {
        result.current.handlePinchEnd();
      });

      expect(result.current.scale).toBe(1.5);

      // Second pinch: zoom to 2.25x (1.5 * 1.5)
      const start2 = createMockTouches(100, 150, 200, 150);
      act(() => {
        result.current.handlePinchStart(start2);
      });

      const move2 = createMockTouches(75, 150, 225, 150);
      act(() => {
        result.current.handlePinchMove(move2);
      });

      act(() => {
        result.current.handlePinchEnd();
      });

      expect(result.current.scale).toBe(2.25);
    });
  });

  describe('Custom Options', () => {
    it('should respect custom minScale', () => {
      const { result } = renderHook(() => usePinchZoom({ minScale: 0.5 }));

      const startTouches = createMockTouches(0, 150, 200, 150);
      act(() => {
        result.current.handlePinchStart(startTouches);
      });

      // Zoom way out
      const moveTouches = createMockTouches(90, 150, 110, 150);
      act(() => {
        result.current.handlePinchMove(moveTouches);
      });

      expect(result.current.scale).toBe(0.5);
    });

    it('should respect custom maxScale', () => {
      const { result } = renderHook(() => usePinchZoom({ maxScale: 5 }));

      const startTouches = createMockTouches(100, 150, 120, 150);
      act(() => {
        result.current.handlePinchStart(startTouches);
      });

      // Zoom to 4x (within new max)
      const moveTouches = createMockTouches(60, 150, 140, 150);
      act(() => {
        result.current.handlePinchMove(moveTouches);
      });

      expect(result.current.scale).toBe(4);
    });
  });

  describe('onScaleChange Callback', () => {
    it('should call onScaleChange with correct scale and didReset=true when resetting', () => {
      const onScaleChange = vi.fn();
      const { result } = renderHook(() =>
        usePinchZoom({ minScale: 1, resetThreshold: 0.2, onScaleChange })
      );

      // Start pinch
      const startTouches = createMockTouches(100, 150, 200, 150);
      act(() => {
        result.current.handlePinchStart(startTouches);
      });

      // Small zoom within reset threshold
      const smallZoomTouches = createMockTouches(98, 150, 207, 150);
      act(() => {
        result.current.handlePinchMove(smallZoomTouches);
      });

      // End pinch - should trigger reset
      act(() => {
        result.current.handlePinchEnd();
      });

      expect(onScaleChange).toHaveBeenCalledWith(1, true);
    });

    it('should call onScaleChange with correct scale and didReset=false when not resetting', () => {
      const onScaleChange = vi.fn();
      const { result } = renderHook(() =>
        usePinchZoom({ minScale: 1, maxScale: 3, resetThreshold: 0.1, onScaleChange })
      );

      // Start pinch
      const startTouches = createMockTouches(100, 150, 200, 150);
      act(() => {
        result.current.handlePinchStart(startTouches);
      });

      // Zoom to 1.5x (above reset threshold)
      const zoomTouches = createMockTouches(75, 150, 225, 150);
      act(() => {
        result.current.handlePinchMove(zoomTouches);
      });

      // End pinch
      act(() => {
        result.current.handlePinchEnd();
      });

      expect(onScaleChange).toHaveBeenCalledWith(1.5, false);
    });

    it('should call onScaleChange with didReset=true when resetZoom is called', () => {
      const onScaleChange = vi.fn();
      const { result } = renderHook(() =>
        usePinchZoom({ minScale: 1, onScaleChange })
      );

      // First zoom to 2x
      const startTouches = createMockTouches(100, 150, 200, 150);
      act(() => {
        result.current.handlePinchStart(startTouches);
      });

      const zoomTouches = createMockTouches(50, 150, 250, 150);
      act(() => {
        result.current.handlePinchMove(zoomTouches);
      });

      act(() => {
        result.current.handlePinchEnd();
      });

      onScaleChange.mockClear();

      // Call resetZoom
      act(() => {
        result.current.resetZoom();
      });

      expect(onScaleChange).toHaveBeenCalledWith(1, true);
    });

    it('should not call onScaleChange when callback is not provided', () => {
      const { result } = renderHook(() => usePinchZoom());

      // Start pinch
      const startTouches = createMockTouches(100, 150, 200, 150);
      act(() => {
        result.current.handlePinchStart(startTouches);
      });

      // End pinch - should not throw
      expect(() => {
        act(() => {
          result.current.handlePinchEnd();
        });
      }).not.toThrow();
    });
  });
});
