import { MappingConfig } from '../../types/mapping';

export interface ISchemaValidationService {
  validate(config: MappingConfig): Promise<{ valid: boolean; errors: string[] }>;
}

export class SchemaValidationService implements ISchemaValidationService {
  async validate(_config: MappingConfig): Promise<{ valid: boolean; errors: string[] }> {
    // Boilerplate skeleton for pre-batch schema metadata validation
    return { valid: true, errors: [] };
  }
}
