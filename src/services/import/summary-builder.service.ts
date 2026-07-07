import { BatchResult } from '../../types/batch';
import { ApiResponse } from '../../types/api';

export interface ISummaryBuilderService {
  build(batchResults: BatchResult[]): ApiResponse;
}

export class SummaryBuilderService implements ISummaryBuilderService {
  build(_batchResults: BatchResult[]): ApiResponse {
    // Boilerplate skeleton for response and summary compilation
    return {
      success: true,
      records: [],
      summary: {
        totalRows: 0,
        succeededRows: 0,
        failedRows: 0,
      },
    };
  }
}
