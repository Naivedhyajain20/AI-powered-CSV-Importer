import { Request, Response, NextFunction } from 'express';
import pino from 'pino';
import { env } from '../config/env';
import { ISchemaValidationService } from '../services/mapping/schema-validation.service';
import { IBatchProcessorService } from '../services/import/batch-processor.service';
import { ICrmTransformationService } from '../services/import/crm-transformation.service';
import { ISummaryBuilderService } from '../services/import/summary-builder.service';
import { IRetryService } from '../services/ai/retry.service';

const logger = pino();

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
      const { uploadId, jobId, mappings, records } = req.body;
      const targetJobId = uploadId || jobId || `job_${Date.now()}`;

      if (!records || !Array.isArray(records) || records.length === 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_RECORDS',
            message: 'No CSV records provided for import processing',
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

      // Initialize the background job
      jobStore[targetJobId] = {
        status: 'PROCESSING',
        progress: {
          percentage: 0,
          totalBatches: 0,
          completedBatches: 0,
          failedBatches: 0,
        },
      };

      // 2. Trigger asynchronous background processing (without awaiting)
      const startTime = Date.now();
      const batchSize = env.DEFAULT_BATCH_SIZE || 10;

      // Run task in background
      (async () => {
        try {
          this.retryService.resetRetryCount();

          const batchResults = await this.batchProcessor.process(
            records,
            mappings,
            batchSize,
            (completed, total) => {
              // Progress callback
              const percentage = Math.round((completed / total) * 100);
              jobStore[targetJobId].progress = {
                percentage,
                totalBatches: total,
                completedBatches: completed,
                failedBatches: 0, // fails are handled gracefully in results
              };
              logger.info({ jobId: targetJobId, progress: percentage }, 'Job Progress Updated');
            }
          );

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
            totalBatches: Math.ceil(records.length / batchSize),
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
          },
          ...job.result,
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
