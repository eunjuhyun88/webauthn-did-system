/**
 * 🔐 암호화 유틸리티 함수들
 */

export async function encryptData(data: string, key: string): Promise<string> {
  // 임시 구현 (실제로는 WebCrypto API 사용)
  return btoa(data);
}

export async function decryptData(encryptedData: string, key: string): Promise<string> {
  // 임시 구현 (실제로는 WebCrypto API 사용)
  return atob(encryptedData);
}

export function generateRandomString(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
