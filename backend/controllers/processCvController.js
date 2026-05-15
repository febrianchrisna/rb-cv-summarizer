import { model } from '../lib/gemini.js';
import { supabase } from '../config/supabase.js';

/**
 * Panggil Gemini dengan retry + exponential backoff untuk rate limit 429.
 */
async function callGemini(content, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const time = new Date().toLocaleTimeString('id-ID', { hour12: false });
      console.log(`[${time}] \x1b[35m[gemini]\x1b[0m 🚀 Memanggil model (attempt ${attempt}/${maxRetries})...`);
      const startTime = Date.now();
      
      const result = await model.generateContent(content);
      const text = result.response.text();
      
      const duration = Date.now() - startTime;
      console.log(`[${time}] \x1b[35m[gemini]\x1b[0m ✅ Respons diterima dalam ${duration}ms. (${text.length} char)`);
      return text;
    } catch (err) {
      const time = new Date().toLocaleTimeString('id-ID', { hour12: false });
      console.error(`[${time}] \x1b[31m[gemini] ❌ Error (percobaan ${attempt}):\x1b[0m`, err.message);
      
      const is429 = err.status === 429 || String(err.message).includes('429');
      if (is429 && attempt < maxRetries) {
        const retryMatch = String(err.message).match(/retry[^0-9]*(\d+)[^0-9]*s/i);
        const wait = retryMatch ? parseInt(retryMatch[1]) + 5 : 25;
        console.log(`[${time}] \x1b[33m[gemini] ⚠️ Rate limit 429 — tunggu ${wait}s...\x1b[0m`);
        await new Promise(r => setTimeout(r, wait * 1000));
      } else {
        throw err; // Jika max retries habis atau bukan error 429, lempar errornya
      }
    }
  }
}

function parseJSON(text) {
  return JSON.parse(text.replace(/```json|```/gi, '').trim());
}

// ─────────────────────────────────────────────────────────────
// STEP 1 — EXTRACTOR AGENT
// ─────────────────────────────────────────────────────────────
async function extractCandidateProfile(cvText, pdfBase64) {
  const instruction = `Kamu adalah CV Extractor Agent. Tugasmu HANYA mengekstrak informasi faktual dari CV berikut.
Kembalikan HANYA JSON tanpa penjelasan lain:
{
  "candidate_name": "nama lengkap kandidat",
  "email": "email atau null",
  "phone": "nomor telepon atau null",
  "education": "pendidikan tertinggi (gelar, jurusan, institusi)",
  "years_experience": <angka estimasi tahun pengalaman kerja>,
  "top_skills": ["skill 1", "skill 2", ...max 10],
  "work_history": ["Jabatan di Perusahaan (tahun)", ...max 5],
  "languages": ["Bahasa 1", ...],
  "summary": "ringkasan profil 2-3 kalimat"
}`;

  let content;
  if (pdfBase64) {
    content = [
      { inlineData: { mimeType: 'application/pdf', data: pdfBase64 } },
      { text: instruction },
    ];
  } else {
    const truncated = cvText.length > 6000 ? cvText.slice(0, 6000) + '\n...[terpotong]' : cvText;
    content = `${instruction}\n\nISI CV:\n${truncated}`;
  }

  const raw = await callGemini(content);
  return parseJSON(raw);
}

// ─────────────────────────────────────────────────────────────
// STEP 2 — MATCHER AGENT (single-role job)
// ─────────────────────────────────────────────────────────────
async function matchCandidateToJob(profile, parameters) {
  const reqList = parameters.requirements?.length > 0
    ? parameters.requirements.map(r =>
        `- ${r.field}${r.mandatory ? ' [WAJIB]' : ''}: ${r.value}`
      ).join('\n')
    : '- (tidak ada persyaratan spesifik)';

  const prompt = `Kamu adalah Job Matching Agent. Tugasmu mengevaluasi kesesuaian kandidat dengan posisi yang dilamar.

POSISI: ${parameters.positionName || '(tidak ditentukan)'}
DESKRIPSI JOB: ${parameters.jobDescription || '-'}
KUALIFIKASI: ${parameters.qualification || '-'}
PERSYARATAN:
${reqList}

PROFIL KANDIDAT:
- Nama: ${profile.candidate_name}
- Pendidikan: ${profile.education || '-'}
- Pengalaman: ~${profile.years_experience || 0} tahun
- Skill: ${profile.top_skills?.join(', ') || '-'}
- Riwayat: ${profile.work_history?.join(' | ') || '-'}
- Bahasa: ${profile.languages?.join(', ') || '-'}
- Ringkasan: ${profile.summary || '-'}

Berikan penilaian yang OBJEKTIF dan SPESIFIK. Kembalikan HANYA JSON:
{
  "score": <0-100, integer>,
  "match_level": "High|Medium|Low",
  "matched_requirements": ["requirement yang terpenuhi..."],
  "missing_requirements": ["requirement yang tidak terpenuhi..."],
  "reasoning": "penjelasan singkat kenapa skor ini diberikan"
}`;

  const raw = await callGemini(prompt);
  return parseJSON(raw);
}

