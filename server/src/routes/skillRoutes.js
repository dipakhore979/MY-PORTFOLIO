import { skillController } from '../controllers/skillController.js';
import { skillCreateSchema, skillUpdateSchema } from '../validators/schemas.js';
import { crudRouter } from './crudRouter.js';

export default crudRouter(skillController, {
  createSchema: skillCreateSchema,
  updateSchema: skillUpdateSchema,
});
