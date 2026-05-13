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
    const parameters = JSON.parse(req.body.parameters);
    let sessionId = req.body.session_id || null;
    const jobId = req.body.job_id || null;

    if (!cvFile) {
      return res.status(400).json({ error: 'File CV tidak ditemukan' });
    }

    const buffer = cvFile.buffer;
    const cvText = await extractTextFromPdf(buffer);

    // Batasi teks ke 8000 karakter untuk hemat token & storage
    const truncatedText = cvText ? cvText.slice(0, 8000) : '';

    // Jika text extraction gagal (PDF scan/gambar), simpan base64 untuk Gemini multimodal
    const pdfBase64 = (!truncatedText || truncatedText.length === 0)
      ? buffer.toString('base64')
      : null;

    // Pastikan session ada di tabel sessions sebelum insert candidate
    if (sessionId) {
      const { error: sessionError } = await supabase
        .from('sessions')
        .upsert(
          { id: sessionId, positions: [parameters] },
          { onConflict: 'id', ignoreDuplicates: true }
        );

      if (sessionError) {
        console.error('session upsert error:', sessionError);
        sessionId = null;
      }
    }

    const { data, error } = await supabase
      .from('candidates')
      .insert({
        file_name: cvFile.originalname,
        position_name: parameters.positionName,
        role_name: parameters.roleName || null,
        job_id: jobId,
        session_id: sessionId,
        parameters: { ...parameters, cvText: truncatedText, pdfBase64: pdfBase64 || null },
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({ success: true, id: data.id });

  } catch (err) {
    console.error('queue-cv error:', err);
    return res.status(500).json({ error: err.message });
  }
}
