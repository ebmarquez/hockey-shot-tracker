import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GameSummary from './GameSummary';
import type { Game, Shot } from '../../types';

// Helper to create mock shots
let shotIdCounter = 0;
const createShot = (
  team: 'home' | 'away',
  period: 1 | 2 | 3 | 'OT',
  result: 'goal' | 'save' | 'miss' | 'blocked',
  timestamp?: number
): Shot => ({
  id: `test-shot-${++shotIdCounter}`,
  period,
  timestamp: timestamp ?? Date.now() - shotIdCounter * 1000,
  team,
  x: 50,
  y: 50,
  shotType: 'wrist',
  result,
});

// Helper to create a mock game
const createMockGame = (shots: Shot[] = []): Game => ({
  id: 'test-game-1',
  date: new Date().toISOString(),
  homeTeam: 'Home Team',
  awayTeam: 'Away Team',
  currentPeriod: 1,
  shots,
});

describe('GameSummary', () => {
  beforeEach(() => {
    shotIdCounter = 0;
  });

  describe('Visibility', () => {
    it('should not render when isOpen is false', () => {
      const game = createMockGame();
      const onClose = vi.fn();

      render(<GameSummary isOpen={false} onClose={onClose} game={game} />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      const game = createMockGame();
      const onClose = vi.fn();

      render(<GameSummary isOpen={true} onClose={onClose} game={game} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('Final Score Display', () => {
    it('should display final score at top', () => {
      const shots = [
        createShot('home', 1, 'goal'),
        createShot('home', 2, 'goal'),
        createShot('home', 3, 'goal'),
        createShot('away', 1, 'goal'),
        createShot('away', 2, 'goal'),
      ];
      const game = createMockGame(shots);
      const onClose = vi.fn();

      render(<GameSummary isOpen={true} onClose={onClose} game={game} />);

      // Find the score section (contains red-500 and blue-500 spans for score)
      const homeScoreElements = screen.getAllByText('3');
      const awayScoreElements = screen.getAllByText('2');
      
      // Should find score elements
      expect(homeScoreElements.length).toBeGreaterThanOrEqual(1);
      expect(awayScoreElements.length).toBeGreaterThanOrEqual(1);
      
      // Team names appear multiple times (score section, shot list, stats)
      expect(screen.getAllByText('Home Team').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Away Team').length).toBeGreaterThanOrEqual(1);
    });

    it('should display 0-0 when no goals scored', () => {
      const shots = [
        createShot('home', 1, 'save'),
        createShot('away', 1, 'miss'),
      ];
      const game = createMockGame(shots);
      const onClose = vi.fn();

      render(<GameSummary isOpen={true} onClose={onClose} game={game} />);

      // Both teams should show 0 goals (multiple zeros for score + stats)
      const zeroElements = screen.getAllByText('0');
      expect(zeroElements.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Period Shot Maps', () => {
    it('should show mini shot map for each period with shots', () => {
      const shots = [
        createShot('home', 1, 'goal'),
        createShot('home', 2, 'save'),
        createShot('home', 3, 'miss'),
      ];
      const game = createMockGame(shots);
      const onClose = vi.fn();

      render(<GameSummary isOpen={true} onClose={onClose} game={game} />);

      // Period labels appear in both shot maps and period stats
      expect(screen.getAllByText('1st Period').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('2nd Period').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('3rd Period').length).toBeGreaterThanOrEqual(1);
    });

    it('should show OT period when overtime shots exist', () => {
      const shots = [
        createShot('home', 1, 'goal'),
        createShot('home', 'OT', 'goal'),
      ];
      const game = createMockGame(shots);
      const onClose = vi.fn();

      render(<GameSummary isOpen={true} onClose={onClose} game={game} />);

      // OT appears in shot maps, shot list, and period stats
      expect(screen.getAllByText('OT').length).toBeGreaterThanOrEqual(1);
    });

    it('should display shot counts for each period', () => {
      const shots = [
        createShot('home', 1, 'goal'),
        createShot('home', 1, 'save'),
        createShot('away', 1, 'miss'),
        createShot('home', 2, 'goal'),
      ];
      const game = createMockGame(shots);
      const onClose = vi.fn();

      render(<GameSummary isOpen={true} onClose={onClose} game={game} />);

      expect(screen.getByText('3 shots')).toBeInTheDocument(); // Period 1
      expect(screen.getByText('1 shot')).toBeInTheDocument(); // Period 2 - singular
    });
  });

  describe('Shot List', () => {
    it('should list all shots with details', () => {
      const shots = [
        createShot('home', 1, 'goal'),
        createShot('away', 2, 'save'),
      ];
      const game = createMockGame(shots);
      const onClose = vi.fn();

      render(<GameSummary isOpen={true} onClose={onClose} game={game} />);

      expect(screen.getByText('Shot List')).toBeInTheDocument();
      expect(screen.getByText('Period')).toBeInTheDocument();
      expect(screen.getByText('Team')).toBeInTheDocument();
      expect(screen.getByText('Time')).toBeInTheDocument();
      expect(screen.getByText('Result')).toBeInTheDocument();
    });

    it('should show "No shots recorded" when no shots exist', () => {
      const game = createMockGame([]);
      const onClose = vi.fn();

      render(<GameSummary isOpen={true} onClose={onClose} game={game} />);

      expect(screen.getByText('No shots recorded')).toBeInTheDocument();
    });

    it('should display result badges with correct formatting', () => {
      const shots = [
        createShot('home', 1, 'goal'),
        createShot('away', 1, 'save'),
        createShot('home', 2, 'miss'),
        createShot('away', 2, 'blocked'),
      ];
      const game = createMockGame(shots);
      const onClose = vi.fn();

      render(<GameSummary isOpen={true} onClose={onClose} game={game} />);

      expect(screen.getByText('Goal')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByText('Miss')).toBeInTheDocument();
      expect(screen.getByText('Blocked')).toBeInTheDocument();
    });
  });

  describe('Statistics', () => {
    it('should show correct statistics and percentages', () => {
      // Home: 2 goals on 5 shots = 40%
      // Away: 1 goal on 4 shots = 25%
      const shots = [
        createShot('home', 1, 'goal'),
        createShot('home', 1, 'goal'),
        createShot('home', 1, 'save'),
        createShot('home', 2, 'miss'),
        createShot('home', 2, 'blocked'),
        createShot('away', 1, 'goal'),
        createShot('away', 1, 'save'),
        createShot('away', 2, 'miss'),
        createShot('away', 2, 'blocked'),
      ];
      const game = createMockGame(shots);
      const onClose = vi.fn();

      render(<GameSummary isOpen={true} onClose={onClose} game={game} />);

      expect(screen.getByText('Statistics')).toBeInTheDocument();
      expect(screen.getByText('Total Shots')).toBeInTheDocument();
      expect(screen.getByText('Shooting %')).toBeInTheDocument();
      expect(screen.getByText('40.0%')).toBeInTheDocument(); // Home shooting %
      expect(screen.getByText('25.0%')).toBeInTheDocument(); // Away shooting %
    });

    it('should show 0.0% when no shots taken', () => {
      const game = createMockGame([]);
      const onClose = vi.fn();

      render(<GameSummary isOpen={true} onClose={onClose} game={game} />);

      // Should show 0.0% for both teams
      const zeroPercentElements = screen.getAllByText('0.0%');
      expect(zeroPercentElements.length).toBe(2);
    });
  });

  describe('Per-Period Breakdown', () => {
    it('should show per-period breakdown for each team', () => {
      const shots = [
        createShot('home', 1, 'goal'),
        createShot('home', 1, 'save'),
        createShot('home', 2, 'goal'),
        createShot('away', 1, 'goal'),
      ];
      const game = createMockGame(shots);
      const onClose = vi.fn();

      render(<GameSummary isOpen={true} onClose={onClose} game={game} />);

      expect(screen.getByText('By Period')).toBeInTheDocument();
      // Should show period breakdowns
      expect(screen.getAllByText(/G \/ \d+S/).length).toBeGreaterThan(0);
    });
  });

  describe('Close Functionality', () => {
    it('should close on close button click', () => {
      const game = createMockGame();
      const onClose = vi.fn();

      render(<GameSummary isOpen={true} onClose={onClose} game={game} />);

      const closeButton = screen.getByLabelText('Close summary');
      fireEvent.click(closeButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should close on Escape key press', () => {
      const game = createMockGame();
      const onClose = vi.fn();

      render(<GameSummary isOpen={true} onClose={onClose} game={game} />);

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should close when clicking outside the dialog', () => {
      const game = createMockGame();
      const onClose = vi.fn();

      render(<GameSummary isOpen={true} onClose={onClose} game={game} />);

      // Click on the overlay (the outer div with onClick={onClose})
      const overlay = screen.getByRole('dialog').parentElement;
      if (overlay) {
        fireEvent.click(overlay);
        expect(onClose).toHaveBeenCalledTimes(1);
      }
    });

    it('should not close when clicking inside the dialog', () => {
      const game = createMockGame();
      const onClose = vi.fn();

      render(<GameSummary isOpen={true} onClose={onClose} game={game} />);

      // Click inside the dialog
      const dialog = screen.getByRole('dialog');
      fireEvent.click(dialog);

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Export Buttons', () => {
    it('should display Export PNG button', () => {
      const game = createMockGame();
      const onClose = vi.fn();

      render(<GameSummary isOpen={true} onClose={onClose} game={game} />);

      expect(screen.getByText('Export PNG')).toBeInTheDocument();
    });

    it('should display Export PDF button', () => {
      const game = createMockGame();
      const onClose = vi.fn();

      render(<GameSummary isOpen={true} onClose={onClose} game={game} />);

      expect(screen.getByText('Export PDF')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper dialog ARIA attributes', () => {
      const game = createMockGame();
      const onClose = vi.fn();

      render(<GameSummary isOpen={true} onClose={onClose} game={game} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'summary-title');
    });

    it('should have accessible close button', () => {
      const game = createMockGame();
      const onClose = vi.fn();

      render(<GameSummary isOpen={true} onClose={onClose} game={game} />);

      expect(screen.getByLabelText('Close summary')).toBeInTheDocument();
    });
  });

  describe('Header Display', () => {
    it('should display "GAME SUMMARY" title', () => {
      const game = createMockGame();
      const onClose = vi.fn();

      render(<GameSummary isOpen={true} onClose={onClose} game={game} />);

      expect(screen.getByText('GAME SUMMARY')).toBeInTheDocument();
    });
  });
});
