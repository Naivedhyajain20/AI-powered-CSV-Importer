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
    batchSize?: number
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
    batchSize = 50
  ): Promise<BatchResult[]> {
    const results: BatchResult[] = [];
    let startIndex = 0;
    let batchIndex = 0;

    const crmTransformer = new CrmTransformationService();

    while (startIndex < records.length) {
      let currentSize = batchSize;
      let currentRows = records.slice(startIndex, startIndex + currentSize);

      let prompt = this.promptBuilder.buildExtractionPrompt(
        { index: batchIndex, rows: currentRows },
        mappings
      );

      // Prompt Token Size Protection (30,000 characters limit)
      const MAX_CHAR_SIZE = 30000;
      while (prompt.length > MAX_CHAR_SIZE && currentSize > 5) {
        currentSize = Math.floor(currentSize / 2);
        currentRows = records.slice(startIndex, startIndex + currentSize);
        prompt = this.promptBuilder.buildExtractionPrompt(
          { index: batchIndex, rows: currentRows },
          mappings
        );
        logger.info(
          { originalSize: batchSize, newSize: currentSize, promptLength: prompt.length },
          'Dynamic batch splitting triggered'
        );
      }

      logger.info({ batchIndex, rowsCount: currentRows.length }, 'Batch Started');

      let succeeded: any[] = [];
      const failed: any[] = [];

      try {
        // Call Gemini within Retry execution wrapper
        const rawJsonResult = await this.retryService.execute(async () => {
          logger.info({ batchIndex }, 'Gemini Request');
          return await this.extractionService.extract(prompt);
        });

        // Strip markdown backticks if returned
        let cleanedJson = rawJsonResult.trim();
        if (cleanedJson.startsWith('```')) {
          cleanedJson = cleanedJson.replace(/^```json\s*/, '').replace(/```$/, '');
        }

        const extracted = JSON.parse(cleanedJson);
        if (!Array.isArray(extracted)) {
          throw new Error('Gemini output is not a JSON array');
        }

        // Normalize BEFORE validation to maximize valid matches
        const normalized = await crmTransformer.transform(extracted);
        logger.info({ batchIndex }, 'Transformation Completed');

        // Validate via Zod and check contact skip rules
        const validation = validateExtractionResponse(normalized, startIndex);
        succeeded = validation.validRecords;

        validation.skippedRecords.forEach((s) => {
          failed.push({
            rowIndex: s.rowIndex,
            message: s.reason,
          });
        });
        logger.info({ batchIndex }, 'Validation Completed');

      } catch (error: any) {
        logger.error(
          { err: error.message, batchIndex },
          'Batch Completed with failure'
        );

        // Fail-tolerance: register failed rows and continue with subsequent batches
        currentRows.forEach((_, idx) => {
          failed.push({
            rowIndex: startIndex + idx,
            message: `Batch processing failed: ${error.message}`,
          });
        });
      }

      results.push({
        index: batchIndex,
        succeeded,
        failed,
      });

      logger.info(
        { batchIndex, succeededCount: succeeded.length, failedCount: failed.length },
        'Batch Completed'
      );

      startIndex += currentRows.length;
      batchIndex++;
    }

    return results;
  }
}
