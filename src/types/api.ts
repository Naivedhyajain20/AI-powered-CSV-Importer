import { ColumnMappingResult } from './mapping';

export type CSVRecord = Record<string, string>;

export interface ApiResponse<T = any> {
  success: boolean;
  uploadId?: string;
  headers?: string[];
  headerMappings?: ColumnMappingResult[];
  preview?: CSVRecord[];
  previewRows?: number;
  totalRows?: number;
  records?: T[];
  summary?: ImportSummary;
  metadata?: Record<string, any>;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Array<{
    field: string;
    issue: string;
  }>;
}

export interface ImportSummary {
  totalRows: number;
  succeededRows: number;
  failedRows: number;
}
