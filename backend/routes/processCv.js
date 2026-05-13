import { Router } from 'express';
import { processCv } from '../controllers/processCvController.js';

const router = Router();

router.post('/api/process-cv', processCv);

export default router;
