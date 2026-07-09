import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { CONSTANTS } from '../config/constants';
import { ApiResponse } from '../types/api';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (_req, _file, cb) => {
    const uploadId = crypto.randomUUID();
    cb(null, `${uploadId}.csv`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: CONSTANTS.MAX_FILE_SIZE_BYTES,
  },
  fileFilter: (_req, file, cb) => {
    const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
    const isCsvExtension = fileExtension === 'csv';
    const isAllowedMimeType = CONSTANTS.ALLOWED_MIME_TYPES.includes(file.mimetype);

    if (isCsvExtension || isAllowedMimeType) {
      cb(null, true);
    } else {
      cb(new Error('INVALID_FILE_TYPE'));
    }
  },
}).single('file');

export const uploadMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  upload(req, res, (err) => {
    if (err) {
      const isMimeError = err.message === 'INVALID_FILE_TYPE';
      const statusCode = isMimeError ? 415 : 413;
      const errCode = isMimeError ? 'INVALID_FILE_TYPE' : 'FILE_TOO_LARGE';
      const errMessage = isMimeError
        ? `Invalid file type. Supported types: ${CONSTANTS.ALLOWED_MIME_TYPES.join(', ')}`
        : `File size exceeds the limit of ${CONSTANTS.MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB`;

      const response: ApiResponse = {
        success: false,
        error: {
          code: errCode,
          message: errMessage,
        },
      };

      res.status(statusCode).json(response);
      return;
    }

    if (!req.file) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'MISSING_FILE',
          message: "Request must include a CSV file under the field key 'file'",
        },
      };
      res.status(400).json(response);
      return;
    }

    next();
  });
};
