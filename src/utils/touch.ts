/**
 * Convert touch event coordinates to rink coordinates (0-100%)
 */
export const getTouchCoordinates = (
  event: React.TouchEvent<HTMLElement>,
  element: HTMLElement
): { x: number; y: number } => {
  const rect = element.getBoundingClientRect();
  const touch = event.touches[0] || event.changedTouches?.[0];
  
  if (!touch) {
    return { x: 50, y: 50 };
  }

  const x = ((touch.clientX - rect.left) / rect.width) * 100;
  const y = ((touch.clientY - rect.top) / rect.height) * 100;

  return {
    x: Math.max(0, Math.min(100, x)),
    y: Math.max(0, Math.min(100, y)),
  };
};

/**
 * Trigger haptic feedback (vibration) if supported
 */
export const triggerHaptic = (duration: number = 10): void => {
  if ('vibrate' in navigator) {
    navigator.vibrate(duration);
  }
};

/**
 * Detect if device supports touch
 */
export const isTouchDevice = (): boolean => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};
