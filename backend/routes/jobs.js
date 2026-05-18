import { Router } from 'express';
import { getJobs, getJobById, createJob, updateJob, deleteJob } from '../controllers/jobsController.js';

const router = Router();

router.get('/api/jobs', getJobs);
router.get('/api/jobs/:id', getJobById);
router.post('/api/jobs', createJob);
router.put('/api/jobs/:id', updateJob);
router.delete('/api/jobs/:id', deleteJob);

export default router;
