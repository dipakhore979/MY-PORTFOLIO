import { Experience } from '../models/Experience.js';
import { createCrudController } from './crudFactory.js';

export const experienceController = createCrudController(Experience, {
  label: 'Experience entry',
  sort: { order: 1, startDate: -1 },
  buildFilter: ({ type }) => ({ ...(type && { type }) }),
});
