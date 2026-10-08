import { Router } from 'express';
import { downloadResume } from '../controllers/uploadController.js';

const router = Router();

router.get('/', downloadResume);

export default router;
