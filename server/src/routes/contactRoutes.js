import { Router } from 'express';
import { submitContact } from '../controllers/contactController.js';
import { contactLimiter } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';
import { contactSchema } from '../validators/schemas.js';

const router = Router();

router.post('/', contactLimiter, validate(contactSchema), submitContact);

export default router;
