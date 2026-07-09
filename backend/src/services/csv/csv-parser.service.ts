import Papa from 'papaparse';

export interface ICsvParserService {
  parse(buffer: Buffer): Promise<Record<string, string>[]>;
}

export class CsvParserService implements ICsvParserService {
  async parse(buffer: Buffer): Promise<Record<string, string>[]> {
    const csvContent = buffer.toString('utf-8');

    if (!csvContent.trim()) {
      throw {
        status: 400,
        code: 'EMPTY_CSV',
        message: 'The uploaded CSV file is empty',
      };
    }

    const results = Papa.parse<Record<string, string>>(csvContent, {
      header: true,
      skipEmptyLines: 'greedy',
      dynamicTyping: false,
      transformHeader: (header) => header.trim(),
    });

    // Check for severe parsing errors
    if (results.errors && results.errors.length > 0) {
      const severeErrors = results.errors.filter(
        (err) =>
          err.code === 'MissingQuotes' ||
          err.code === 'UndetectableDelimiter' ||
          err.message.toLowerCase().includes('quote')
      );
      if (severeErrors.length > 0) {
        throw {
          status: 422,
          code: 'MALFORMED_CSV',
          message: `Malformed CSV format detected: ${severeErrors.map((e) => e.message).join(', ')}`,
        };
      }
    }

    const headers = results.meta.fields;
    if (!headers || headers.length === 0 || headers.every((h) => !h.trim())) {
      throw {
        status: 400,
        code: 'MISSING_HEADERS',
        message: 'CSV file must contain a header row with valid column names',
      };
    }

    if (!results.data || results.data.length === 0) {
      throw {
        status: 400,
        code: 'EMPTY_CSV',
        message: 'The uploaded CSV file contains no records',
      };
    }

    return results.data;
  }
}
