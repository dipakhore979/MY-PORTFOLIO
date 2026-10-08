import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/profileController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { profileSchema } from '../validators/schemas.js';

const router = Router();

router.get('/', getProfile);
router.put('/', protect, validate(profileSchema), updateProfile);

export default router;
