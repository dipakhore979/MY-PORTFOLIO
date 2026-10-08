import { Router } from 'express';
import { uploadImageHandler, uploadResumeHandler } from '../controllers/uploadController.js';
import { protect } from '../middleware/auth.js';
import { uploadImage, uploadResume } from '../middleware/upload.js';

const router = Router();

router.use(protect);

router.post('/image', uploadImage, uploadImageHandler);
router.post('/resume', uploadResume, uploadResumeHandler);

export default router;
