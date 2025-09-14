// utils/referrals.ts

const USER_REFERRAL_CODE_KEY = 'w3-user-referral-code';
export const DISCOUNT_PERCENTAGE = 10; // 10% discount

/**
 * Generates a random alphanumeric string for the referral code.
 * Format: WKXXXXXX
 */
const generateReferralCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `WK${code}`;
};

/**
 * Retrieves the user's referral code from local storage.
 * If it doesn't exist, it generates a new one and stores it.
 */
export const getUserReferralCode = (): string => {
  let userCode = localStorage.getItem(USER_REFERRAL_CODE_KEY);
  if (!userCode) {
    userCode = generateReferralCode();
    localStorage.setItem(USER_REFERRAL_CODE_KEY, userCode);
  }
  return userCode;
};


interface ValidationResult {
    isValid: boolean;
    message: string;
}

/**
 * Validates a given referral code.
 * For this simulation, it checks the format and ensures it's not the user's own code.
 * In a real app, this would involve a server-side check.
 */
export const validateReferralCode = (code: string): ValidationResult => {
    const userCode = getUserReferralCode();
    
    if (code.toUpperCase() === userCode.toUpperCase()) {
        return { isValid: false, message: "You cannot use your own referral code." };
    }

    const regex = /^WK[A-Z0-9]{6}$/;
    if (!regex.test(code.toUpperCase())) {
        return { isValid: false, message: "Invalid referral code format." };
    }

    // Simulate successful validation for any other valid format
    return { isValid: true, message: "Referral code applied successfully!" };
};