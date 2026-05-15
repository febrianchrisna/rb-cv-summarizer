import { supabase } from '../config/supabase.js';

export async function getJobs(req, res) {
  try {
    const { data, error } = await supabase
      .from('mst_job_post')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

export async function getJobById(req, res) {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('mst_job_post')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

export async function createJob(req, res) {
  try {
    const jobData = req.body;
    const { data, error } = await supabase
      .from('mst_job_post')
      .insert(jobData)
      .select()
      .single();

    if (error) throw error;
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

export async function updateJob(req, res) {
  try {
    const { id } = req.params;
    const jobData = req.body;
    const { data, error } = await supabase
      .from('mst_job_post')
      .update(jobData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

export async function deleteJob(req, res) {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('mst_job_post')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
