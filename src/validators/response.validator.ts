import { z } from 'zod';

export const geminiRowExtractionSchema = z.object({
  extractedData: z.array(z.record(z.any())),
  errors: z.array(
    z.object({
      rowIndex: z.number(),
      field: z.string().optional(),
      value: z.any().optional(),
      message: z.string(),
    })
  ).default([]),
});
