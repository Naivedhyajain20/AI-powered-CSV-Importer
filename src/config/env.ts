import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ override: true });

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  GEMINI_API_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
  LOG_LEVEL: z.string().default('info'),
  MAX_FILE_SIZE_MB: z.coerce.number().default(10),
  DEFAULT_BATCH_SIZE: z.coerce.number().default(50),
  CONCURRENCY_LIMIT: z.coerce.number().default(3),
});

export const env = envSchema.parse(process.env);
