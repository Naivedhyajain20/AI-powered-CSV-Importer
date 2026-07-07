import { Request, Response, NextFunction } from 'express';
import { ISchemaValidationService } from '../services/mapping/schema-validation.service';
import { IBatchProcessorService } from '../services/import/batch-processor.service';
import { ICrmTransformationService } from '../services/import/crm-transformation.service';
import { ISummaryBuilderService } from '../services/import/summary-builder.service';
import { ApiResponse } from '../types/api';

export class ImportController {
  constructor(
    private schemaValidation: ISchemaValidationService,
    private batchProcessor: IBatchProcessorService,
    private crmTransformation: ICrmTransformationService,
    private summaryBuilder: ISummaryBuilderService
  ) {}

  import = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { jobId, mappings } = req.body;

      // 1. Validate incoming mappings structure & schema requirements
      const schemaCheck = await this.schemaValidation.validate({ jobId, mappings });
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

      // 2. Mock records acquisition (normally fetched from storage/DB via jobId)
      const mockRecords: Record<string, any>[] = [];

      // 3. Batch processing (runs prompt builder, gemini extraction, retry, zod validation)
      const batchResults = await this.batchProcessor.process(mockRecords, mappings);

      // 4. CRM Ingestion/Transformation
      const crmPayload = await this.crmTransformation.transform(
        batchResults.flatMap((r) => r.succeeded)
      );

      // 5. Build summary
      const response = this.summaryBuilder.build(batchResults);
      response.records = crmPayload;
      response.metadata = { jobId, durationMs: 0 };

      res.status(200).json(response);
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

      const response: ApiResponse = {
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
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
