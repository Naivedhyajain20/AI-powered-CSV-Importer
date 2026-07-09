import pino from 'pino';
import { BatchResult } from '../../types/batch';

const logger = pino();

export interface ISummaryBuilderService {
  build(
    batchResults: BatchResult[],
    processingTimeMs: number,
    retryCount: number,
    totalGeminiCalls: number
  ): Promise<{
    importedRecords: any[];
    skippedRecords: any[];
    failedRecords: any[];
    metadata: {
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
    };
  }>;
}

export class SummaryBuilderService implements ISummaryBuilderService {
  async build(
    batchResults: BatchResult[],
    processingTimeMs: number,
    retryCount: number,
    totalGeminiCalls: number
  ) {
    const importedRecords: any[] = [];
    const skippedRecords: any[] = [];
    const failedRecords: any[] = [];

    let batchesProcessed = 0;
    let batchesFailed = 0;

    batchResults.forEach((b) => {
      batchesProcessed++;
      
      // If a batch has no successful records but has failures, mark as failed batch
      if (b.succeeded.length === 0 && b.failed.length > 0) {
        batchesFailed++;
      }

      importedRecords.push(...b.succeeded);
      b.failed.forEach((f) => {
        skippedRecords.push({
          rowIndex: f.rowIndex,
          reason: f.message,
        });
      });
    });

    const totalRows = importedRecords.length + skippedRecords.length;
    const averageBatchTimeMs =
      batchesProcessed > 0 ? Math.round(processingTimeMs / batchesProcessed) : 0;

    logger.info(
      { totalRows, importedRowsCount: importedRecords.length, skippedRowsCount: skippedRecords.length },
      'Summary Generated'
    );

    return {
      importedRecords,
      skippedRecords,
      failedRecords,
      metadata: {
        totalRows,
        importedRows: importedRecords.length,
        skippedRows: skippedRecords.length,
        failedRows: failedRecords.length,
        batchesProcessed,
        batchesFailed,
        retryCount,
        processingTimeMs,
        averageBatchTimeMs,
        totalGeminiCalls,
      },
    };
  }
}
