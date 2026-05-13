import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import queueCvRoute from './routes/queueCv.js';
import processCvRoute from './routes/processCv.js';
import resultsRoute from './routes/results.js';

dotenv.config({ path: path.resolve(import.meta.dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ──────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// HTTP Request Logger (meniru gaya log Next.js)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const time = new Date().toLocaleTimeString('id-ID', { hour12: false });
    
    // Warnai status code
    let statusStr = res.statusCode;
    if (statusStr >= 500) statusStr = `\x1b[31m${statusStr}\x1b[0m`; // Merah
    else if (statusStr >= 400) statusStr = `\x1b[33m${statusStr}\x1b[0m`; // Kuning
    else if (statusStr >= 300) statusStr = `\x1b[36m${statusStr}\x1b[0m`; // Cyan
    else statusStr = `\x1b[32m${statusStr}\x1b[0m`; // Hijau

    console.log(`[${time}] ${req.method} ${req.originalUrl} ${statusStr} - ${duration}ms`);
  });
  next();
});

// Parse JSON body (untuk /api/process-cv yang kirim JSON)
app.use(express.json());

// ── Routes ──────────────────────────────────────────────────────
app.use(queueCvRoute);    // POST /api/queue-cv
app.use(processCvRoute);  // POST /api/process-cv
app.use(resultsRoute);    // GET  /api/get-results

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'CV Summarizer API running' });
});

// ── Start ───────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
