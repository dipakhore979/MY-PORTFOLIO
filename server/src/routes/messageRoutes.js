import { Router } from 'express';
import {
  deleteMessage,
  getMessage,
  listMessages,
  updateMessage,
} from '../controllers/messageController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { listQuerySchema, messageUpdateSchema } from '../validators/schemas.js';

const router = Router();

router.use(protect); // every message route is admin-only

router.get('/', validate(listQuerySchema, 'query'), listMessages);
router.get('/:id', getMessage);
router.patch('/:id', validate(messageUpdateSchema), updateMessage);
router.delete('/:id', deleteMessage);

export default router;
