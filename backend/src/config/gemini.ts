import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from './env';

export const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY || 'PLACEHOLDER_KEY');

export const GEMINI_MODEL = 'gemini-2.5-flash';
