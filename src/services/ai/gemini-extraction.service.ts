export interface IGeminiExtractionService {
  extract(prompt: string): Promise<string>;
}

export class GeminiExtractionService implements IGeminiExtractionService {
  async extract(_prompt: string): Promise<string> {
    // Boilerplate skeleton for Gemini extraction service (temperature = 0 setup)
    return '{}';
  }
}
