import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import readline from 'readline';
import pino from 'pino';
import { env } from '../config/env';
import { ISchemaValidationService } from '../services/mapping/schema-validation.service';
import { IBatchProcessorService } from '../services/import/batch-processor.service';
import { ICrmTransformationService } from '../services/import/crm-transformation.service';
import { ISummaryBuilderService } from '../services/import/summary-builder.service';
import { IRetryService } from '../services/ai/retry.service';

const logger = pino();

async function countRows(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    let count = 0;
    const rl = readline.createInterface({
      input: fs.createReadStream(filePath),
      crlfDelay: Infinity,
    });

    rl.on('line', () => {
      count++;
    });

    rl.on('close', () => {
      resolve(Math.max(0, count - 1));
    });

    rl.on('error', (err) => {
      reject(err);
    });
  });
}

interface JobStatus {
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  progress: {
    percentage: number;
    totalBatches: number;
    completedBatches: number;
    failedBatches: number;
  };
  result?: any;
  error?: string;
}

// In-memory job state store
const jobStore: Record<string, JobStatus> = {};

export class ImportController {
  constructor(
    private schemaValidation: ISchemaValidationService,
    private batchProcessor: IBatchProcessorService,
    private _crmTransformation: ICrmTransformationService,
    private summaryBuilder: ISummaryBuilderService,
    private retryService: IRetryService
  ) {}

  import = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { uploadId, jobId, mappings, records, totalRows } = req.body;
      const targetJobId = uploadId || jobId || `job_${Date.now()}`;
      const filePath = path.join(process.cwd(), 'uploads', `${uploadId}.csv`);

      const hasMemoryRecords = records && Array.isArray(records) && records.length > 0;
      const hasDiskFile = fs.existsSync(filePath);

      if (!hasMemoryRecords && !hasDiskFile) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_RECORDS',
            message: 'No CSV records or valid uploadId provided for import processing',
          },
        });
        return;
      }

      // 1. Validate incoming mappings structure
      const schemaCheck = await this.schemaValidation.validate({ jobId: targetJobId, mappings });
      if (!schemaCheck.valid) {
        res.status(400).json({
          success: false,
          error: {
            code: 'SCHEMA_VALIDATION_FAILED',
            message: 'Invalid mappings configuration',
            details: schemaCheck.errors.map((err) => ({ field: 'mappings', issue: err })),
          },
        });
        return;
      }

      let calculatedTotalRows = totalRows || 0;
      if (!hasMemoryRecords && hasDiskFile && !calculatedTotalRows) {
        calculatedTotalRows = await countRows(filePath);
      }

      const batchSize = env.DEFAULT_BATCH_SIZE; // Controlled via .env for rate limit optimization
      const totalBatchesEstimate = hasMemoryRecords
        ? Math.ceil(records.length / batchSize)
        : Math.ceil(calculatedTotalRows / batchSize);

      // Initialize the background job
      jobStore[targetJobId] = {
        status: 'PROCESSING',
        progress: {
          percentage: 0,
          totalBatches: totalBatchesEstimate,
          completedBatches: 0,
          failedBatches: 0,
        },
      };

      // 2. Trigger asynchronous background processing (without awaiting)
      const startTime = Date.now();

      // Run task in background
      (async () => {
        try {
          this.retryService.resetRetryCount();

          let batchResults;
          if (hasMemoryRecords) {
            batchResults = await this.batchProcessor.process(
              records,
              mappings,
              batchSize,
              (completed, total) => {
                const percentage = Math.round((completed / total) * 100);
                jobStore[targetJobId].progress = {
                  percentage,
                  totalBatches: total,
                  completedBatches: completed,
                  failedBatches: 0,
                };
                logger.info({ jobId: targetJobId, progress: percentage }, 'Job Progress Updated');
              }
            );
          } else {
            batchResults = await this.batchProcessor.processStream(
              filePath,
              mappings,
              calculatedTotalRows,
              batchSize,
              (processedRows, totalRowsCount, completed, failed) => {
                const total = Math.ceil(totalRowsCount / batchSize) || 1;
                const percentage = Math.round((completed / total) * 100);
                jobStore[targetJobId].progress = {
                  percentage: Math.min(100, percentage),
                  totalBatches: total,
                  completedBatches: completed,
                  failedBatches: failed,
                };
                logger.info({ jobId: targetJobId, progress: percentage }, 'Stream Job Progress Updated');
              }
            );
          }

          const processingTimeMs = Date.now() - startTime;
          const retryCount = this.retryService.getRetryCount();
          const totalGeminiCalls = batchResults.length + retryCount;

          // Build execution summary
          const summaryResult = await this.summaryBuilder.build(
            batchResults,
            processingTimeMs,
            retryCount,
            totalGeminiCalls
          );

          logger.info({ jobId: targetJobId, durationMs: processingTimeMs }, 'Summary Generated');

          // Mark job as completed
          jobStore[targetJobId].status = 'COMPLETED';
          jobStore[targetJobId].progress.percentage = 100;
          jobStore[targetJobId].result = summaryResult;
        } catch (error: any) {
          logger.error({ jobId: targetJobId, err: error.message }, 'Background Job Failed');
          jobStore[targetJobId].status = 'FAILED';
          jobStore[targetJobId].error = error.message;
        } finally {
          // Cleanup disk file
          if (fs.existsSync(filePath)) {
            try {
              fs.unlinkSync(filePath);
              logger.info({ filePath }, 'Temporary CSV file deleted');
            } catch (err: any) {
              logger.error({ filePath, err: err.message }, 'Failed to delete temporary CSV file');
            }
          }
        }
      })();

      // Respond immediately with the job credentials
      res.status(202).json({
        success: true,
        metadata: {
          jobId: targetJobId,
          status: 'PROCESSING',
          progress: {
            percentage: 0,
            totalBatches: totalBatchesEstimate,
            completedBatches: 0,
            failedBatches: 0,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  status = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { jobId } = req.params;
      const job = jobStore[jobId];

      if (!job) {
        res.status(404).json({
          success: false,
          error: {
            code: 'JOB_NOT_FOUND',
            message: `No active background job found with ID: ${jobId}`,
          },
        });
        return;
      }

      if (job.status === 'COMPLETED') {
        res.status(200).json({
          success: true,
          metadata: {
            jobId,
            status: 'COMPLETED',
            progress: job.progress,
            ...job.result.metadata
          },
          importedRecords: job.result.importedRecords,
          skippedRecords: job.result.skippedRecords,
          failedRecords: job.result.failedRecords,
        });
      } else if (job.status === 'FAILED') {
        res.status(200).json({
          success: false,
          metadata: {
            jobId,
            status: 'FAILED',
            progress: job.progress,
          },
          error: {
            code: 'BACKGROUND_JOB_FAILED',
            message: job.error || 'Unknown error occurred during background batch processing',
          },
        });
      } else {
        res.status(200).json({
          success: true,
          metadata: {
            jobId,
            status: 'PROCESSING',
            progress: job.progress,
          },
        });
      }
    } catch (error) {
      next(error);
    }
  };
}
