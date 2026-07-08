import { z } from 'zod';

export const crmRecordSchema = z.object({
  name: z.string().nullable().optional().or(z.literal('')),
  email: z.string().email('Invalid email format').nullable().or(z.literal('')),
  country_code: z.string().nullable().optional(),
  mobile_without_country_code: z.string().nullable().optional(),
  company: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  lead_owner: z.string().nullable().optional(),
  crm_status: z.enum(['GOOD_LEAD_FOLLOW_UP', 'DID_NOT_CONNECT', 'BAD_LEAD', 'SALE_DONE']).default('GOOD_LEAD_FOLLOW_UP'),
  crm_note: z.string().nullable().optional(),
  data_source: z.enum(['leads_on_demand', 'meridian_tower', 'eden_park', 'varah_swamy', 'sarjapur_plots']).nullable().optional().or(z.literal('')),
  possession_time: z.string().nullable().optional(),
  created_at: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
});

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

export interface ValidationResult {
  validRecords: any[];
  skippedRecords: Array<{
    rowIndex: number;
    record: any;
    reason: string;
  }>;
}

export const validateExtractionResponse = (
  extractedData: any[],
  startIndex: number
): ValidationResult => {
  const validRecords: any[] = [];
  const skippedRecords: Array<{ rowIndex: number; record: any; reason: string }> = [];

  extractedData.forEach((record, index) => {
    const rowIndex = startIndex + index;

    // 1. Validate against Zod schema
    const parsed = crmRecordSchema.safeParse(record);
    if (!parsed.success) {
      skippedRecords.push({
        rowIndex,
        record,
        reason: `Validation failed: ${parsed.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')}`,
      });
      return;
    }

    const data = parsed.data;

    // 2. Mandatory Skip Rule: BOTH email and mobile are missing
    const hasEmail = data.email && data.email.trim() !== '';
    const hasMobile =
      data.mobile_without_country_code && data.mobile_without_country_code.trim() !== '';

    if (!hasEmail && !hasMobile) {
      skippedRecords.push({
        rowIndex,
        record,
        reason: 'Skipped: Both email and mobile contact fields are missing',
      });
      return;
    }

    validRecords.push(data);
  });

  return { validRecords, skippedRecords };
};
