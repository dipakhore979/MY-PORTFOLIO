import { postController } from '../controllers/postController.js';
import { postCreateSchema, postUpdateSchema } from '../validators/schemas.js';
import { crudRouter } from './crudRouter.js';

export default crudRouter(postController, {
  createSchema: postCreateSchema,
  updateSchema: postUpdateSchema,
});
