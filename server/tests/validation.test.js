import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import app from '../src/app.js';
import { Project } from '../src/models/Project.js';
import { cookieFor, createAdmin } from './helpers/auth.js';
import { clearDb, connect, disconnect } from './helpers/db.js';

let cookie;

const as = (method, path) => request(app)[method](path).set('Cookie', cookie);
const missingId = '507f1f77bcf86cd799439011';
const validProject = {
  title: 'Task Manager',
  description: 'A full-stack task manager application.',
};

beforeAll(async () => {
  await connect();
  await clearDb();
  cookie = cookieFor(await createAdmin());
});
beforeEach(() => clearDb({ keepUsers: true }));
afterAll(disconnect);

describe('projects: create', () => {
  it('creates a project and generates a slug from the title', async () => {
    const res = await as('post', '/api/projects').send({ ...validProject, title: 'My Great App!' });
    expect(res.status).toBe(201);
    expect(res.body.data.slug).toBe('my-great-app');
    expect(res.body.data.published).toBe(true);
  });

  it('keeps slugs unique', async () => {
    await as('post', '/api/projects').send(validProject);
    const second = await as('post', '/api/projects').send(validProject);
    expect(second.body.data.slug).toBe('task-manager-2');
  });

  it('requires a title and a description', async () => {
    const res = await as('post', '/api/projects').send({});
    expect(res.status).toBe(400);
    const fields = res.body.details.map((d) => d.field);
    expect(fields).toEqual(expect.arrayContaining(['title', 'description']));
  });

  it('enforces length limits', async () => {
    const res = await as('post', '/api/projects').send({ title: 'x', description: 'short' });
    expect(res.status).toBe(400);
  });

  it.each([['liveUrl'], ['githubUrl']])('rejects an invalid %s', async (field) => {
    const res = await as('post', '/api/projects').send({ ...validProject, [field]: 'not-a-url' });
    expect(res.status).toBe(400);
    expect(res.body.details.map((d) => d.field)).toContain(field);
  });

  it('rejects javascript: links', async () => {
    const res = await as('post', '/api/projects').send({
      ...validProject,
      liveUrl: 'javascript:alert(1)',
    });
    expect(res.status).toBe(400);
  });

  it('rejects an invalid slug', async () => {
    const res = await as('post', '/api/projects').send({ ...validProject, slug: 'Bad Slug!' });
    expect(res.status).toBe(400);
  });

  it('strips unknown fields instead of saving them (mass assignment)', async () => {
    const res = await as('post', '/api/projects').send({
      ...validProject,
      isAdmin: true,
      _id: missingId,
      createdAt: '2000-01-01T00:00:00.000Z',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.isAdmin).toBeUndefined();
    expect(res.body.data._id).not.toBe(missingId);
    expect(new Date(res.body.data.createdAt).getFullYear()).not.toBe(2000);
  });

  it('rejects a non-JSON-object body gracefully', async () => {
    const res = await as('post', '/api/projects').send('title=abc');
    expect(res.status).toBe(400);
  });
});

describe('projects: update and delete', () => {
  let project;

  beforeEach(async () => {
    project = (await as('post', '/api/projects').send(validProject)).body.data;
  });

  it('updates fields and keeps the slug stable', async () => {
    const res = await as('put', `/api/projects/${project._id}`).send({ title: 'Renamed project' });
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Renamed project');
    expect(res.body.data.slug).toBe('task-manager');
  });

  it('rejects an empty update', async () => {
    const res = await as('put', `/api/projects/${project._id}`).send({});
    expect(res.status).toBe(400);
  });

  it('returns 404 for an id that does not exist', async () => {
    const res = await as('put', `/api/projects/${missingId}`).send({ title: 'Nope nope' });
    expect(res.status).toBe(404);
  });

  it('returns 400 for a malformed id', async () => {
    const res = await as('put', '/api/projects/not-an-id').send({ title: 'Nope nope' });
    expect(res.status).toBe(400);
  });

  it('refuses a slug that another project already uses by suffixing it', async () => {
    const other = (await as('post', '/api/projects').send({ ...validProject, title: 'Other app' })).body.data;
    const res = await as('put', `/api/projects/${other._id}`).send({ slug: 'task-manager' });
    expect(res.status).toBe(200);
    expect(res.body.data.slug).toBe('task-manager-2');
  });

  it('deletes a project', async () => {
    const res = await as('delete', `/api/projects/${project._id}`);
    expect(res.status).toBe(200);
    expect(await Project.countDocuments()).toBe(0);
    expect((await as('delete', `/api/projects/${project._id}`)).status).toBe(404);
  });
});

describe('projects: listing', () => {
  beforeEach(async () => {
    await Project.create([
      { title: 'One', slug: 'one', description: 'First project here', tech: ['React', 'Node.js'], featured: true },
      { title: 'Two', slug: 'two', description: 'Second project here', tech: ['Python'] },
      { title: 'Three', slug: 'three', description: 'Third project here', tech: ['React'] },
    ]);
  });

  it('filters by technology, ignoring case', async () => {
    const res = await request(app).get('/api/projects?tech=react');
    expect(res.body.total).toBe(2);
  });

  it('treats the tech filter as plain text, not a regular expression', async () => {
    const res = await request(app).get('/api/projects?tech=.*');
    expect(res.body.total).toBe(0);
  });

  it('filters by featured', async () => {
    const res = await request(app).get('/api/projects?featured=true');
    expect(res.body.total).toBe(1);
    expect(res.body.data[0].slug).toBe('one');
  });

  it('paginates', async () => {
    const res = await request(app).get('/api/projects?limit=1&page=2');
    expect(res.body).toMatchObject({ count: 1, total: 3, page: 2, pages: 3 });
  });

  it.each([['limit=1000'], ['limit=0'], ['page=0'], ['page=abc']])(
    'rejects invalid pagination (%s)',
    async (query) => {
      const res = await request(app).get(`/api/projects?${query}`);
      expect(res.status).toBe(400);
    },
  );
});

describe('skills', () => {
  it('validates the category', async () => {
    const bad = await as('post', '/api/skills').send({ name: 'React', category: 'Nope' });
    expect(bad.status).toBe(400);

    const good = await as('post', '/api/skills').send({ name: 'React', category: 'Frontend' });
    expect(good.status).toBe(201);
  });

  it('filters by category and rejects an unknown one', async () => {
    await as('post', '/api/skills').send({ name: 'React', category: 'Frontend' });
    await as('post', '/api/skills').send({ name: 'Express', category: 'Backend' });

    const ok = await request(app).get('/api/skills?category=Backend');
    expect(ok.body.total).toBe(1);
    expect(ok.body.data[0].name).toBe('Express');

    expect((await request(app).get('/api/skills?category=Invalid')).status).toBe(400);
  });

  it('cannot be fetched by slug (skills have no slugs)', async () => {
    const res = await request(app).get('/api/skills/react');
    expect(res.status).toBe(404);
  });
});

describe('experience', () => {
  const entry = { title: 'Developer', organization: 'ACME', startDate: '2024-01-01' };

  it('requires a start date and a valid type', async () => {
    expect((await as('post', '/api/experience').send({ title: 'Dev', organization: 'ACME' })).status).toBe(400);
    expect((await as('post', '/api/experience').send({ ...entry, type: 'hobby' })).status).toBe(400);
  });

  it('ignores the end date for a current position', async () => {
    const res = await as('post', '/api/experience').send({
      ...entry,
      current: true,
      endDate: '2024-12-31',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.endDate).toBeUndefined();
  });

  it('filters by type', async () => {
    await as('post', '/api/experience').send({ ...entry, type: 'work' });
    await as('post', '/api/experience').send({ ...entry, title: 'BSc', type: 'education' });
    const res = await request(app).get('/api/experience?type=education');
    expect(res.body.total).toBe(1);
    expect(res.body.data[0].title).toBe('BSc');
  });
});

describe('posts', () => {
  it('requires a title and content', async () => {
    const res = await as('post', '/api/posts').send({ title: 'Only a title' });
    expect(res.status).toBe(400);
    expect(res.body.details.map((d) => d.field)).toContain('content');
  });

  it('creates drafts by default, without a publish date', async () => {
    const res = await as('post', '/api/posts').send({ title: 'A draft post', content: 'Body text' });
    expect(res.status).toBe(201);
    expect(res.body.data.published).toBe(false);
    expect(res.body.data.publishedAt).toBeUndefined();
  });

  it('sets the publish date and reading time when published', async () => {
    const res = await as('post', '/api/posts').send({
      title: 'A published post',
      content: 'word '.repeat(450),
      published: true,
    });
    expect(res.status).toBe(201);
    expect(res.body.data.publishedAt).toBeDefined();
    expect(res.body.data.readingTime).toBe(3);
  });

  it('filters by tag, ignoring case', async () => {
    await as('post', '/api/posts').send({ title: 'Tagged post', content: 'Body', published: true, tags: ['MERN'] });
    await as('post', '/api/posts').send({ title: 'Other post', content: 'Body', published: true, tags: ['css'] });
    const res = await request(app).get('/api/posts?tag=mern');
    expect(res.body.total).toBe(1);
  });
});
