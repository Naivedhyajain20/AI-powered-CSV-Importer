export interface PhoneParseResult {
  countryCode: string;
  mobileWithoutCountryCode: string;
}

export const parsePhone = (phone: string): PhoneParseResult => {
  const cleaned = phone.trim().replace(/[\s()-]/g, '');
  if (cleaned.startsWith('+')) {
    const match = cleaned.match(/^\+(\d{1,4})(\d+)$/);
    if (match) {
      return {
        countryCode: `+${match[1]}`,
        mobileWithoutCountryCode: match[2],
      };
    }
  }
  return {
    countryCode: '',
    mobileWithoutCountryCode: cleaned.replace(/\D/g, ''),
  };
};
