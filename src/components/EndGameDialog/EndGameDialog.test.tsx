import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EndGameDialog from './EndGameDialog';
import type { Game } from '../../types';

describe('EndGameDialog', () => {
  const mockGame: Game = {
    id: 'test-game-1',
    date: '2026-01-25',
    homeTeam: 'Bruins',
    awayTeam: 'Maple Leafs',
    currentPeriod: 3,
    shots: [
      { id: '1', period: 1, timestamp: Date.now(), team: 'home', x: 75, y: 50, shotType: 'wrist', result: 'goal' },
      { id: '2', period: 1, timestamp: Date.now(), team: 'home', x: 80, y: 45, shotType: 'slap', result: 'save' },
      { id: '3', period: 2, timestamp: Date.now(), team: 'home', x: 70, y: 55, shotType: 'snap', result: 'goal' },
      { id: '4', period: 2, timestamp: Date.now(), team: 'away', x: 25, y: 50, shotType: 'wrist', result: 'goal' },
      { id: '5', period: 3, timestamp: Date.now(), team: 'away', x: 30, y: 45, shotType: 'backhand', result: 'goal' },
      { id: '6', period: 3, timestamp: Date.now(), team: 'home', x: 85, y: 40, shotType: 'tip', result: 'goal' },
    ],
  };

  const mockProps = {
    isOpen: true,
    onClose: vi.fn(),
    onViewSummary: vi.fn(),
    onNewGame: vi.fn(),
    game: mockGame,
  };

  it('should not render when isOpen is false', () => {
    render(<EndGameDialog {...mockProps} isOpen={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render dialog when isOpen is true', () => {
    render(<EndGameDialog {...mockProps} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should display correct title', () => {
    render(<EndGameDialog {...mockProps} />);
    expect(screen.getByText('Game Complete!')).toBeInTheDocument();
  });

  it('should display correct final score', () => {
    render(<EndGameDialog {...mockProps} />);
    // Home team (Bruins) has 3 goals
    // Away team (Maple Leafs) has 2 goals
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should use custom team names', () => {
    render(<EndGameDialog {...mockProps} />);
    expect(screen.getByText('Bruins')).toBeInTheDocument();
    expect(screen.getByText('Maple Leafs')).toBeInTheDocument();
  });

  it('should call onViewSummary when View Summary button is clicked', () => {
    const onViewSummary = vi.fn();
    render(<EndGameDialog {...mockProps} onViewSummary={onViewSummary} />);
    
    const viewSummaryButton = screen.getByText('View Summary');
    fireEvent.click(viewSummaryButton);
    
    expect(onViewSummary).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when Close button is clicked', () => {
    const onClose = vi.fn();
    render(<EndGameDialog {...mockProps} onClose={onClose} />);
    
    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should call onNewGame when New Game button is clicked', () => {
    const onNewGame = vi.fn();
    render(<EndGameDialog {...mockProps} onNewGame={onNewGame} />);
    
    const newGameButton = screen.getByText('New Game');
    fireEvent.click(newGameButton);
    
    expect(onNewGame).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when Escape key is pressed', () => {
    const onClose = vi.fn();
    render(<EndGameDialog {...mockProps} onClose={onClose} />);
    
    fireEvent.keyDown(document, { key: 'Escape' });
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when backdrop is clicked', () => {
    const onClose = vi.fn();
    const { container } = render(<EndGameDialog {...mockProps} onClose={onClose} />);
    
    const backdrop = container.firstChild as HTMLElement;
    fireEvent.click(backdrop);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should not call onClose when dialog content is clicked', () => {
    const onClose = vi.fn();
    render(<EndGameDialog {...mockProps} onClose={onClose} />);
    
    const dialogContent = screen.getByRole('dialog');
    fireEvent.click(dialogContent);
    
    expect(onClose).not.toHaveBeenCalled();
  });

  it('should have accessible dialog attributes', () => {
    render(<EndGameDialog {...mockProps} />);
    
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'end-game-dialog-title');
  });

  it('should have minimum touch target size for buttons', () => {
    render(<EndGameDialog {...mockProps} />);
    
    const viewSummaryButton = screen.getByText('View Summary');
    const closeButton = screen.getByText('Close');
    const newGameButton = screen.getByText('New Game');
    
    // Check that buttons have minimum height class
    expect(viewSummaryButton.className).toContain('min-h-[48px]');
    expect(closeButton.className).toContain('min-h-[48px]');
    expect(newGameButton.className).toContain('min-h-[48px]');
  });

  it('should display 0-0 score when no goals have been scored', () => {
    const gameWithNoGoals: Game = {
      ...mockGame,
      shots: [
        { id: '1', period: 1, timestamp: Date.now(), team: 'home', x: 75, y: 50, shotType: 'wrist', result: 'save' },
        { id: '2', period: 1, timestamp: Date.now(), team: 'away', x: 25, y: 50, shotType: 'slap', result: 'miss' },
      ],
    };
    
    render(<EndGameDialog {...mockProps} game={gameWithNoGoals} />);
    
    // Both scores should be 0
    const zeros = screen.getAllByText('0');
    expect(zeros).toHaveLength(2);
  });

  it('should handle empty shots array', () => {
    const gameWithNoShots: Game = {
      ...mockGame,
      shots: [],
    };
    
    render(<EndGameDialog {...mockProps} game={gameWithNoShots} />);
    
    // Both scores should be 0
    const zeros = screen.getAllByText('0');
    expect(zeros).toHaveLength(2);
    expect(screen.getByText('Bruins')).toBeInTheDocument();
    expect(screen.getByText('Maple Leafs')).toBeInTheDocument();
  });
});
