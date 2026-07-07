import { ColumnMappingResult } from '../../types/mapping';

export interface IAiMappingService {
  detectMappings(
    headers: string[],
    sampleRows: Record<string, any>[]
  ): Promise<ColumnMappingResult[]>;
}

export class AiMappingService implements IAiMappingService {
  async detectMappings(
    _headers: string[],
    _sampleRows: Record<string, any>[]
  ): Promise<ColumnMappingResult[]> {
    // Boilerplate skeleton for AI Header Mapping Service (with heuristics check)
    return [];
  }
}
