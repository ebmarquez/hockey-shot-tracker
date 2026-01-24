import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DeleteShotDialog from './DeleteShotDialog';
import type { Shot } from '../../types';

describe('DeleteShotDialog', () => {
  const mockShot: Shot = {
    id: 'test-shot-1',
    period: 2,
    timestamp: new Date('2026-01-24T15:30:45').getTime(),
    team: 'home',
    x: 75,
    y: 50,
    shotType: 'wrist',
    result: 'goal',
  };

  const mockProps = {
    shot: mockShot,
    homeTeam: 'Bruins',
    awayTeam: 'Maple Leafs',
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  it('should render dialog with correct title', () => {
    render(<DeleteShotDialog {...mockProps} />);
    expect(screen.getByText('Delete Shot?')).toBeInTheDocument();
  });

  it('should display correct shot details', () => {
    render(<DeleteShotDialog {...mockProps} />);
    
    expect(screen.getByText('Bruins')).toBeInTheDocument(); // Team name
    expect(screen.getByText('2nd')).toBeInTheDocument(); // Period
    expect(screen.getByText('Goal')).toBeInTheDocument(); // Result
  });

  it('should display away team name when shot is from away team', () => {
    const awayShot = { ...mockShot, team: 'away' as const };
    render(<DeleteShotDialog {...mockProps} shot={awayShot} />);
    
    expect(screen.getByText('Maple Leafs')).toBeInTheDocument();
  });

  it('should format period labels correctly', () => {
    const periods = [
      { period: 1 as const, label: '1st' },
      { period: 2 as const, label: '2nd' },
      { period: 3 as const, label: '3rd' },
      { period: 'OT' as const, label: 'OT' },
    ];

    periods.forEach(({ period, label }) => {
      const shot = { ...mockShot, period };
      const { unmount } = render(<DeleteShotDialog {...mockProps} shot={shot} />);
      expect(screen.getByText(label)).toBeInTheDocument();
      unmount();
    });
  });

  it('should call onConfirm when Delete button is clicked', () => {
    const onConfirm = vi.fn();
    render(<DeleteShotDialog {...mockProps} onConfirm={onConfirm} />);
    
    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);
    
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('should call onCancel when Cancel button is clicked', () => {
    const onCancel = vi.fn();
    render(<DeleteShotDialog {...mockProps} onCancel={onCancel} />);
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('should call onCancel when Escape key is pressed', () => {
    const onCancel = vi.fn();
    render(<DeleteShotDialog {...mockProps} onCancel={onCancel} />);
    
    fireEvent.keyDown(document, { key: 'Escape' });
    
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('should call onCancel when backdrop is clicked', () => {
    const onCancel = vi.fn();
    const { container } = render(<DeleteShotDialog {...mockProps} onCancel={onCancel} />);
    
    const backdrop = container.firstChild as HTMLElement;
    fireEvent.click(backdrop);
    
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('should not call onCancel when dialog content is clicked', () => {
    const onCancel = vi.fn();
    render(<DeleteShotDialog {...mockProps} onCancel={onCancel} />);
    
    const dialogContent = screen.getByRole('dialog');
    fireEvent.click(dialogContent);
    
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('should have accessible dialog attributes', () => {
    render(<DeleteShotDialog {...mockProps} />);
    
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'dialog-title');
  });

  it('should have minimum touch target size for buttons', () => {
    render(<DeleteShotDialog {...mockProps} />);
    
    const deleteButton = screen.getByText('Delete');
    const cancelButton = screen.getByText('Cancel');
    
    // Check that buttons have minimum height class
    expect(deleteButton.className).toContain('min-h-[48px]');
    expect(cancelButton.className).toContain('min-h-[48px]');
  });
});
