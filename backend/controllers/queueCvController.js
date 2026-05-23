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

    // 1. Simpan ke trn_job_application (dengan job_id baru)
    const { data: application, error: appError } = await supabase
      .from('trn_job_application')
      .insert({
        file_name: cvFile.originalname,
        cv_text: truncatedText,
        pdf_base64: pdfBase64,
        job_id: jobId, // Sekarang job_id ada di sini
      })
      .select()
      .single();

    if (appError) throw appError;

    // 2. Buat record di trn_applicant_analysis
    const { data: analysis, error: analError } = await supabase
      .from('trn_applicant_analysis')
      .insert({
        job_application_id: application.id, // Relasi ke aplikasi
        status: 'pending',
      })
      .select()
      .single();

    if (analError) throw analError;

    return res.status(201).json({ success: true, analysisId: analysis.id, applicationId: application.id });

  } catch (err) {
    console.error('queue-cv error:', err);
    return res.status(500).json({ error: err.message });
  }
}
