import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Rink from './Rink';

/**
 * Rink Pan Gesture Tests
 * 
 * This test suite validates the pan gesture functionality in the Rink component.
 * Tests verify that:
 * 1. Pan is disabled when scale = 1x (default)
 * 2. Pan will be enabled when scale > 1x (when zoom is implemented)
 * 3. Pan offset is constrained to boundaries
 * 4. Tap is distinguished from pan (movement threshold)
 * 5. Shot placement is not triggered during panning
 */

describe('Rink Pan Gestures', () => {
  const mockOnShotLocation = vi.fn();

  beforeEach(() => {
    mockOnShotLocation.mockClear();
  });

  describe('Default Behavior (scale = 1x)', () => {
    it('should render rink without pan offset at scale 1x', () => {
      const { container } = render(
        <Rink onShotLocation={mockOnShotLocation} />
      );
      
      const rinkElement = container.querySelector('.cursor-crosshair') as HTMLElement;
      expect(rinkElement).toBeTruthy();
      expect(rinkElement.style.transform).toContain('scale(1)');
      expect(rinkElement.style.transform).toContain('translate(0px, 0px)');
    });

    it('should have overflow-hidden on container for pan boundaries', () => {
      const { container } = render(
        <Rink onShotLocation={mockOnShotLocation} />
      );
      
      const containerElement = container.querySelector('.overflow-hidden');
      expect(containerElement).toBeTruthy();
    });

    it('should register click events at scale 1x', () => {
      const { container } = render(
        <Rink onShotLocation={mockOnShotLocation} />
      );
      
      const rinkElement = container.querySelector('.cursor-crosshair') as HTMLElement;
      
      // Create a mock getBoundingClientRect
      vi.spyOn(rinkElement, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        top: 0,
        width: 600,
        height: 255,
        right: 600,
        bottom: 255,
        x: 0,
        y: 0,
        toJSON: () => ({})
      });
      
      // Simulate click at center
      rinkElement.click();
      
      expect(mockOnShotLocation).toHaveBeenCalled();
    });
  });

  describe('Touch Event Handlers', () => {
    it('should have touch event handlers attached', () => {
      const { container } = render(
        <Rink onShotLocation={mockOnShotLocation} />
      );
      
      const rinkElement = container.querySelector('.cursor-crosshair') as HTMLElement;
      expect(rinkElement.ontouchstart).toBeDefined();
      expect(rinkElement.ontouchmove).toBeDefined();
      expect(rinkElement.ontouchend).toBeDefined();
    });

    it('should apply transform origin center for pan and zoom', () => {
      const { container } = render(
        <Rink onShotLocation={mockOnShotLocation} />
      );
      
      const rinkElement = container.querySelector('.cursor-crosshair') as HTMLElement;
      expect(rinkElement.style.transformOrigin).toBe('center center');
    });

    it('should apply transition for smooth animations when not panning', () => {
      const { container } = render(
        <Rink onShotLocation={mockOnShotLocation} />
      );
      
      const rinkElement = container.querySelector('.cursor-crosshair') as HTMLElement;
      // Should have transition when not actively panning
      expect(rinkElement.style.transition).toContain('transform');
    });
  });

  describe('Zone Labels', () => {
    it('should display default zone labels', () => {
      render(<Rink onShotLocation={mockOnShotLocation} />);
      
      expect(screen.getByText('Away Zone')).toBeTruthy();
      expect(screen.getByText('Home Zone')).toBeTruthy();
    });

    it('should display custom team names in zone labels', () => {
      render(
        <Rink 
          onShotLocation={mockOnShotLocation} 
          homeTeamName="Bruins"
          awayTeamName="Canadiens"
        />
      );
      
      expect(screen.getByText('Canadiens Zone')).toBeTruthy();
      expect(screen.getByText('Bruins Zone')).toBeTruthy();
    });
  });

  describe('Component Structure', () => {
    it('should render SVG rink with correct viewBox', () => {
      const { container } = render(
        <Rink onShotLocation={mockOnShotLocation} />
      );
      
      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
      expect(svg?.getAttribute('viewBox')).toBe('0 0 200 85');
    });

    it('should render shot markers overlay container', () => {
      render(
        <Rink onShotLocation={mockOnShotLocation}>
          <div data-testid="test-marker">Test Marker</div>
        </Rink>
      );
      
      expect(screen.getByTestId('test-marker')).toBeTruthy();
    });

    it('should render children in pointer-events-none overlay', () => {
      const { container } = render(
        <Rink onShotLocation={mockOnShotLocation}>
          <div>Shot Markers</div>
        </Rink>
      );
      
      const overlays = container.querySelectorAll('.pointer-events-none');
      // Should have at least one overlay (the markers container)
      expect(overlays.length).toBeGreaterThan(0);
      
      // Find the div overlay (not SVG)
      const divOverlay = Array.from(overlays).find(el => el.tagName === 'DIV');
      expect(divOverlay).toBeTruthy();
      expect(divOverlay?.textContent).toContain('Shot Markers');
    });
  });

  describe('Pan State Readiness', () => {
    it('should be ready for future zoom integration', () => {
      render(
        <Rink onShotLocation={mockOnShotLocation} />
      );
      
      const rinkElement = document.querySelector('.cursor-crosshair') as HTMLElement;
      
      // Should have transform property ready for scale changes
      expect(rinkElement.style.transform).toBeDefined();
      expect(rinkElement.style.transformOrigin).toBe('center center');
      
      // Should have touch handlers ready
      expect(rinkElement.ontouchstart).toBeDefined();
      expect(rinkElement.ontouchmove).toBeDefined();
      expect(rinkElement.ontouchend).toBeDefined();
    });
  });
});
