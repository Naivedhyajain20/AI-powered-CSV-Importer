import { z } from 'zod';

export const columnMappingSchema = z.object({
  sourceHeader: z.string().min(1, 'Source header is required'),
  targetField: z.string().nullable(),
});

export const mappingConfigSchema = z.object({
  jobId: z.string().uuid('Invalid jobId format'),
  mappings: z.array(columnMappingSchema).min(1, 'At least one mapping is required'),
});
