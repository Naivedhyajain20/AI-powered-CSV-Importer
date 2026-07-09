export interface PhoneParseResult {
  countryCode: string;
  mobileWithoutCountryCode: string;
}

export const parsePhone = (phone: string): PhoneParseResult => {
  const cleaned = phone.trim().replace(/[\s()-]/g, '');
  if (cleaned.startsWith('+')) {
    // Check common country codes (1, 2 digits, 3 digits)
    const match = cleaned.match(/^\+(1|2[0-9]|3[0-9]|4[0-9]|5[0-9]|6[0-9]|7|8[0-9]|9[0-9]|[2-9][0-9]{2})(\d+)$/);
    if (match) {
      return {
        countryCode: `+${match[1]}`,
        mobileWithoutCountryCode: match[2],
      };
    }
  }
  
  const justDigits = cleaned.replace(/\D/g, '');
  if (justDigits.length === 10) {
    return {
      countryCode: '+1',
      mobileWithoutCountryCode: justDigits,
    };
  }
  
  return {
    countryCode: '',
    mobileWithoutCountryCode: justDigits,
  };
};
