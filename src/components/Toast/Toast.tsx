import React, { useEffect } from 'react';

export type ToastType = 'success' | 'info' | 'warning' | 'celebration';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
  index: number;
}

const Toast: React.FC<ToastProps> = ({ toast, onDismiss, index }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, toast.duration);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onDismiss]);

  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-600 text-white';
      case 'info':
        return 'bg-blue-600 text-white';
      case 'warning':
        return 'bg-amber-600 text-white';
      case 'celebration':
        return 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xl';
      default:
        return 'bg-gray-800 text-white';
    }
  };

  // Calculate position from bottom based on index
  const bottomPosition = 16 + index * 64; // 16px base + 64px per toast (48px height + 16px gap)

  return (
    <div
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      className={`fixed left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg font-medium text-sm shadow-lg min-h-[48px] flex items-center justify-center animate-slide-up ${getToastStyles()}`}
      style={{ bottom: `${bottomPosition}px` }}
    >
      {toast.message}
    </div>
  );
};

export default Toast;