// ─────────────────────────────────────────────────────────────
// STEP 2B — ROLE ASSIGNMENT AGENT (multi-role job)
// ─────────────────────────────────────────────────────────────
async function fetchExistingByRole(positionName, roles) {
  const { data } = await supabase
    .from('candidates')
    .select('role_name, candidate_name, summary, score')
    .eq('position_name', positionName)
    .eq('status', 'done')
    .not('role_name', 'is', null)
    .order('score', { ascending: false });

  const grouped = {};
  for (const role of roles) {
    const inRole = (data || []).filter(c => c.role_name === role).slice(0, 4);
    grouped[role] = inRole.map(c => `${c.candidate_name || 'N/A'} (skor ${c.score ?? '-'}): ${c.summary || '-'}`);
  }
  return grouped;
}

async function assignMultiRole(profile, parameters, existingByRole) {
  const roles = parameters.roles;

  const roleLines = roles.map(role => {
    const examples = existingByRole[role] || [];
    const exampleText = examples.length > 0
      ? `\n     Kandidat yang sudah di-assign ke role ini:\n     ${examples.map(e => `- ${e}`).join('\n     ')}`
      : '\n     (Belum ada kandidat di role ini)';
    return `• ${role}:${exampleText}`;
  }).join('\n\n');

  const reqList = parameters.requirements?.length > 0
    ? parameters.requirements.map(r =>
        `- ${r.field}${r.mandatory ? ' [WAJIB]' : ''}: ${r.value}`
      ).join('\n')
    : '- (tidak ada persyaratan spesifik)';

  const prompt = `Kamu adalah Role Assignment Agent untuk program "${parameters.positionName}".

DESKRIPSI PROGRAM: ${parameters.jobDescription || '-'}
KUALIFIKASI UMUM: ${parameters.qualification || '-'}
PERSYARATAN:
${reqList}

ROLE YANG TERSEDIA DAN KANDIDAT YANG SUDAH ADA:
${roleLines}

PROFIL KANDIDAT BARU:
- Nama: ${profile.candidate_name}
- Pendidikan: ${profile.education || '-'}
- Pengalaman: ~${profile.years_experience || 0} tahun
- Skill: ${profile.top_skills?.join(', ') || '-'}
- Riwayat Kerja: ${profile.work_history?.join(' | ') || '-'}
- Bahasa: ${profile.languages?.join(', ') || '-'}
- Ringkasan: ${profile.summary || '-'}

TUGAS:
1. Bandingkan profil kandidat baru dengan kandidat yang sudah ada di masing-masing role
2. Nilai kesesuaian kandidat baru dengan SETIAP role (0-100)
3. Tentukan role yang PALING COCOK untuk kandidat ini
4. Skor akhir = skor akumulasi untuk role terpilih (0-100)

Kembalikan HANYA JSON valid:
{
  "role_scores": {${roles.map(r => `"${r}": <skor 0-100>`).join(', ')}},
  "recommended_role": "<salah satu dari: ${roles.join(', ')}>",
  "score": <skor untuk role terpilih, integer 0-100>,
  "match_level": "High|Medium|Low",
  "matched_requirements": ["persyaratan yang terpenuhi..."],
  "missing_requirements": ["persyaratan yang tidak terpenuhi..."],
  "reasoning": "penjelasan mengapa kandidat lebih cocok di role ini dibanding role lain"
}`;

  const raw = await callGemini(prompt);
  const result = parseJSON(raw);

  // Validasi: recommended_role harus salah satu dari roles yang tersedia
  if (!roles.includes(result.recommended_role)) {
    const best = Object.entries(result.role_scores || {})
      .filter(([r]) => roles.includes(r))
      .sort((a, b) => b[1] - a[1])[0];
    result.recommended_role = best ? best[0] : roles[0];
    if (best) result.score = best[1];
  }

  return result;
}

