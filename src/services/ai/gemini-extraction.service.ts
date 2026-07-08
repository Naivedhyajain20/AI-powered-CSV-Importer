import { genAI, GEMINI_MODEL } from '../../config/gemini';
import { env } from '../../config/env';
import pino from 'pino';

const logger = pino();

export interface IGeminiExtractionService {
  extract(prompt: string): Promise<string>;
}

export class GeminiExtractionService implements IGeminiExtractionService {
  async extract(prompt: string): Promise<string> {
    const timeoutMs = 45000;
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('LLM_API_TIMEOUT')), timeoutMs)
    );

    const callPromise = (async () => {
      if (env.GROQ_API_KEY) {
        logger.info('Routing LLM extraction to Groq Cloud API');
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${env.GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              {
                role: 'user',
                content: prompt,
              },
            ],
            temperature: 0,
          }),
        });

        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body?.error?.message || `Groq API failed with status ${response.status}`);
        }

        const data = await response.json();
        const content = data?.choices?.[0]?.message?.content;
        if (!content) {
          throw new Error('Groq API returned an empty completion response');
        }
        return content.trim();
      } else {
        logger.info('Routing LLM extraction to Gemini API');
        const model = genAI.getGenerativeModel({
          model: GEMINI_MODEL,
          generationConfig: {
            temperature: 0,
            topP: 0,
            topK: 1,
            responseMimeType: 'application/json',
          },
        });
        const result = await model.generateContent(prompt);
        return result.response.text().trim();
      }
    })();

    return Promise.race([callPromise, timeoutPromise]);
  }
}
