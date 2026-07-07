import { Request, Response, NextFunction } from 'express';
import pino from 'pino';
import { ApiResponse } from '../types/api';

const logger = pino();

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error({ err, path: req.path }, 'Unhandled exception caught by middleware');

  const response: ApiResponse = {
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred.',
      details: err.details || undefined,
    },
  };

  res.status(err.status || 500).json(response);
};
