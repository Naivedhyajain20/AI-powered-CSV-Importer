import { Request, Response, NextFunction } from 'express';
import pino from 'pino';
import { ISchemaValidationService } from '../services/mapping/schema-validation.service';
import { IBatchProcessorService } from '../services/import/batch-processor.service';
import { ICrmTransformationService } from '../services/import/crm-transformation.service';
import { ISummaryBuilderService } from '../services/import/summary-builder.service';
import { IRetryService } from '../services/ai/retry.service';

const logger = pino();

export class ImportController {
  constructor(
    private schemaValidation: ISchemaValidationService,
    private batchProcessor: IBatchProcessorService,
    private _crmTransformation: ICrmTransformationService, // transformation runs inside batch processor now to maximize success
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
      const targetJobId = uploadId || jobId;

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

      // 2. Track execution metrics
      const startTime = Date.now();
      this.retryService.resetRetryCount();

      // 3. Batch processing (converts CSV to JSON, executes Gemini call, normalizes, validates)
      const batchResults = await this.batchProcessor.process(records, mappings);

      const processingTimeMs = Date.now() - startTime;
      const retryCount = this.retryService.getRetryCount();
      const totalGeminiCalls = batchResults.length + retryCount;

      // 4. Build rich execution summary
      const summaryResult = await this.summaryBuilder.build(
        batchResults,
        processingTimeMs,
        retryCount,
        totalGeminiCalls
      );

      logger.info({ jobId: targetJobId, durationMs: processingTimeMs }, 'Summary Generated');

      res.status(200).json({
        success: true,
        ...summaryResult,
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

      res.status(200).json({
        success: true,
        metadata: {
          jobId,
          status: 'COMPLETED',
          progress: {
            percentage: 100,
            totalBatches: 0,
            completedBatches: 0,
            failedBatches: 0,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
