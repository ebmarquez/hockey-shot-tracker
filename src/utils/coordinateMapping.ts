/**
 * Coordinate mapping utilities for the IceRink component.
 * These functions translate screen/client coordinates to rink coordinates.
 */

export interface Coordinates {
  x: number;
  y: number;
}

export interface BoundingRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * Maps desktop click coordinates to rink percentage coordinates (0-100).
 * 
 * @param clientX - The X position of the click in client/screen space
 * @param clientY - The Y position of the click in client/screen space
 * @param rect - The bounding rectangle of the rink element
 * @returns Coordinates in percentage space (0-100 for both x and y)
 */
export function mapDesktopClick(
  clientX: number,
  clientY: number,
  rect: BoundingRect
): Coordinates {
  const x = ((clientX - rect.left) / rect.width) * 100;
  const y = ((clientY - rect.top) / rect.height) * 100;

  return {
    x: clamp(x, 0, 100),
    y: clamp(y, 0, 100),
  };
}

/**
 * Maps mobile touch coordinates to rink percentage coordinates (0-100).
 * Accounts for 90° rotation on mobile view.
 * 
 * When the rink is rotated 90° for mobile:
 * - Touch Y becomes rink X (inverted: top touch = high X, i.e., away zone)
 * - Touch X becomes rink Y
 * 
 * @param clientX - The X position of the touch in client/screen space
 * @param clientY - The Y position of the touch in client/screen space
 * @param rect - The bounding rectangle of the rink element
 * @returns Coordinates in percentage space (0-100 for both x and y)
 */
export function mapMobileTouch(
  clientX: number,
  clientY: number,
  rect: BoundingRect
): Coordinates {
  // In rotated mobile view:
  // - Touch at top of screen (low touchY) -> high rink X (away zone, attacking right)
  // - Touch at bottom of screen (high touchY) -> low rink X (home zone, attacking left)
  const touchX = clientX - rect.left;
  const touchY = clientY - rect.top;

  const x = ((rect.height - touchY) / rect.height) * 100;
  const y = (touchX / rect.width) * 100;

  return {
    x: clamp(x, 0, 100),
    y: clamp(y, 0, 100),
  };
}

/**
 * Converts percentage coordinates (0-100) to SVG viewBox coordinates.
 * The SVG viewBox is 200x85.
 * 
 * @param percentCoords - Coordinates in percentage space (0-100)
 * @returns Coordinates in SVG viewBox space (0-200 for x, 0-85 for y)
 */
export function percentToSvgCoords(percentCoords: Coordinates): Coordinates {
  return {
    x: (percentCoords.x / 100) * 200,
    y: (percentCoords.y / 100) * 85,
  };
}

/**
 * Converts SVG viewBox coordinates to percentage coordinates.
 * 
 * @param svgCoords - Coordinates in SVG viewBox space
 * @returns Coordinates in percentage space (0-100)
 */
export function svgToPercentCoords(svgCoords: Coordinates): Coordinates {
  return {
    x: (svgCoords.x / 200) * 100,
    y: (svgCoords.y / 85) * 100,
  };
}

/**
 * Determines which team's zone a shot is in based on X coordinate.
 * NHL Convention: Away attacks left side (x < 50%), Home attacks right side (x >= 50%)
 * 
 * @param x - The X coordinate in percentage space (0-100)
 * @returns 'home' if x >= 50, 'away' if x < 50
 */
export function getTeamFromPosition(x: number): 'home' | 'away' {
  return x < 50 ? 'away' : 'home';
}

/**
 * Clamps a value between min and max.
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
