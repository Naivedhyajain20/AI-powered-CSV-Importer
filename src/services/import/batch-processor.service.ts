import fs from 'fs';
import Papa from 'papaparse';
import pino from 'pino';
import { env } from '../../config/env';
import { BatchResult } from '../../types/batch';
import { ColumnMapping } from '../../types/mapping';
import { IPromptBuilderService } from '../ai/prompt-builder.service';
import { IGeminiExtractionService } from '../ai/gemini-extraction.service';
import { IRetryService } from '../ai/retry.service';
import { CrmTransformationService } from './crm-transformation.service';
import { PreprocessingService } from '../preprocessing/preprocessing.service';
import { validateExtractionResponse } from '../../validators/response.validator';

const logger = pino();

function cleanAndParseJsonArray(rawJsonResult: string): any[] {
  let cleanedJson = rawJsonResult.trim();
  
  if (cleanedJson.startsWith('```')) {
    cleanedJson = cleanedJson.replace(/^```(?:json|javascript)?\s*/i, '').replace(/```$/, '').trim();
  }

  const parsed = JSON.parse(cleanedJson);
  
  if (Array.isArray(parsed)) return parsed;
  if (parsed && Array.isArray(parsed.records)) return parsed.records;
  if (parsed && Array.isArray(parsed.mappings)) return parsed.mappings;
  
  throw new Error('LLM output is not a JSON array or recognizable object wrapper');
}

export interface IBatchProcessorService {
  process(
    records: Record<string, any>[],
    mappings: ColumnMapping[],
    batchSize?: number,
    onProgress?: (completed: number, total: number) => void
  ): Promise<BatchResult[]>;

  processStream(
    filePath: string,
    mappings: ColumnMapping[],
    totalRows: number,
    batchSize?: number,
    onProgress?: (processedRows: number, totalRows: number, completedBatches: number, failedBatches: number) => void
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
    
    // Concurrency Limit: Process at most 1 batch in parallel at any one time.
    // This staggers requests and prevents exceeding Groq free tier TPM rate limit spikes.
    const concurrency = 1;
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

          // Call LLM within Retry execution wrapper (Restored AI logic)
          const rawJsonResult = await this.retryService.execute(async () => {
            logger.info({ batchIndex: batch.index }, 'LLM Extraction Request');
            return await this.extractionService.extract(prompt);
          });

          const extracted = cleanAndParseJsonArray(rawJsonResult);

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

  async processStream(
    filePath: string,
    mappings: ColumnMapping[],
    totalRows: number,
    batchSize = env.DEFAULT_BATCH_SIZE || 100,
    onProgress?: (processedRows: number, totalRows: number, completedBatches: number, failedBatches: number) => void
  ): Promise<BatchResult[]> {
    return new Promise((resolve, reject) => {
      const results: BatchResult[] = [];
      const concurrency = env.CONCURRENCY_LIMIT || 1;
      let completedBatches = 0;
      let failedBatches = 0;
      let processedRowsCount = 0;
      let batchIndex = 0;
      let currentRows: any[] = [];
      let fileEnded = false;
      let activePromises: Promise<any>[] = [];

      const stream = fs.createReadStream(filePath, { encoding: 'utf8' });
      const parseStream = Papa.parse(Papa.NODE_STREAM_INPUT, {
        header: true,
        skipEmptyLines: 'greedy',
      });

      const preprocessingService = new PreprocessingService();
      const crmTransformer = new CrmTransformationService();

      const processBatchPromise = async (batchIdx: number, rows: any[], startIndex: number) => {
        let succeeded: any[] = [];
        const failed: any[] = [];

        try {
          // Preprocess rows in the batch first
          const cleanedRows = await preprocessingService.preprocess(rows);

          if (cleanedRows.length > 0) {
            const prompt = this.promptBuilder.buildExtractionPrompt(
              { index: batchIdx, rows: cleanedRows },
              mappings
            );

            logger.info({ batchIndex: batchIdx, rowsCount: cleanedRows.length }, 'Stream Batch Started');

            // Call LLM within Retry execution wrapper (Restored AI logic)
            const rawJsonResult = await this.retryService.execute(async () => {
              logger.info({ batchIndex: batchIdx }, 'Stream LLM Extraction Request');
              return await this.extractionService.extract(prompt);
            });

            const extracted = cleanAndParseJsonArray(rawJsonResult);

            // Normalize
            const normalized = await crmTransformer.transform(extracted);

            // Validate
            const validation = validateExtractionResponse(normalized, startIndex);
            succeeded = validation.validRecords;

            validation.skippedRecords.forEach((s) => {
              failed.push({
                rowIndex: s.rowIndex,
                message: s.reason,
              });
            });
          }
        } catch (error: any) {
          logger.error(
            { err: error.message, batchIndex: batchIdx },
            'Stream Batch Completed with failure'
          );

          // Fail-tolerance: register failed rows as skipped entries
          rows.forEach((_, idx) => {
            failed.push({
              rowIndex: startIndex + idx,
              message: `Batch processing failed: ${error.message}`,
            });
          });
        }

        results.push({
          index: batchIdx,
          succeeded,
          failed,
        });

        completedBatches++;
        if (succeeded.length === 0 && failed.length > 0) {
          failedBatches++;
        }
        processedRowsCount += rows.length;

        if (onProgress) {
          onProgress(processedRowsCount, totalRows, completedBatches, failedBatches);
        }
      };

      const checkIfFinished = () => {
        if (fileEnded && activePromises.length === 0) {
          results.sort((a, b) => a.index - b.index);
          resolve(results);
        }
      };

      parseStream.on('data', (row) => {
        currentRows.push(row);
        if (currentRows.length >= batchSize) {
          const batchToProcess = [...currentRows];
          const idx = batchIndex++;
          const startIdx = idx * batchSize;
          currentRows = [];

          const p = processBatchPromise(idx, batchToProcess, startIdx).then(() => {
            activePromises = activePromises.filter((item) => item !== p);
            if (activePromises.length < concurrency && !fileEnded) {
              stream.resume();
            }
            checkIfFinished();
          }).catch((_err) => {
            activePromises = activePromises.filter((item) => item !== p);
            checkIfFinished();
          });

          activePromises.push(p);
          if (activePromises.length >= concurrency) {
            stream.pause();
          }
        }
      });

      parseStream.on('end', () => {
        fileEnded = true;
        if (currentRows.length > 0) {
          const batchToProcess = [...currentRows];
          const idx = batchIndex++;
          const startIdx = idx * batchSize;
          currentRows = [];

          const p = processBatchPromise(idx, batchToProcess, startIdx).then(() => {
            activePromises = activePromises.filter((item) => item !== p);
            checkIfFinished();
          }).catch((_err) => {
            activePromises = activePromises.filter((item) => item !== p);
            checkIfFinished();
          });
          activePromises.push(p);
        }
        checkIfFinished();
      });

      parseStream.on('error', (err) => {
        stream.destroy();
        reject(err);
      });

      stream.pipe(parseStream);
    });
  }
}
