export const standardizeDate = (dateStr: string): string => {
  const trimmed = dateStr.trim();
  if (!trimmed) return '';

  const parsed = Date.parse(trimmed);
  if (!isNaN(parsed)) {
    return new Date(parsed).toISOString().split('T')[0];
  }

  const parts = trimmed.split(/[/.-]/);
  if (parts.length === 3) {
    const p1 = parseInt(parts[0], 10);
    const p2 = parseInt(parts[1], 10);
    const p3 = parseInt(parts[2], 10);

    // Case 1: YYYY/MM/DD
    if (p1 > 1000 && p2 <= 12 && p3 <= 31) {
      const date = new Date(p1, p2 - 1, p3);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    }
    // Case 2: MM/DD/YYYY
    if (p1 <= 12 && p2 <= 31 && p3 > 1000) {
      const date = new Date(p3, p1 - 1, p2);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    }
    // Case 3: DD/MM/YYYY
    if (p1 <= 31 && p2 <= 12 && p3 > 1000) {
      const date = new Date(p3, p2 - 1, p1);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    }
  }

  return '';
};
