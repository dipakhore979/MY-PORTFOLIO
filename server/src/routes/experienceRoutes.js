import { experienceController } from '../controllers/experienceController.js';
import { experienceCreateSchema, experienceUpdateSchema } from '../validators/schemas.js';
import { crudRouter } from './crudRouter.js';

export default crudRouter(experienceController, {
  createSchema: experienceCreateSchema,
  updateSchema: experienceUpdateSchema,
});
