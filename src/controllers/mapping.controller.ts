import { Request, Response, NextFunction } from 'express';
import pino from 'pino';
import { IAiMappingService } from '../services/mapping/ai-mapping.service';
import { validateMappings } from '../validators/mapping.validator';
import { ApiResponse } from '../types/api';

const logger = pino();

export class MappingController {
  constructor(private aiMappingService: IAiMappingService) {}

  mapping = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { uploadId, headers, preview } = req.body;

      if (!headers || !Array.isArray(headers)) {
        res.status(400).json({
          success: false,
          error: { code: 'BAD_REQUEST', message: "Request must include a 'headers' string array" },
        });
        return;
      }

      logger.info({ uploadId, headersCount: headers.length }, 'Header Mapping Requested');

      // 1. Detect Mappings (Heuristics + Gemini Fallback)
      const mappingResults = await this.aiMappingService.detectMappings(
        headers,
        preview || []
      );

      // 2. Validate and Resolve Duplicates
      const headerMappings = validateMappings(mappingResults);

      logger.info({ uploadId, mappedColumns: headerMappings.length }, 'Header Mapping Completed');

      const response: ApiResponse = {
        success: true,
        headerMappings,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
