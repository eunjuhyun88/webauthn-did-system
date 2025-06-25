// =============================================================================
// ✅ 검증 유틸리티
// =============================================================================

export const validatePassportData = (data: any): boolean => {
  return data && 
         typeof data.did === 'string' && 
         typeof data.walletAddress === 'string' &&
         typeof data.trustScore === 'number' &&
         data.trustScore >= 0 && data.trustScore <= 100;
};

export const validateCueAmount = (amount: number): boolean => {
  return typeof amount === 'number' && 
         amount >= 0 && 
         amount <= 1000 && 
         Number.isInteger(amount);
};

export const validateMessage = (message: string): boolean => {
  return typeof message === 'string' && 
         message.trim().length > 0 && 
         message.length <= 4000;
};

export const validatePlatformId = (platformId: string): boolean => {
  const validPlatforms = ['chatgpt', 'claude', 'gemini', 'discord'];
  return typeof platformId === 'string' && validPlatforms.includes(platformId);
};
