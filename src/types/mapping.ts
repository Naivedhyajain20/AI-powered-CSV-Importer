export interface ColumnMapping {
  sourceHeader: string;
  targetField: string | null;
}

export interface ColumnMappingResult extends ColumnMapping {
  confidence: number;
  source: 'Heuristic' | 'Gemini';
}

export interface MappingConfig {
  jobId: string;
  mappings: ColumnMapping[];
}
