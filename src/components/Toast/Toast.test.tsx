import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Toast from './Toast';
import type { ToastMessage } from './Toast';

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mockOnDismiss = vi.fn();

  const createToast = (overrides?: Partial<ToastMessage>): ToastMessage => ({
    id: 'test-toast-1',
    message: 'Test message',
    type: 'info',
    duration: 3000,
    ...overrides,
  });

  it('should render toast with message', () => {
    const toast = createToast();
    render(<Toast toast={toast} onDismiss={mockOnDismiss} index={0} />);
    
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('should have appropriate ARIA attributes', () => {
    const toast = createToast();
    render(<Toast toast={toast} onDismiss={mockOnDismiss} index={0} />);
    
    const toastElement = screen.getByRole('alert');
    expect(toastElement).toHaveAttribute('aria-live', 'polite');
    expect(toastElement).toHaveAttribute('aria-atomic', 'true');
  });

  it('should apply success styles', () => {
    const toast = createToast({ type: 'success' });
    render(<Toast toast={toast} onDismiss={mockOnDismiss} index={0} />);
    
    const toastElement = screen.getByRole('alert');
    expect(toastElement.className).toContain('bg-green-600');
  });

  it('should apply info styles', () => {
    const toast = createToast({ type: 'info' });
    render(<Toast toast={toast} onDismiss={mockOnDismiss} index={0} />);
    
    const toastElement = screen.getByRole('alert');
    expect(toastElement.className).toContain('bg-blue-600');
  });

  it('should apply warning styles', () => {
    const toast = createToast({ type: 'warning' });
    render(<Toast toast={toast} onDismiss={mockOnDismiss} index={0} />);
    
    const toastElement = screen.getByRole('alert');
    expect(toastElement.className).toContain('bg-amber-600');
  });

  it('should apply celebration styles', () => {
    const toast = createToast({ type: 'celebration' });
    render(<Toast toast={toast} onDismiss={mockOnDismiss} index={0} />);
    
    const toastElement = screen.getByRole('alert');
    expect(toastElement.className).toContain('bg-gradient-to-r');
    expect(toastElement.className).toContain('from-purple-600');
    expect(toastElement.className).toContain('to-pink-600');
  });

  it('should auto-dismiss after duration', () => {
    const toast = createToast({ duration: 3000 });
    render(<Toast toast={toast} onDismiss={mockOnDismiss} index={0} />);
    
    expect(mockOnDismiss).not.toHaveBeenCalled();
    
    vi.advanceTimersByTime(3000);
    
    expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    expect(mockOnDismiss).toHaveBeenCalledWith('test-toast-1');
  });

  it('should position first toast at bottom', () => {
    const toast = createToast();
    render(<Toast toast={toast} onDismiss={mockOnDismiss} index={0} />);
    
    const toastElement = screen.getByRole('alert');
    expect(toastElement).toHaveStyle({ bottom: '16px' });
  });

  it('should stack multiple toasts with proper spacing', () => {
    const toast1 = createToast({ id: 'toast-1' });
    const toast2 = createToast({ id: 'toast-2', message: 'Second toast' });
    
    const { rerender } = render(<Toast toast={toast1} onDismiss={mockOnDismiss} index={0} />);
    const firstToast = screen.getByRole('alert');
    expect(firstToast).toHaveStyle({ bottom: '16px' });
    
    rerender(<Toast toast={toast2} onDismiss={mockOnDismiss} index={1} />);
    const secondToast = screen.getByText('Second toast');
    expect(secondToast).toHaveStyle({ bottom: '80px' }); // 16 + 64
  });

  it('should have minimum touch target height', () => {
    const toast = createToast();
    render(<Toast toast={toast} onDismiss={mockOnDismiss} index={0} />);
    
    const toastElement = screen.getByRole('alert');
    expect(toastElement.className).toContain('min-h-[48px]');
  });

  it('should apply slide-up animation', () => {
    const toast = createToast();
    render(<Toast toast={toast} onDismiss={mockOnDismiss} index={0} />);
    
    const toastElement = screen.getByRole('alert');
    expect(toastElement.className).toContain('animate-slide-up');
  });

  it('should center toast horizontally', () => {
    const toast = createToast();
    render(<Toast toast={toast} onDismiss={mockOnDismiss} index={0} />);
    
    const toastElement = screen.getByRole('alert');
    expect(toastElement.className).toContain('left-1/2');
    expect(toastElement.className).toContain('-translate-x-1/2');
  });

  it('should have high z-index to appear above other content', () => {
    const toast = createToast();
    render(<Toast toast={toast} onDismiss={mockOnDismiss} index={0} />);
    
    const toastElement = screen.getByRole('alert');
    expect(toastElement.className).toContain('z-50');
  });
});
