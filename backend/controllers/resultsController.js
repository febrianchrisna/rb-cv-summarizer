import { supabase } from '../config/supabase.js';

/**
 * GET /api/get-results
 * Query params: job_id
 */
export async function getResults(req, res) {
  try {
    const { job_id } = req.query;

    if (!job_id) {
      return res.status(400).json({ error: 'job_id wajib diisi' });
    }

    const { data, error } = await supabase
      .from('trn_applicant_analysis')
      .select(`
        *,
        application:trn_job_application!inner (
          *,
          job:mst_job_post (*)
        )
      `)
      .eq('application.job_id', job_id)
      .eq('status', 'done')
      .order('score', { ascending: false });

    if (error) throw error;

    // Map data agar formatnya konsisten untuk frontend
    const mappedData = data.map(item => {
      const app = item.application;

      return {
        id: item.id,
        candidate_name: app?.name,
        email: app?.email,
        phone: app?.phone,
        file_name: app?.file_name,
        score: item.score,
        match_level: item.match_level,
        summary: item.summary,
        reasoning: item.reasoning,
        matched_requirements: item.matched_requirements,
        missing_requirements: item.missing_requirements,
        role_name: item.role_name,
        role_scores: item.role_scores,
        status: item.status,
        job_title: app?.job?.title,
        created_at: item.created_at
      };
    });

    return res.json({ success: true, data: mappedData });
  } catch (err) {
    console.error('get-results error:', err);
    return res.status(500).json({ error: err.message });
  }
}
