import { genAI, GEMINI_MODEL } from '../../config/gemini';
import { env } from '../../config/env';
import pino from 'pino';

const logger = pino();

export interface IGeminiExtractionService {
  extract(prompt: string): Promise<string>;
}

export class GeminiExtractionService implements IGeminiExtractionService {
  async extract(prompt: string): Promise<string> {
    const timeoutMs = 90000;
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('LLM_API_TIMEOUT')), timeoutMs)
    );

    const callPromise = (async () => {
      logger.info('Routing LLM extraction to Groq API (Llama 3.1 8B)');
      
      if (!env.GROQ_API_KEY) {
        throw new Error('GROQ_API_KEY is not defined in environment variables');
      }

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'user', content: prompt }
          ],
          temperature: 0,
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq API Error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content.trim();
    })();

    return Promise.race([callPromise, timeoutPromise]);
  }
}
