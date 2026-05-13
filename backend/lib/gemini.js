import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(import.meta.dirname, '../../.env') });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Model Gemini yang digunakan.
 * - gemini-3-flash-preview:    model terbaru, lebih cepat & hemat
 * - gemini-2.0-flash-lite:    1500 req/hari, 30 req/menit
 * - gemini-1.5-flash:         1500 req/hari, 15 req/menit
 */
export const model = genAI.getGenerativeModel({
  model: 'gemini-3-flash-preview'
});
