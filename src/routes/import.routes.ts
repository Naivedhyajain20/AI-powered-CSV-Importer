import { Router } from 'express';
import { uploadMiddleware } from '../middlewares/upload.middleware';
import { UploadController } from '../controllers/upload.controller';
import { ImportController } from '../controllers/import.controller';

// Services Instantiations (Dependency Injection Bootstrapping)
import { CsvParserService } from '../services/csv/csv-parser.service';
import { PreprocessingService } from '../services/preprocessing/preprocessing.service';
import { AiMappingService } from '../services/mapping/ai-mapping.service';
import { SchemaValidationService } from '../services/mapping/schema-validation.service';
import { PromptBuilderService } from '../services/ai/prompt-builder.service';
import { GeminiExtractionService } from '../services/ai/gemini-extraction.service';
import { RetryService } from '../services/ai/retry.service';
import { BatchProcessorService } from '../services/import/batch-processor.service';
import { CrmTransformationService } from '../services/import/crm-transformation.service';
import { SummaryBuilderService } from '../services/import/summary-builder.service';

const router = Router();

const csvParser = new CsvParserService();
const preprocessingService = new PreprocessingService();
const aiMappingService = new AiMappingService();
const schemaValidation = new SchemaValidationService();

const promptBuilder = new PromptBuilderService();
const geminiExtraction = new GeminiExtractionService();
const retryService = new RetryService();

const batchProcessor = new BatchProcessorService(promptBuilder, geminiExtraction, retryService);
const crmTransformation = new CrmTransformationService();
const summaryBuilder = new SummaryBuilderService();

const uploadController = new UploadController(
  csvParser,
  preprocessingService,
  aiMappingService
);

const importController = new ImportController(
  schemaValidation,
  batchProcessor,
  crmTransformation,
  summaryBuilder
);

// Endpoints setup
router.post('/upload', uploadMiddleware, uploadController.upload);
router.post('/import', importController.import);
router.get('/status/:jobId', importController.status);

export default router;
