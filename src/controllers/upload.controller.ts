import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import pino from 'pino';
import { ICsvParserService } from '../services/csv/csv-parser.service';
import { IPreprocessingService } from '../services/preprocessing/preprocessing.service';
import { ApiResponse } from '../types/api';

const logger = pino();

export class UploadController {
  constructor(
    private csvParser: ICsvParserService,
    private preprocessingService: IPreprocessingService
  ) {}

  upload = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const file = req.file!;

    logger.info(
      { fileName: file.originalname, fileSize: file.size, mimetype: file.mimetype },
      'Upload Started'
    );

    try {
      // 1. Parse CSV
      const rawRecords = await this.csvParser.parse(file.buffer);
      logger.info(
        { rowCount: rawRecords.length },
        'CSV Parsed Successfully'
      );

      // 2. Preprocess Data
      const cleanRecords = await this.preprocessingService.preprocess(rawRecords);
      logger.info(
        { cleanedRowCount: cleanRecords.length },
        'Preprocessing Completed'
      );

      // 3. Extract Metadata
      const headers = cleanRecords.length > 0 ? Object.keys(cleanRecords[0]) : [];
      const totalRows = cleanRecords.length;
      const preview = cleanRecords.slice(0, 10);
      const uploadId = crypto.randomUUID();

      logger.info(
        { uploadId, previewRows: preview.length, totalRows },
        'Preview Generated'
      );

      const response: ApiResponse = {
        success: true,
        uploadId,
        headers,
        preview,
        previewRows: preview.length,
        totalRows,
        metadata: {
          fileName: file.originalname,
          fileSize: file.size,
          detectedColumns: headers.length,
        },
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error(
        { err: error.message, stack: error.stack },
        'Upload Failed'
      );

      // Map custom thrown errors to specific HTTP responses
      if (error.code === 'EMPTY_CSV' || error.code === 'MISSING_HEADERS') {
        res.status(400).json({
          success: false,
          error: { code: error.code, message: error.message },
        });
        return;
      }

      if (error.code === 'MALFORMED_CSV') {
        res.status(422).json({
          success: false,
          error: { code: error.code, message: error.message },
        });
        return;
      }

      next(error);
    }
  };
}
