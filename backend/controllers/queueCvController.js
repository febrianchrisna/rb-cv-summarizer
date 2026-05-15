import { supabase } from '../config/supabase.js';
import { extractTextFromPdf } from '../lib/parsePdf.js';

/**
 * POST /api/queue-cv
 * Menerima file PDF + parameter job, ekstrak teks, simpan ke Supabase sebagai 'pending'.
 * Menggunakan multer (req.file) untuk file upload.
 */
export async function queueCv(req, res) {
  try {
    const cvFile = req.file;
    const jobId = req.body.job_id;

    if (!cvFile) {
      return res.status(400).json({ error: 'File CV tidak ditemukan' });
    }
    if (!jobId) {
      return res.status(400).json({ error: 'job_id wajib diisi' });
    }

    const buffer = cvFile.buffer;
    const cvText = await extractTextFromPdf(buffer);

    // Batasi teks ke 8000 karakter
    const truncatedText = cvText ? cvText.slice(0, 8000) : '';

    // Jika text extraction gagal, simpan base64
    const pdfBase64 = (!truncatedText || truncatedText.length === 0)
      ? buffer.toString('base64')
      : null;

    // 1. Simpan ke mst_candidate
    const { data: candidate, error: candError } = await supabase
      .from('mst_candidate')
      .insert({
        file_name: cvFile.originalname,
        cv_text: truncatedText,
        pdf_base64: pdfBase64,
      })
      .select()
      .single();

    if (candError) throw candError;

    // 2. Buat record di trx_candidate_analysis
    const { data: analysis, error: analError } = await supabase
      .from('trx_candidate_analysis')
      .insert({
        job_id: jobId,
        candidate_id: candidate.id,
        status: 'pending',
      })
      .select()
      .single();

    if (analError) throw analError;

    return res.status(201).json({ success: true, analysisId: analysis.id, candidateId: candidate.id });

  } catch (err) {
    console.error('queue-cv error:', err);
    return res.status(500).json({ error: err.message });
  }
}
