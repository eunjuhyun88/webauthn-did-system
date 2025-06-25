/**
 * ✅ 입력 검증 유틸리티 함수들
 */

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateUsername(username: string): boolean {
  return username.length >= 3 && username.length <= 20;
}

export function validatePassword(password: string): boolean {
  return password.length >= 8;
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}
