// =============================================================================
// 🔐 암호화 유틸리티
// =============================================================================

export const generateSecureKey = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export const hashData = async (data: string): Promise<string> => {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const encryptData = async (data: string, key: string): Promise<string> => {
  // 실제 환경에서는 더 강력한 암호화 구현 필요
  return btoa(data + key);
};

export const decryptData = async (encryptedData: string, key: string): Promise<string> => {
  // 실제 환경에서는 더 강력한 복호화 구현 필요
  const decoded = atob(encryptedData);
  return decoded.replace(key, '');
};
