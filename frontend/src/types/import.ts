export interface ColumnMapping {
  sourceHeader: string;
  targetField: string | null;
}

export interface ColumnMappingResult extends ColumnMapping {
  confidence: number;
  source: 'Heuristic' | 'Gemini';
  reason?: string;
}

export type CSVRecord = Record<string, string>;

export interface ImportSummaryMetrics {
  totalRows: number;
  importedRows: number;
  skippedRows: number;
  failedRows: number;
  batchesProcessed: number;
  batchesFailed: number;
  retryCount: number;
  processingTimeMs: number;
  averageBatchTimeMs: number;
  totalGeminiCalls: number;
}

export interface DetailedImportResponse {
  success: boolean;
  importedRecords: Record<string, string>[];
  skippedRecords: Array<{
    rowIndex: number;
    reason: string;
  }>;
  failedRecords: Record<string, string>[];
  metadata: ImportSummaryMetrics;
}

export interface UploadResponse {
  success: boolean;
  uploadId: string;
  headers: string[];
  preview: CSVRecord[];
  previewRows: number;
  totalRows: number;
  metadata: {
    fileName: string;
    fileSize: number;
    detectedColumns: number;
  };
}

export interface MappingResponse {
  success: boolean;
  headerMappings: ColumnMappingResult[];
}
