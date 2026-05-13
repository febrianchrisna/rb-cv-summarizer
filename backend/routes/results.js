import { Router } from 'express';
import { getResults } from '../controllers/resultsController.js';

const router = Router();

router.get('/api/get-results', getResults);

export default router;
