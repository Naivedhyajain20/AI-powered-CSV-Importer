export interface ICrmTransformationService {
  transform(validatedRecords: Record<string, any>[]): Promise<any[]>;
}

export class CrmTransformationService implements ICrmTransformationService {
  async transform(_validatedRecords: Record<string, any>[]): Promise<any[]> {
    // Boilerplate skeleton for CRM payload transformation
    return [];
  }
}
