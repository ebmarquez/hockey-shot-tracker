import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Rink from './Rink';

/**
 * Zone Labels Tests
 * 
 * This test suite validates the zone labels feature of the Rink component,
 * ensuring that labels display correctly with default and custom team names.
 * 
 * NHL Convention (Vertical Rink Orientation):
 * - Away team zone displayed at TOP of rink
 * - Home team zone displayed at BOTTOM of rink (home attacks bottom)
 */

describe('Zone Labels', () => {
  const mockOnShotLocation = vi.fn();

  it('should display Home Zone at bottom', () => {
    render(<Rink onShotLocation={mockOnShotLocation} />);
    
    expect(screen.getByText('Home Zone')).toBeInTheDocument();
  });

  it('should display Away Zone at top', () => {
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

  it('should position away zone label at top and home zone label at bottom', () => {
    render(
      <Rink 
        onShotLocation={mockOnShotLocation}
        homeTeamName="Bruins"
        awayTeamName="Rangers"
      />
    );
    
    const awayLabel = screen.getByText('Rangers Zone');
    const homeLabel = screen.getByText('Bruins Zone');
    
    // Away zone label should be in a flex container with justify-center (top of rink)
    const awayContainer = awayLabel.parentElement;
    expect(awayContainer).toHaveClass('flex', 'justify-center');
    
    // Home zone label should be in a flex container with justify-center (bottom of rink)
    const homeContainer = homeLabel.parentElement;
    expect(homeContainer).toHaveClass('flex', 'justify-center');
  });

  it('should have subtle styling (gray text, small font)', () => {
    render(<Rink onShotLocation={mockOnShotLocation} />);
    
    const awayLabel = screen.getByText('Away Zone');
    const homeLabel = screen.getByText('Home Zone');
    
    // Check for gray text and responsive font size classes (text-xs on mobile, sm:text-sm on larger screens)
    expect(awayLabel).toHaveClass('text-gray-400', 'text-xs', 'sm:text-sm');
    expect(homeLabel).toHaveClass('text-gray-400', 'text-xs', 'sm:text-sm');
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
