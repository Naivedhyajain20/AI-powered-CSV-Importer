import pino from 'pino';
import { ColumnMappingResult } from '../../types/mapping';
import { TARGET_CRM_FIELDS, SYNONYM_DICTIONARY } from '../../config/header-synonyms';
import { IPromptBuilderService } from '../ai/prompt-builder.service';
import { IGeminiExtractionService } from '../ai/gemini-extraction.service';

const logger = pino();

export interface IAiMappingService {
  detectMappings(
    headers: string[],
    sampleRows: Record<string, any>[]
  ): Promise<ColumnMappingResult[]>;
}

export class AiMappingService implements IAiMappingService {
  constructor(
    private promptBuilder: IPromptBuilderService,
    private geminiService: IGeminiExtractionService
  ) {}

  private normalize(str: string): string {
    return str.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
  }

  private getLevenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }

  async detectMappings(
    headers: string[],
    sampleRows: Record<string, any>[]
  ): Promise<ColumnMappingResult[]> {
    const results: ColumnMappingResult[] = [];
    const lowConfidenceHeaders: string[] = [];

    for (const rawHeader of headers) {
      const normalizedHeader = this.normalize(rawHeader);
      let bestMatch: { targetField: string | null; confidence: number } = {
        targetField: null,
        confidence: 0,
      };

      // Match against CRM Fields
      for (const field of TARGET_CRM_FIELDS) {
        const normalizedField = this.normalize(field);
        let score = 0;

        if (normalizedHeader === normalizedField) {
          score = 1.0;
        } else if (normalizedHeader.startsWith(normalizedField)) {
          score = 0.90;
        } else if (normalizedHeader.endsWith(normalizedField)) {
          score = 0.88;
        } else if (
          normalizedHeader.includes(normalizedField) ||
          normalizedField.includes(normalizedHeader)
        ) {
          score = 0.75;
        } else if (this.getLevenshteinDistance(normalizedHeader, normalizedField) <= 2) {
          score = 0.70;
        }

        if (score > bestMatch.confidence) {
          bestMatch = { targetField: field, confidence: score };
        }
      }

      // Match against Synonym Dictionary
      for (const [field, synonyms] of Object.entries(SYNONYM_DICTIONARY)) {
        for (const synonym of synonyms) {
          const normalizedSyn = this.normalize(synonym);
          let score = 0;

          if (normalizedHeader === normalizedSyn) {
            score = 0.98;
          } else if (normalizedHeader.startsWith(normalizedSyn)) {
            score = 0.90;
          } else if (normalizedHeader.endsWith(normalizedSyn)) {
            score = 0.88;
          } else if (
            normalizedHeader.includes(normalizedSyn) ||
            normalizedSyn.includes(normalizedHeader)
          ) {
            score = 0.75;
          } else if (this.getLevenshteinDistance(normalizedHeader, normalizedSyn) <= 2) {
            score = 0.70;
          }

          if (score > bestMatch.confidence) {
            bestMatch = { targetField: field, confidence: score };
          }
        }
      }

      // Check threshold
      if (bestMatch.confidence >= 0.95) {
        results.push({
          sourceHeader: rawHeader,
          targetField: bestMatch.targetField,
          confidence: bestMatch.confidence,
          source: 'Heuristic',
        });
      } else {
        lowConfidenceHeaders.push(rawHeader);
      }
    }

    // Call Gemini for low confidence headers
    if (lowConfidenceHeaders.length > 0) {
      try {
        const prompt = this.promptBuilder.buildMappingPrompt(lowConfidenceHeaders, sampleRows);
        const rawGeminiResponse = await this.geminiService.extract(prompt);
        const parsedMappings = JSON.parse(rawGeminiResponse);

        if (Array.isArray(parsedMappings)) {
          for (const m of parsedMappings) {
            if (lowConfidenceHeaders.includes(m.sourceHeader)) {
              results.push({
                sourceHeader: m.sourceHeader,
                targetField: m.targetField,
                confidence: m.confidence ?? 0.5,
                source: 'Gemini',
              });
            }
          }
        }
      } catch (error: any) {
        logger.error(
          { err: error.message, stack: error.stack },
          'Gemini mapping extraction failed, defaulting to null'
        );

        for (const h of lowConfidenceHeaders) {
          results.push({
            sourceHeader: h,
            targetField: null,
            confidence: 0,
            source: 'Gemini',
            reason: 'Gemini service error, mapping defaulted to null',
          });
        }
      }
    }

    // Ensure all headers have a returned mapping entry
    const mappedHeaders = results.map((r) => r.sourceHeader);
    for (const h of headers) {
      if (!mappedHeaders.includes(h)) {
        results.push({
          sourceHeader: h,
          targetField: null,
          confidence: 0,
          source: 'Heuristic',
        });
      }
    }

    return results;
  }
}
