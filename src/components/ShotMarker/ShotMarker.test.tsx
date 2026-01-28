import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ShotMarker from './ShotMarker';
import type { Shot } from '../../types';

describe('ShotMarker', () => {
  const mockShot: Shot = {
    id: 'test-shot-1',
    period: 1,
    timestamp: new Date('2026-01-24T15:30:45').getTime(),
    team: 'home',
    x: 75,
    y: 50,
    shotType: 'wrist',
    result: 'save',
  };

  it('should render shot marker', () => {
    render(<ShotMarker shot={mockShot} />);
    const marker = screen.getByTitle('home - save');
    expect(marker).toBeInTheDocument();
  });

  it('should call onClick when clicked in delete mode', () => {
    const onClick = vi.fn();
    render(<ShotMarker shot={mockShot} onClick={onClick} isDeletable={true} />);
    
    const marker = screen.getByTitle('Click to delete: home - save');
    fireEvent.click(marker);
    
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledWith(mockShot);
  });

  it('should not call onClick when clicked and not in delete mode', () => {
    const onClick = vi.fn();
    render(<ShotMarker shot={mockShot} onClick={onClick} isDeletable={false} />);
    
    const marker = screen.getByTitle('home - save');
    fireEvent.click(marker);
    
    expect(onClick).not.toHaveBeenCalled();
  });

  it('should stop event propagation when clicked in delete mode', () => {
    const onClick = vi.fn();
    const parentOnClick = vi.fn();
    
    render(
      <div onClick={parentOnClick}>
        <ShotMarker shot={mockShot} onClick={onClick} isDeletable={true} />
      </div>
    );
    
    const marker = screen.getByTitle('Click to delete: home - save');
    fireEvent.click(marker);
    
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(parentOnClick).not.toHaveBeenCalled();
  });

  it('should allow event propagation when not in delete mode', () => {
    const onClick = vi.fn();
    const parentOnClick = vi.fn();
    
    render(
      <div onClick={parentOnClick}>
        <ShotMarker shot={mockShot} onClick={onClick} isDeletable={false} />
      </div>
    );
    
    const marker = screen.getByTitle('home - save');
    fireEvent.click(marker);
    
    expect(onClick).not.toHaveBeenCalled();
    expect(parentOnClick).toHaveBeenCalledTimes(1);
  });

  it('should have pointer-events-auto class when deletable', () => {
    render(<ShotMarker shot={mockShot} isDeletable={true} />);
    const marker = screen.getByTitle('Click to delete: home - save');
    expect(marker.className).toContain('pointer-events-auto');
    expect(marker.className).toContain('cursor-pointer');
  });

  it('should have pointer-events-none class when not deletable', () => {
    render(<ShotMarker shot={mockShot} isDeletable={false} />);
    const marker = screen.getByTitle('home - save');
    expect(marker.className).toContain('pointer-events-none');
  });
});
