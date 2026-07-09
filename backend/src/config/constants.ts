import { env } from './env';

export const CONSTANTS = {
  MAX_FILE_SIZE_BYTES: env.MAX_FILE_SIZE_MB * 1024 * 1024,
  DEFAULT_BATCH_SIZE: env.DEFAULT_BATCH_SIZE,
  ALLOWED_MIME_TYPES: ['text/csv', 'application/vnd.ms-excel'],
  HEURISTIC_THRESHOLD: 0.95,
  GEMINI_TEMPERATURE: 0,
  PROMPT_VERSION: '1.0.0',
};
