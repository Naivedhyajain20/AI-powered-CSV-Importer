import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import readline from 'readline';
import Papa from 'papaparse';
import pino from 'pino';
import { ICsvParserService } from '../services/csv/csv-parser.service';
import { IPreprocessingService } from '../services/preprocessing/preprocessing.service';
import { ApiResponse } from '../types/api';

const logger = pino();

async function getCsvPreviewAndHeaders(filePath: string): Promise<{ headers: string[]; preview: any[] }> {
  return new Promise((resolve, reject) => {
    const previewRows: any[] = [];
    let headers: string[] = [];
    const stream = fs.createReadStream(filePath, { encoding: 'utf8' });
    let resolved = false;

    const parseStream = Papa.parse(Papa.NODE_STREAM_INPUT, {
      header: true,
      skipEmptyLines: 'greedy',
    });

    parseStream.on('data', (row) => {
      if (resolved) return;
      if (previewRows.length === 0) {
        headers = Object.keys(row);
      }
      previewRows.push(row);
      if (previewRows.length >= 10) {
        resolved = true;
        stream.destroy();
        resolve({ headers, preview: previewRows });
      }
    });

    parseStream.on('end', () => {
      if (!resolved) {
        resolved = true;
        resolve({ headers, preview: previewRows });
      }
    });

    parseStream.on('error', (err) => {
      if (!resolved) {
        resolved = true;
        reject(err);
      }
    });

    stream.pipe(parseStream);
  });
}

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
      { fileName: file.originalname, fileSize: file.size, mimetype: file.mimetype, path: file.path },
      'Upload Started'
    );

    try {
      const filePath = file.path;
      const uploadId = path.basename(file.filename, '.csv');

      // 1. Parse CSV Preview and headers using stream
      const { headers, preview } = await getCsvPreviewAndHeaders(filePath);
      logger.info(
        { headersCount: headers.length, previewRowsCount: preview.length },
        'CSV Preview Streamed Successfully'
      );

      // 2. Preprocess Preview Data
      const cleanPreview = await this.preprocessingService.preprocess(preview);
      logger.info(
        { cleanedPreviewCount: cleanPreview.length },
        'Preview Preprocessing Completed'
      );

      // 3. Count total rows using fast line-counting stream
      const totalRows = await countRows(filePath);
      logger.info({ totalRows }, 'Total CSV Rows Counted');

      const response: ApiResponse = {
        success: true,
        uploadId,
        headers,
        preview: cleanPreview,
        previewRows: cleanPreview.length,
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
