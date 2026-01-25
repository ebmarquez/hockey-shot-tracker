import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Rink from './Rink';

/**
 * Zone Labels Tests
 * 
 * This test suite validates the zone labels feature of the Rink component,
 * ensuring that labels display correctly with default and custom team names.
 * 
 * NHL Convention:
 * - Away team zone displayed on LEFT side
 * - Home team zone displayed on RIGHT side (home attacks right)
 */

describe('Zone Labels', () => {
  const mockOnShotLocation = vi.fn();

  it('should display Home Zone on right side', () => {
    render(<Rink onShotLocation={mockOnShotLocation} />);
    
    expect(screen.getByText('Home Zone')).toBeInTheDocument();
  });

  it('should display Away Zone on left side', () => {
    render(<Rink onShotLocation={mockOnShotLocation} />);
    
    expect(screen.getByText('Away Zone')).toBeInTheDocument();
  });

  it('should show custom team names when set', () => {
    render(
      <Rink 
        onShotLocation={mockOnShotLocation}
        homeTeamName="Bruins"
        awayTeamName="Rangers"
      />
    );
    
    expect(screen.getByText('Bruins Zone')).toBeInTheDocument();
    expect(screen.getByText('Rangers Zone')).toBeInTheDocument();
    expect(screen.queryByText('Home Zone')).not.toBeInTheDocument();
    expect(screen.queryByText('Away Zone')).not.toBeInTheDocument();
  });

  it('should update when team names change', () => {
    const { rerender } = render(
      <Rink 
        onShotLocation={mockOnShotLocation}
        homeTeamName="Bruins"
        awayTeamName="Rangers"
      />
    );
    
    expect(screen.getByText('Bruins Zone')).toBeInTheDocument();
    expect(screen.getByText('Rangers Zone')).toBeInTheDocument();
    
    // Update team names
    rerender(
      <Rink 
        onShotLocation={mockOnShotLocation}
        homeTeamName="Penguins"
        awayTeamName="Flyers"
      />
    );
    
    expect(screen.getByText('Penguins Zone')).toBeInTheDocument();
    expect(screen.getByText('Flyers Zone')).toBeInTheDocument();
    expect(screen.queryByText('Bruins Zone')).not.toBeInTheDocument();
    expect(screen.queryByText('Rangers Zone')).not.toBeInTheDocument();
  });

  it('should position away zone label on left and home zone label on right', () => {
    render(
      <Rink 
        onShotLocation={mockOnShotLocation}
        homeTeamName="Bruins"
        awayTeamName="Rangers"
      />
    );
    
    const awayLabel = screen.getByText('Rangers Zone');
    const homeLabel = screen.getByText('Bruins Zone');
    
    // Both labels should be in a flex container with justify-between
    const container = awayLabel.parentElement;
    expect(container).toHaveClass('flex', 'justify-between');
    
    // Away zone should be the first child (left side)
    expect(container?.firstChild).toContainElement(awayLabel);
    
    // Home zone should be the last child (right side)
    expect(container?.lastChild).toContainElement(homeLabel);
  });

  it('should have subtle styling (gray text, small font)', () => {
    render(<Rink onShotLocation={mockOnShotLocation} />);
    
    const awayLabel = screen.getByText('Away Zone');
    const homeLabel = screen.getByText('Home Zone');
    
    // Check for gray text and small font size classes
    expect(awayLabel).toHaveClass('text-gray-400', 'text-sm');
    expect(homeLabel).toHaveClass('text-gray-400', 'text-sm');
  });

  it('should fall back to default labels when team names are empty strings', () => {
    render(
      <Rink 
        onShotLocation={mockOnShotLocation}
        homeTeamName=""
        awayTeamName=""
      />
    );
    
    expect(screen.getByText('Home Zone')).toBeInTheDocument();
    expect(screen.getByText('Away Zone')).toBeInTheDocument();
  });
});
