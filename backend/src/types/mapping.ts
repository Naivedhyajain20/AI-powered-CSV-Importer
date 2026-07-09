export interface ColumnMapping {
  sourceHeader: string;
  targetField: string | null;
}

export interface ColumnMappingResult extends ColumnMapping {
  confidence: number;
  source: 'Heuristic' | 'Gemini';
  reason?: string;
}

export interface MappingConfig {
  jobId: string;
  mappings: ColumnMapping[];
}
