import { Router } from 'express';
import { optionalAuth, protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { listQuerySchema } from '../validators/schemas.js';

/**
 * GET (list / single) is public but returns drafts only to logged-in admins.
 * POST / PUT / DELETE require authentication.
 */
export const crudRouter = (controller, { createSchema, updateSchema }) => {
  const router = Router();
  router.get('/', optionalAuth, validate(listQuerySchema, 'query'), controller.list);
  router.get('/:idOrSlug', optionalAuth, controller.getOne);
  router.post('/', protect, validate(createSchema), controller.create);
  router.put('/:id', protect, validate(updateSchema), controller.update);
  router.delete('/:id', protect, controller.remove);
  return router;
};
