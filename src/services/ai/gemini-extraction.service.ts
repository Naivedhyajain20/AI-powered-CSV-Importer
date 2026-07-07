import { genAI, GEMINI_MODEL } from '../../config/gemini';

export interface IGeminiExtractionService {
  extract(prompt: string): Promise<string>;
}

export class GeminiExtractionService implements IGeminiExtractionService {
  async extract(prompt: string): Promise<string> {
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: {
        temperature: 0,
        responseMimeType: 'application/json',
      },
    });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    return responseText.trim();
  }
}
