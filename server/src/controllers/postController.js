import { Post } from '../models/Post.js';
import { escapeRegex } from '../utils/escape.js';
import { createCrudController } from './crudFactory.js';

export const postController = createCrudController(Post, {
  label: 'Post',
  slugSource: 'title',
  publicFilter: { published: true },
  publicSelect: '-content',
  sort: { publishedAt: -1, createdAt: -1 },
  imageFields: ['coverImage'],
  buildFilter: ({ tag }) => ({
    ...(tag && { tags: new RegExp(`^${escapeRegex(tag)}$`, 'i') }),
  }),
});
