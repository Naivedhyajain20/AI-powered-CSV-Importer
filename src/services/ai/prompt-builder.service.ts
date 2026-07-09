import { Batch } from '../../types/batch';
import { ColumnMapping } from '../../types/mapping';
import { TARGET_CRM_FIELDS } from '../../config/header-synonyms';
import { CRM_EXTRACTION_PROMPT_TEMPLATE } from '../../prompts/crm-extraction.prompt';
import { FEW_SHOT_EXAMPLES } from '../../prompts/few-shot.examples';

export interface IPromptBuilderService {
  buildExtractionPrompt(batch: Batch, mappings: ColumnMapping[]): string;
  buildMappingPrompt(headers: string[], sampleRows: Record<string, any>[]): string;
}

export class PromptBuilderService implements IPromptBuilderService {
  buildExtractionPrompt(batch: Batch, mappings: ColumnMapping[]): string {
    // 1. Convert each batch row into structured JSON objects based on the approved mappings
    const mappedRecords = batch.rows.map((row) => {
      const mappedRecord: Record<string, any> = {};
      for (const mapping of mappings) {
        if (mapping.targetField) {
          mappedRecord[mapping.targetField] = row[mapping.sourceHeader] ?? '';
        }
      }
      return mappedRecord;
    });

    // 2. Format inputs into the prompt template
    const recordsJson = JSON.stringify(mappedRecords, null, 2);
    const fewShotsJson = JSON.stringify(FEW_SHOT_EXAMPLES, null, 2);

    return CRM_EXTRACTION_PROMPT_TEMPLATE.replace('{{records}}', recordsJson).replace(
      '{{fewShots}}',
      fewShotsJson
    );
  }

  buildMappingPrompt(headers: string[], sampleRows: Record<string, any>[]): string {
    const limitedSample = sampleRows.slice(0, 5);
    const targetFieldsJson = JSON.stringify(TARGET_CRM_FIELDS);
    const headersJson = JSON.stringify(headers);
    const sampleRowsJson = JSON.stringify(limitedSample, null, 2);

    return `You are a data architect assistant. Your task is to map CSV column headers to the target CRM fields.

Target CRM Fields:
${targetFieldsJson}

CSV Headers to map:
${headersJson}

First 5 sample rows for context:
${sampleRowsJson}

Map each CSV header to the most appropriate target CRM field. If a header cannot be mapped or does not match any CRM field, set targetField to null.
For each mapping, assign a confidence score between 0.00 and 1.00 based on semantic similarity.

Output must be a valid JSON object with a single key "mappings" containing an array of objects conforming to the following type:
{
  "mappings": Array<{
    sourceHeader: string;
    targetField: string | null;
    confidence: number;
  }>
}

Example Output:
{
  "mappings": [
    { "sourceHeader": "First Name", "targetField": "name", "confidence": 0.95 },
    { "sourceHeader": "RandomCol", "targetField": null, "confidence": 0.00 }
  ]
}

CRITICAL CONSTRAINT:
- Return ONLY a valid JSON object.
- Do NOT return markdown formatting, code block fences, or backticks (do NOT wrap with \`\`\`json).
- Do NOT return explanations, headers, comments, or any extra text.
- The response must be directly parseable by JSON.parse().`;
  }
}
