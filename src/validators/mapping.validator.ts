import { z } from 'zod';
import { ColumnMappingResult } from '../types/mapping';
import { TARGET_CRM_FIELDS, TargetCrmField } from '../config/header-synonyms';

export const columnMappingSchema = z.object({
  sourceHeader: z.string().min(1, 'Source header is required'),
  targetField: z.string().nullable(),
});

export const mappingConfigSchema = z.object({
  jobId: z.string().uuid('Invalid jobId format'),
  mappings: z.array(columnMappingSchema).min(1, 'At least one mapping is required'),
});

export const columnMappingResultSchema = z.object({
  sourceHeader: z.string().min(1, 'Source header is required'),
  targetField: z.string().nullable(),
  confidence: z.number().min(0).max(1),
  source: z.enum(['Heuristic', 'Gemini']),
  reason: z.string().optional(),
});

export const validateMappings = (
  mappings: ColumnMappingResult[]
): ColumnMappingResult[] => {
  // 1. Zod validation
  const parsed = mappings.map((m) => {
    const res = columnMappingResultSchema.safeParse(m);
    if (!res.success) {
      return {
        sourceHeader: m.sourceHeader || 'Unknown',
        targetField: null,
        confidence: 0,
        source: 'Heuristic' as const,
        reason: 'Invalid mapping object structure',
      };
    }
    return res.data;
  });

  // 2. Filter out invalid CRM fields (setting them to null)
  const crmFieldCleaned = parsed.map((m) => {
    if (
      m.targetField !== null &&
      !TARGET_CRM_FIELDS.includes(m.targetField as TargetCrmField)
    ) {
      return {
        ...m,
        targetField: null,
      };
    }
    return m as ColumnMappingResult;
  });

  // 3. Resolve duplicate mappings
  const targetFieldMaxMap = new Map<
    string,
    { index: number; confidence: number }
  >();

  // Determine the highest confidence index for each non-null targetField
  crmFieldCleaned.forEach((m, idx) => {
    if (m.targetField === null) return;
    const existing = targetFieldMaxMap.get(m.targetField);
    if (!existing || m.confidence > existing.confidence) {
      targetFieldMaxMap.set(m.targetField, { index: idx, confidence: m.confidence });
    }
  });

  // Flag duplicates by setting lower confidence entries to null targetField
  return crmFieldCleaned.map((m, idx) => {
    if (m.targetField === null) return m;
    const maxInfo = targetFieldMaxMap.get(m.targetField);
    if (maxInfo && maxInfo.index !== idx) {
      return {
        ...m,
        targetField: null,
        reason: 'Duplicate mapping',
      };
    }
    return m;
  });
};
