/**
 * 🔔 Toast 알림 시스템 (수정된 버전)
 * ToastProvider와 함께 작동하는 완전한 시스템
 */

'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

// =============================================================================
// 타입 정의
// =============================================================================

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  timestamp: Date;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id' | 'timestamp'>) => void;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

// =============================================================================
// Context 생성
// =============================================================================

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// =============================================================================
// ToastProvider 컴포넌트
// =============================================================================

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toastData: Omit<Toast, 'id' | 'timestamp'>) => {
    const newToast: Toast = {
      ...toastData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      duration: toastData.duration || 5000
    };

    setToasts(prev => [newToast, ...prev.slice(0, 4)]); // 최대 5개까지만

    // 자동 제거
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(newToast.id);
      }, newToast.duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearAllToasts }}>
      {children}
    </ToastContext.Provider>
  );
}

// =============================================================================
// useToast 훅
// =============================================================================

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

// =============================================================================
// 개별 Toast 컴포넌트
// =============================================================================

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success':
        return 'border-green-500';
      case 'error':
        return 'border-red-500';
      case 'warning':
        return 'border-yellow-500';
      case 'info':
        return 'border-blue-500';
      default:
        return 'border-gray-400';
    }
  };

  return (
    <div 
      className={`bg-white border-l-4 ${getBorderColor()} rounded-r-lg shadow-lg transform transition-all duration-300 ease-in-out hover:shadow-xl max-w-sm`}
    >
      <div className="p-4 pr-12 relative">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-0.5">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 text-sm">{toast.title}</div>
            {toast.message && (
              <div className="text-sm text-gray-600 mt-1 leading-relaxed">{toast.message}</div>
            )}
          </div>
        </div>
        <button 
          onClick={() => onRemove(toast.id)} 
          className="absolute top-2 right-2 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// Toaster 컴포넌트 (Toast들을 렌더링)
// =============================================================================

export function Toaster() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <ToastItem 
          key={toast.id} 
          toast={toast} 
          onRemove={removeToast}
        />
      ))}
    </div>
  );
}

// =============================================================================
// 편의 함수들
// =============================================================================

export const toast = {
  success: (title: string, message?: string, duration?: number) => {
    // 이 함수는 컴포넌트 외부에서 사용할 수 없습니다.
    // useToast 훅을 통해 사용해야 합니다.
    console.warn('toast.success는 useToast 훅을 통해 사용하세요');
  },
  error: (title: string, message?: string, duration?: number) => {
    console.warn('toast.error는 useToast 훅을 통해 사용하세요');
  },
  warning: (title: string, message?: string, duration?: number) => {
    console.warn('toast.warning는 useToast 훅을 통해 사용하세요');
  },
  info: (title: string, message?: string, duration?: number) => {
    console.warn('toast.info는 useToast 훅을 통해 사용하세요');
  }
};

// =============================================================================
// 기본 내보내기
// =============================================================================

export default ToastProvider;