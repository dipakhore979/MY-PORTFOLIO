import { Router } from 'express';
import { downloadResume, resumeInfo } from '../controllers/uploadController.js';

const router = Router();

router.get('/info', resumeInfo);
router.get('/', downloadResume);

export default router;
