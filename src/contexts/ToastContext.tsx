'use client';

import { createContext, useContext, ReactNode } from 'react';
import toast, { Toaster } from 'react-hot-toast';

interface ToastContextType {
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const showSuccess = (title: string, message?: string) => {
    const content = message ? `${title}\n${message}` : title;
    toast.success(content, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#fff',
        color: '#374151',
        padding: '16px',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        borderLeft: '4px solid #10b981',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        maxWidth: '420px',
        width: '100%',
        fontSize: '14px',
        lineHeight: '1.5',
      },
      iconTheme: {
        primary: '#10b981',
        secondary: '#fff',
      },
    });
  };

  const showError = (title: string, message?: string) => {
    const content = message ? `${title}\n${message}` : title;
    toast.error(content, {
      duration: 5000,
      position: 'top-right',
      style: {
        background: '#fff',
        color: '#374151',
        padding: '16px',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        borderLeft: '4px solid #ef4444',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        maxWidth: '420px',
        width: '100%',
        fontSize: '14px',
        lineHeight: '1.5',
      },
      iconTheme: {
        primary: '#ef4444',
        secondary: '#fff',
      },
    });
  };

  const showWarning = (title: string, message?: string) => {
    const content = message ? `${title}\n${message}` : title;
    toast(content, {
      duration: 4000,
      position: 'top-right',
      icon: '⚠️',
      style: {
        background: '#fff',
        color: '#374151',
        padding: '16px',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        borderLeft: '4px solid #f59e0b',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        maxWidth: '420px',
        width: '100%',
        fontSize: '14px',
        lineHeight: '1.5',
      },
    });
  };

  const showInfo = (title: string, message?: string) => {
    const content = message ? `${title}\n${message}` : title;
    toast(content, {
      duration: 4000,
      position: 'top-right',
      icon: 'ℹ️',
      style: {
        background: '#fff',
        color: '#374151',
        padding: '16px',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        borderLeft: '4px solid #3b82f6',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        maxWidth: '420px',
        width: '100%',
        fontSize: '14px',
        lineHeight: '1.5',
      },
    });
  };

  return (
    <ToastContext.Provider value={{ showSuccess, showError, showWarning, showInfo }}>
      {children}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={12}
        containerStyle={{
          top: 80,
          right: 16,
        }}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#374151',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            maxWidth: '420px',
            width: '100%',
            fontSize: '14px',
            lineHeight: '1.5',
          },
        }}
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}