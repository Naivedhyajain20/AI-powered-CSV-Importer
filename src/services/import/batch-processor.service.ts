import pino from 'pino';
import { BatchResult } from '../../types/batch';
import { ColumnMapping } from '../../types/mapping';
import { IPromptBuilderService } from '../ai/prompt-builder.service';
import { IGeminiExtractionService } from '../ai/gemini-extraction.service';
import { IRetryService } from '../ai/retry.service';
import { CrmTransformationService } from './crm-transformation.service';
import { validateExtractionResponse } from '../../validators/response.validator';

const logger = pino();

export interface IBatchProcessorService {
  process(
    records: Record<string, any>[],
    mappings: ColumnMapping[],
    batchSize?: number,
    onProgress?: (completed: number, total: number) => void
  ): Promise<BatchResult[]>;
}

export class BatchProcessorService implements IBatchProcessorService {
  constructor(
    private promptBuilder: IPromptBuilderService,
    private extractionService: IGeminiExtractionService,
    private retryService: IRetryService
  ) {}

  async process(
    records: Record<string, any>[],
    mappings: ColumnMapping[],
    batchSize = 50,
    onProgress?: (completed: number, total: number) => void
  ): Promise<BatchResult[]> {
    const batches: { index: number; rows: Record<string, any>[]; startIndex: number }[] = [];
    let startIndex = 0;
    let batchIndex = 0;

    // 1. Split full records array into distinct batches
    while (startIndex < records.length) {
      const currentRows = records.slice(startIndex, startIndex + batchSize);
      batches.push({
        index: batchIndex,
        rows: currentRows,
        startIndex,
      });
      startIndex += currentRows.length;
      batchIndex++;
    }

    const crmTransformer = new CrmTransformationService();
    const results: BatchResult[] = [];
    
    // Concurrency Limit: Process at most 2 batches in parallel at any one time.
    // This staggers requests and prevents exceeding Groq free tier TPM rate limit spikes.
    const concurrency = 2;
    let completedCount = 0;
    const totalBatches = batches.length;

    for (let i = 0; i < batches.length; i += concurrency) {
      const chunk = batches.slice(i, i + concurrency);
      
      const chunkPromises = chunk.map(async (batch) => {
        let succeeded: any[] = [];
        const failed: any[] = [];

        try {
          const prompt = this.promptBuilder.buildExtractionPrompt(
            { index: batch.index, rows: batch.rows },
            mappings
          );

          logger.info({ batchIndex: batch.index, rowsCount: batch.rows.length }, 'Batch Started');

          // Call LLM within Retry execution wrapper
          const rawJsonResult = await this.retryService.execute(async () => {
            logger.info({ batchIndex: batch.index }, 'LLM Extraction Request');
            return await this.extractionService.extract(prompt);
          });

          // Strip markdown backticks if returned
          let cleanedJson = rawJsonResult.trim();
          if (cleanedJson.startsWith('```')) {
            cleanedJson = cleanedJson.replace(/^```json\s*/, '').replace(/```$/, '');
          }

          const extracted = JSON.parse(cleanedJson);
          if (!Array.isArray(extracted)) {
            throw new Error('LLM output is not a JSON array');
          }

          // Normalize BEFORE validation to maximize valid matches
          const normalized = await crmTransformer.transform(extracted);
          logger.info({ batchIndex: batch.index }, 'Transformation Completed');

          // Validate via Zod and check contact skip rules
          const validation = validateExtractionResponse(normalized, batch.startIndex);
          succeeded = validation.validRecords;

          validation.skippedRecords.forEach((s) => {
            failed.push({
              rowIndex: s.rowIndex,
              message: s.reason,
            });
          });
          logger.info({ batchIndex: batch.index }, 'Validation Completed');

        } catch (error: any) {
          logger.error(
            { err: error.message, batchIndex: batch.index },
            'Batch Completed with failure'
          );

          // Fail-tolerance: register failed rows as skipped log entries and continue
          batch.rows.forEach((_, idx) => {
            failed.push({
              rowIndex: batch.startIndex + idx,
              message: `Batch processing failed: ${error.message}`,
            });
          });
        }

        logger.info(
          { batchIndex: batch.index, succeededCount: succeeded.length, failedCount: failed.length },
          'Batch Completed'
        );

        return {
          index: batch.index,
          succeeded,
          failed,
        };
      });

      const chunkResults = await Promise.all(chunkPromises);
      completedCount += chunk.length;
      if (onProgress) {
        onProgress(completedCount, totalBatches);
      }
      results.push(...chunkResults);
    }

    // Sort results by original batch index to preserve original row ordering
    results.sort((a, b) => a.index - b.index);

    return results;
  }
}
