import { projectController } from '../controllers/projectController.js';
import { projectCreateSchema, projectUpdateSchema } from '../validators/schemas.js';
import { crudRouter } from './crudRouter.js';

export default crudRouter(projectController, {
  createSchema: projectCreateSchema,
  updateSchema: projectUpdateSchema,
});
