import { Batch } from '../../types/batch';
import { ColumnMapping } from '../../types/mapping';

export interface IPromptBuilderService {
  buildExtractionPrompt(batch: Batch, mappings: ColumnMapping[]): string;
}

export class PromptBuilderService implements IPromptBuilderService {
  buildExtractionPrompt(_batch: Batch, _mappings: ColumnMapping[]): string {
    // Boilerplate skeleton for prompt builder (incorporating few-shots and CRM limits)
    return '';
  }
}
