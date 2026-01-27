import { useState, useCallback, useRef } from 'react';

interface PinchZoomState {
  scale: number;
  isPinching: boolean;
  pinchCenter: { x: number; y: number } | null;
}

interface UsePinchZoomOptions {
  minScale?: number;
  maxScale?: number;
  resetThreshold?: number;
  onScaleChange?: (scale: number, didReset: boolean) => void;
}

interface UsePinchZoomReturn {
  scale: number;
  isPinching: boolean;
  pinchCenter: { x: number; y: number } | null;
  handlePinchStart: (touches: TouchList) => void;
  handlePinchMove: (touches: TouchList) => void;
  handlePinchEnd: () => void;
  resetZoom: () => void;
}

/**
 * Calculate distance between two touch points
 */
const getTouchDistance = (touches: TouchList): number => {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Calculate midpoint between two touch points
 */
const getTouchMidpoint = (touches: TouchList): { x: number; y: number } => {
  return {
    x: (touches[0].clientX + touches[1].clientX) / 2,
    y: (touches[0].clientY + touches[1].clientY) / 2,
  };
};

/**
 * Custom hook for pinch-to-zoom gesture handling
 * 
 * Provides smooth zoom control with configurable min/max bounds
 * and automatic reset when scale approaches 1x.
 */
export function usePinchZoom(options: UsePinchZoomOptions = {}): UsePinchZoomReturn {
  const {
    minScale = 1,
    maxScale = 3,
    resetThreshold = 0.1,
    onScaleChange,
  } = options;

  const [state, setState] = useState<PinchZoomState>({
    scale: 1,
    isPinching: false,
    pinchCenter: null,
  });

  const initialDistanceRef = useRef<number | null>(null);
  const initialScaleRef = useRef<number>(1);
  // Use a ref to track current scale to avoid stale closure issues
  const scaleRef = useRef<number>(1);

  const handlePinchStart = useCallback((touches: TouchList) => {
    if (touches.length === 2) {
      initialDistanceRef.current = getTouchDistance(touches);
      // Capture current scale at start of pinch using ref
      initialScaleRef.current = scaleRef.current;
      const midpoint = getTouchMidpoint(touches);
      setState(prev => ({
        ...prev,
        isPinching: true,
        pinchCenter: midpoint,
      }));
    }
  }, []);

  const handlePinchMove = useCallback((touches: TouchList) => {
    if (touches.length === 2 && initialDistanceRef.current !== null) {
      const currentDistance = getTouchDistance(touches);
      const scaleRatio = currentDistance / initialDistanceRef.current;
      let newScale = initialScaleRef.current * scaleRatio;

      // Clamp scale to min/max bounds
      newScale = Math.max(minScale, Math.min(maxScale, newScale));

      // Update midpoint as fingers move
      const midpoint = getTouchMidpoint(touches);

      // Update the ref to keep track of current scale
      scaleRef.current = newScale;

      setState(prev => ({
        ...prev,
        scale: newScale,
        pinchCenter: midpoint,
      }));
    }
  }, [minScale, maxScale]);

  const handlePinchEnd = useCallback(() => {
    // Use functional setState to access current scale value and avoid stale closure
    setState(prev => {
      const shouldReset = prev.scale < minScale + resetThreshold;
      const finalScale = shouldReset ? minScale : prev.scale;
      
      // Update ref with final scale
      scaleRef.current = finalScale;
      
      // Notify parent of scale change if callback provided
      if (onScaleChange) {
        onScaleChange(finalScale, shouldReset);
      }
      
      return {
        ...prev,
        isPinching: false,
        scale: finalScale,
        pinchCenter: null,
      };
    });
    
    initialDistanceRef.current = null;
  }, [minScale, resetThreshold, onScaleChange]);

  const resetZoom = useCallback(() => {
    scaleRef.current = minScale;
    setState({
      scale: minScale,
      isPinching: false,
      pinchCenter: null,
    });
    initialDistanceRef.current = null;
    initialScaleRef.current = minScale;
    
    // Notify parent of scale reset if callback provided
    if (onScaleChange) {
      onScaleChange(minScale, true);
    }
  }, [minScale, onScaleChange]);

  return {
    scale: state.scale,
    isPinching: state.isPinching,
    pinchCenter: state.pinchCenter,
    handlePinchStart,
    handlePinchMove,
    handlePinchEnd,
    resetZoom,
  };
}
