import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import app from '../src/app.js';
import { cookieFor, createAdmin } from './helpers/auth.js';
import { clearDb, connect, disconnect } from './helpers/db.js';

let cookie;
const save = (body) => request(app).put('/api/profile').set('Cookie', cookie).send(body);

beforeAll(async () => {
  await connect();
  await clearDb();
  cookie = cookieFor(await createAdmin());
});
beforeEach(() => clearDb({ keepUsers: true }));
afterAll(disconnect);

describe('profile', () => {
  it('is empty until the admin saves one', async () => {
    const res = await request(app).get('/api/profile');
    expect(res.status).toBe(200);
    expect(res.body.data).toBeNull();
  });

  it('is created and then updated by the admin, and is public to read', async () => {
    const created = await save({ name: 'Dipak Hore', role: 'Full-Stack Developer', bio: 'Hello.' });
    expect(created.status).toBe(200);

    await save({ tagline: 'I build web apps.' });

    const res = await request(app).get('/api/profile');
    expect(res.body.data).toMatchObject({
      key: 'main',
      name: 'Dipak Hore',
      role: 'Full-Stack Developer',
      tagline: 'I build web apps.',
    });
  });

  it('keeps a single profile document', async () => {
    await save({ name: 'Dipak Hore', role: 'Developer' });
    await save({ name: 'Dipak H', role: 'Developer' });
    const { Profile } = await import('../src/models/Profile.js');
    expect(await Profile.countDocuments()).toBe(1);
  });

  it('rejects an empty update', async () => {
    expect((await save({})).status).toBe(400);
  });

  it('validates the email', async () => {
    const res = await save({ email: 'not-an-email' });
    expect(res.status).toBe(400);
    expect(res.body.details.map((d) => d.field)).toContain('email');
  });

  it.each([['github'], ['linkedin']])('rejects a non-http %s link', async (field) => {
    const res = await save({ [field]: 'javascript:alert(1)' });
    expect(res.status).toBe(400);
  });

  it('does not let clients set the singleton key', async () => {
    await save({ name: 'Dipak Hore', role: 'Developer', key: 'other' });
    const res = await request(app).get('/api/profile');
    expect(res.body.data.key).toBe('main');
  });
});
