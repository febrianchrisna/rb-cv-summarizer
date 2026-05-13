import { supabase } from '../config/supabase.js';

/**
 * GET /api/get-results
 * Query params: job_id | session_id | position | role
 * Prioritas: job_id → session_id → position (fallback legacy)
 */
export async function getResults(req, res) {
  try {
    const { job_id, session_id, position, role } = req.query;

    // Prioritas 1: Filter berdasarkan job_id (isolasi per Job Listing)
    if (job_id) {
      let q = supabase
        .from('candidates')
        .select('*')
        .eq('status', 'done')
        .eq('job_id', job_id)
        .order('score', { ascending: false });

      if (role) q = q.eq('role_name', role);

      const { data, error } = await q;
      if (error) throw error;
      return res.json({ success: true, data: data || [] });
    }

    // Prioritas 2: Filter berdasarkan session_id (halaman /results lama)
    if (session_id) {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('status', 'done')
        .eq('session_id', session_id)
        .order('score', { ascending: false });

      if (error) throw error;
      return res.json({ success: true, data: data || [] });
    }

    // Prioritas 3: Filter berdasarkan position_name (fallback data lama)
    if (position && position !== 'null' && position !== '') {
      let q1 = supabase
        .from('candidates')
        .select('*')
        .eq('status', 'done')
        .eq('position_name', position)
        .is('job_id', null)
        .order('score', { ascending: false });

      if (role) q1 = q1.eq('role_name', role);
      const { data: specific, error: e1 } = await q1;
      if (e1) throw e1;

      let combined = specific || [];
      if (combined.length === 0 && !role) {
        const { data: legacy } = await supabase
          .from('candidates')
          .select('*')
          .eq('status', 'done')
          .eq('position_name', '')
          .order('score', { ascending: false });
        combined = legacy || [];
      }

      return res.json({ success: true, data: combined });
    }

    // Tanpa filter: ambil semua
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .eq('status', 'done')
      .order('score', { ascending: false });

    if (error) throw error;
    return res.json({ success: true, data: data || [] });

  } catch (err) {
    console.error('get-results error:', err);
    return res.status(500).json({ error: err.message });
  }
}
