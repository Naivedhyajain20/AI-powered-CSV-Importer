export interface Batch {
  index: number;
  rows: Record<string, any>[];
}

export interface BatchResult {
  index: number;
  succeeded: Record<string, any>[];
  failed: BatchRowError[];
}

export interface BatchRowError {
  rowIndex: number;
  field?: string;
  value?: any;
  message: string;
}

export type JobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface JobProgress {
  jobId: string;
  status: JobStatus;
  percentage: number;
  totalBatches: number;
  completedBatches: number;
  failedBatches: number;
}
