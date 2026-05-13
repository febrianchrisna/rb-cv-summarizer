import { Router } from 'express';
import multer from 'multer';
import { queueCv } from '../controllers/queueCvController.js';

const router = Router();
// Simpan file di memory (buffer) — tidak perlu simpan ke disk
const upload = multer({ storage: multer.memoryStorage() });

router.post('/api/queue-cv', upload.single('cv'), queueCv);

export default router;
