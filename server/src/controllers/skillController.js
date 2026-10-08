import { Skill } from '../models/Skill.js';
import { createCrudController } from './crudFactory.js';

export const skillController = createCrudController(Skill, {
  label: 'Skill',
  sort: { category: 1, order: 1, name: 1 },
  buildFilter: ({ category }) => ({ ...(category && { category }) }),
});