// ─────────────────────────────────────────────────────────────
// MAIN HANDLER
// ─────────────────────────────────────────────────────────────
export async function processCv(req, res) {
  let analysisId = null;

  try {
    analysisId = req.body.analysisId;

    if (!analysisId) {
      return res.status(400).json({ error: 'analysisId wajib diisi' });
    }

    // Ambil data transaksi, data kandidat, dan data job post
    const { data: analysis, error: fetchError } = await supabase
      .from('trx_candidate_analysis')
      .select(`
        *,
        mst_candidate (*),
        mst_job_post (*)
      `)
      .eq('id', analysisId)
      .single();

    if (fetchError) throw fetchError;
    if (!analysis) throw new Error('Data analisis tidak ditemukan');

    const candidate = analysis.mst_candidate;
    const job = analysis.mst_job_post;

    if (!candidate || !job) throw new Error('Data kandidat atau job tidak lengkap');

    const cvText = candidate.cv_text;
    const pdfBase64 = candidate.pdf_base64;

    if (!cvText && !pdfBase64) throw new Error('Data CV tidak ditemukan');

    await supabase.from('trx_candidate_analysis').update({ status: 'processing' }).eq('id', analysisId);

    console.log(`[cv-agent] Mulai analisis transaksi ${analysisId}`);

    // STEP 1: Extractor Agent
    console.log(`[cv-agent] Step 1 — ekstrak profil...`);
    const profile = await extractCandidateProfile(cvText, pdfBase64);
    console.log(`[cv-agent] Step 1 selesai: ${profile.candidate_name}`);

    // Update profil dasar kandidat jika belum ada atau untuk sinkronisasi terbaru
    await supabase.from('mst_candidate').update({
      name: profile.candidate_name,
      email: profile.email,
      phone: profile.phone
    }).eq('id', candidate.id);

    await new Promise(r => setTimeout(r, 1000));

    // STEP 2: Matching / Role Assignment Agent
    const roles = job.position_name ? job.position_name.split(',').map(r => r.trim()).filter(Boolean) : [];
    const isMultiRole = roles.length > 1;
    let match;

    const parameters = {
      positionName: job.position_name || job.title,
      jobDescription: job.description,
      qualification: job.qualification,
      requirements: job.requirements,
      roles: isMultiRole ? roles : undefined
    };

    if (isMultiRole) {
      console.log(`[cv-agent] Step 2 — multi-role assignment (${roles.join(', ')})...`);
      // Kita bisa tambahkan logic fetchExistingByRole di sini jika diperlukan di masa depan
      match = await assignMultiRole(profile, parameters, {});
      console.log(`[cv-agent] Step 2 selesai: role=${match.recommended_role}, skor=${match.score}`);
    } else {
      console.log(`[cv-agent] Step 2 — cocokkan dengan job: ${job.title}`);
      match = await matchCandidateToJob(profile, parameters);
      console.log(`[cv-agent] Step 2 selesai: skor=${match.score}, level=${match.match_level}`);
    }

    const score = Math.max(0, Math.min(100, parseInt(match.score) || 0));
    const finalRoleName = match.recommended_role || null;

    const { error: updateError } = await supabase
      .from('trx_candidate_analysis')
      .update({
        score,
        match_level: match.match_level,
        matched_requirements: match.matched_requirements || [],
        missing_requirements: match.missing_requirements || [],
        reasoning: match.reasoning,
        summary: profile.summary,
        role_name: finalRoleName,
        role_scores: match.role_scores || null,
        status: 'done',
      })
      .eq('id', analysisId);

    if (updateError) throw updateError;

    console.log(`[cv-agent] Analisis selesai untuk transaksi ${analysisId}`);
    return res.json({ success: true, score, match_level: match.match_level });

  } catch (err) {
    console.error('[cv-agent] Error:', err.message);
    if (analysisId) {
      await supabase
        .from('trx_candidate_analysis')
        .update({ status: 'error', error_message: err.message })
        .eq('id', analysisId);
    }
    return res.status(500).json({ error: err.message });
  }
}
