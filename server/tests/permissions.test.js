import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import app from '../src/app.js';
import { Post } from '../src/models/Post.js';
import { Project } from '../src/models/Project.js';
import { cookieFor, createAdmin } from './helpers/auth.js';
import { clearDb, connect, disconnect } from './helpers/db.js';

const id = '507f1f77bcf86cd799439011';

const protectedRoutes = [
  ['post', '/api/projects'],
  ['put', `/api/projects/${id}`],
  ['delete', `/api/projects/${id}`],
  ['post', '/api/skills'],
  ['put', `/api/skills/${id}`],
  ['delete', `/api/skills/${id}`],
  ['post', '/api/experience'],
  ['put', `/api/experience/${id}`],
  ['delete', `/api/experience/${id}`],
  ['post', '/api/posts'],
  ['put', `/api/posts/${id}`],
  ['delete', `/api/posts/${id}`],
  ['put', '/api/profile'],
  ['get', '/api/messages'],
  ['get', `/api/messages/${id}`],
  ['patch', `/api/messages/${id}`],
  ['delete', `/api/messages/${id}`],
  ['post', '/api/upload/image'],
  ['post', '/api/upload/resume'],
  ['get', '/api/auth/me'],
  ['put', '/api/auth/password'],
];

const publicRoutes = [
  '/api/health',
  '/api/projects',
  '/api/skills',
  '/api/experience',
  '/api/posts',
  '/api/profile',
  '/api/sitemap.xml',
];

let admin;
let cookie;

beforeAll(async () => {
  await connect();
  await clearDb();
  admin = await createAdmin();
  cookie = cookieFor(admin);
});
afterAll(disconnect);

describe('anonymous access', () => {
  it.each(protectedRoutes)('%s %s requires login', async (method, path) => {
    const res = await request(app)[method](path).send({});
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it.each(publicRoutes)('GET %s is public', async (path) => {
    const res = await request(app).get(path);
    expect(res.status).toBe(200);
  });
});

describe('draft visibility', () => {
  beforeEach(async () => {
    await clearDb({ keepUsers: true });
    await Project.create([
      {
        title: 'Public project',
        slug: 'public-project',
        description: 'A project everyone can see',
        content: 'Long details',
        published: true,
      },
      {
        title: 'Hidden project',
        slug: 'hidden-project',
        description: 'A draft project nobody should see',
        published: false,
      },
    ]);
    await Post.create({ title: 'Draft post', slug: 'draft-post', content: 'Draft body', published: false });
  });

  it('hides unpublished projects from visitors and leaves out long content in lists', async () => {
    const res = await request(app).get('/api/projects');
    expect(res.body.total).toBe(1);
    expect(res.body.data[0].slug).toBe('public-project');
    expect(res.body.data[0]).not.toHaveProperty('content');
  });

  it('returns 404 for an unpublished project by slug and by id', async () => {
    const hidden = await Project.findOne({ slug: 'hidden-project' });
    expect((await request(app).get('/api/projects/hidden-project')).status).toBe(404);
    expect((await request(app).get(`/api/projects/${hidden._id}`)).status).toBe(404);
    expect((await request(app).get('/api/projects/public-project')).status).toBe(200);
  });

  it('hides draft posts from visitors', async () => {
    const list = await request(app).get('/api/posts');
    expect(list.body.total).toBe(0);
    expect((await request(app).get('/api/posts/draft-post')).status).toBe(404);
  });

  it('shows drafts to a logged-in admin', async () => {
    const list = await request(app).get('/api/projects').set('Cookie', cookie);
    expect(list.body.total).toBe(2);
    expect((await request(app).get('/api/projects/hidden-project').set('Cookie', cookie)).status).toBe(200);
    expect((await request(app).get('/api/posts/draft-post').set('Cookie', cookie)).status).toBe(200);
  });

  it('does not treat a bogus cookie as an admin', async () => {
    const res = await request(app).get('/api/projects').set('Cookie', 'token=garbage');
    expect(res.body.total).toBe(1);
  });
});
