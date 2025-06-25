/**
 * 🔔 Toast 유틸리티 함수
 * 기존 showNotification을 대체하는 간단한 래퍼
 */

// 전역 toast 함수를 위한 타입
interface ToastFunction {
  (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string): void;
}

// 전역 변수로 toast 함수 저장
let globalToastFunction: ToastFunction | null = null;

// useToast 훅의 addToast 함수를 전역으로 등록
export function registerToastFunction(addToast: any) {
  globalToastFunction = (type, title, message) => {
    addToast({
      type,
      title,
      message
    });
  };
}

// 기존 showNotification과 호환되는 함수
export function showNotification(
  type: 'success' | 'error' | 'warning' | 'info' | 'insight',
  title: string, 
  message?: string
) {
  // 'insight' 타입을 'info'로 변환
  const toastType = type === 'insight' ? 'info' : type;
  
  if (globalToastFunction) {
    globalToastFunction(toastType, title, message);
  } else {
    // fallback: console.log
    console.log(`${type.toUpperCase()}: ${title}`, message ? `- ${message}` : '');
  }
}

// 편의 함수들
export const toast = {
  success: (title: string, message?: string) => showNotification('success', title, message),
  error: (title: string, message?: string) => showNotification('error', title, message),
  warning: (title: string, message?: string) => showNotification('warning', title, message),
  info: (title: string, message?: string) => showNotification('info', title, message),
  insight: (title: string, message?: string) => showNotification('insight', title, message)
};

// 기본 내보내기
export default showNotification;