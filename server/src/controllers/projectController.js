import { Project } from '../models/Project.js';
import { escapeRegex } from '../utils/escape.js';
import { createCrudController } from './crudFactory.js';

export const projectController = createCrudController(Project, {
  label: 'Project',
  slugSource: 'title',
  publicFilter: { published: true },
  publicSelect: '-content',
  sort: { order: 1, createdAt: -1 },
  imageFields: ['image'],
  buildFilter: ({ tech, featured }) => ({
    ...(tech && { tech: new RegExp(`^${escapeRegex(tech)}$`, 'i') }),
    ...(featured !== undefined && { featured }),
  }),
});
