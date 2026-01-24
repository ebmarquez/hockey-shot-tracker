import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import { ToastProvider, useToast } from './ToastContext';
import React from 'react';

describe('ToastContext', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  const TestComponent: React.FC = () => {
    const { showToast } = useToast();
    
    return (
      <div>
        <button onClick={() => showToast('Test message')}>Show Toast</button>
        <button onClick={() => showToast('Success!', 'success')}>Show Success</button>
        <button onClick={() => showToast('Goal!', 'celebration', 5000)}>Show Goal</button>
      </div>
    );
  };

  it('should throw error when useToast is used outside ToastProvider', () => {
    // Suppress console.error for this test
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useToast must be used within a ToastProvider');
    
    consoleError.mockRestore();
  });

  it('should provide showToast function', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );
    
    expect(screen.getByText('Show Toast')).toBeInTheDocument();
  });

  it('should show toast with default type and duration', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );
    
    const button = screen.getByText('Show Toast');
    act(() => {
      fireEvent.click(button);
    });
    
    expect(screen.getByText('Test message')).toBeInTheDocument();
    const alert = screen.getByRole('alert');
    expect(alert.className).toContain('bg-blue-600'); // info style
  });

  it('should show toast with custom type', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );
    
    const button = screen.getByText('Show Success');
    act(() => {
      fireEvent.click(button);
    });
    
    expect(screen.getByText('Success!')).toBeInTheDocument();
    const alert = screen.getByRole('alert');
    expect(alert.className).toContain('bg-green-600'); // success style
  });

  it('should show toast with custom duration', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );
    
    const button = screen.getByText('Show Goal');
    act(() => {
      fireEvent.click(button);
    });
    
    expect(screen.getByText('Goal!')).toBeInTheDocument();
    
    // Should still be visible after 3s (default duration)
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.getByText('Goal!')).toBeInTheDocument();
    
    // Should be dismissed after 5s (custom duration)
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.queryByText('Goal!')).not.toBeInTheDocument();
  });

  it('should stack multiple toasts', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );
    
    const showToastButton = screen.getByText('Show Toast');
    const showSuccessButton = screen.getByText('Show Success');
    
    act(() => {
      fireEvent.click(showToastButton);
      fireEvent.click(showSuccessButton);
    });
    
    expect(screen.getByText('Test message')).toBeInTheDocument();
    expect(screen.getByText('Success!')).toBeInTheDocument();
    
    const alerts = screen.getAllByRole('alert');
    expect(alerts).toHaveLength(2);
  });

  it('should dismiss toasts independently', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );
    
    const showToastButton = screen.getByText('Show Toast');
    
    // Show two toasts
    act(() => {
      fireEvent.click(showToastButton);
    });
    
    act(() => {
      vi.advanceTimersByTime(100); // Small delay
    });
    
    act(() => {
      fireEvent.click(showToastButton);
    });
    
    expect(screen.getAllByRole('alert')).toHaveLength(2);
    
    // First toast should dismiss after 3s
    act(() => {
      vi.advanceTimersByTime(2900);
    });
    
    const alerts = screen.getAllByRole('alert');
    expect(alerts).toHaveLength(1);
  });

  it('should auto-dismiss toast after default 3 seconds', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );
    
    const button = screen.getByText('Show Toast');
    act(() => {
      fireEvent.click(button);
    });
    
    expect(screen.getByText('Test message')).toBeInTheDocument();
    
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    
    expect(screen.queryByText('Test message')).not.toBeInTheDocument();
  });
});
