export interface IPreprocessingService {
  preprocess(records: Record<string, string>[]): Promise<Record<string, string>[]>;
}

export class PreprocessingService implements IPreprocessingService {
  async preprocess(records: Record<string, string>[]): Promise<Record<string, string>[]> {
    const cleanedRecords: Record<string, string>[] = [];

    for (const record of records) {
      const cleanedRecord: Record<string, string> = {};
      let hasData = false;

      for (const [key, val] of Object.entries(record)) {
        if (val === undefined || val === null) {
          cleanedRecord[key] = '';
          continue;
        }

        // 1. Trim and normalize whitespace
        let cleanedVal = val.trim().replace(/\s+/g, ' ');

        // 2. Convert common null representations to empty strings
        const upperVal = cleanedVal.toUpperCase();
        if (upperVal === 'N/A' || cleanedVal === '-' || upperVal === 'NULL') {
          cleanedVal = '';
        }

        cleanedRecord[key] = cleanedVal;

        if (cleanedVal !== '') {
          hasData = true;
        }
      }

      // 3. Remove empty rows (where all cell values are empty strings)
      if (hasData) {
        cleanedRecords.push(cleanedRecord);
      }
    }

    return cleanedRecords;
  }
}
