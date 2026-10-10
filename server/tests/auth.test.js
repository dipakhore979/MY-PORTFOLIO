import jwt from 'jsonwebtoken';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import app from '../src/app.js';
import { User } from '../src/models/User.js';
import { TEST_PASSWORD, cookieFor, createAdmin } from './helpers/auth.js';
import { clearDb, connect, disconnect } from './helpers/db.js';

// NOTE: POST /api/auth/login allows 10 requests per 15 minutes per IP and every request
// counts, failures included. This file sends 8. Put any extra login tests in their own file.

let admin;

beforeAll(async () => {
  await connect();
  await clearDb();
  admin = await createAdmin();
});
afterAll(disconnect);

describe('POST /api/auth/login', () => {
  it('logs in with correct credentials and sets an httpOnly session cookie', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: TEST_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('admin@example.com');
    expect(JSON.stringify(res.body)).not.toContain('password');

    const cookie = res.headers['set-cookie'].find((c) => c.startsWith('token='));
    expect(cookie).toBeDefined();
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/Path=\//);
    expect(cookie).toMatch(/SameSite=Lax/i);
  });

  it('rejects a wrong password with a generic message', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'WrongPassword123' });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');
    expect(res.headers['set-cookie']).toBeUndefined();
  });

  it('gives the same answer for an unknown email (no account enumeration)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'WrongPassword123' });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');
  });

  it('rejects a missing password with validation details', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'admin@example.com' });

    expect(res.status).toBe(400);
    expect(res.body.details.map((d) => d.field)).toContain('password');
  });

  it('blocks NoSQL operator injection', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: { $gt: '' }, password: { $gt: '' } });

    expect(res.status).toBe(400);
    expect(res.headers['set-cookie']).toBeUndefined();
  });

  it('treats the email case-insensitively', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ADMIN@Example.com', password: TEST_PASSWORD });

    expect(res.status).toBe(200);
  });
});

describe('session handling', () => {
  const sign = (payload, secret, options = {}) =>
    jwt.sign(payload, secret, { algorithm: 'HS256', ...options });

  it('GET /api/auth/me requires a session', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('GET /api/auth/me returns the user for a valid session cookie', async () => {
    const res = await request(app).get('/api/auth/me').set('Cookie', cookieFor(admin));
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('admin@example.com');
  });

  it('rejects a garbage token', async () => {
    const res = await request(app).get('/api/auth/me').set('Cookie', 'token=not-a-real-token');
    expect(res.status).toBe(401);
  });

  it('rejects an expired token', async () => {
    const token = sign(
      { sub: String(admin._id), exp: Math.floor(Date.now() / 1000) - 60 },
      process.env.JWT_SECRET,
    );
    const res = await request(app).get('/api/auth/me').set('Cookie', `token=${token}`);
    expect(res.status).toBe(401);
  });

  it('rejects a token signed with a different secret', async () => {
    const token = sign({ sub: String(admin._id) }, 'some-other-secret-some-other-secret-1234');
    const res = await request(app).get('/api/auth/me').set('Cookie', `token=${token}`);
    expect(res.status).toBe(401);
  });

  it('rejects an unsigned token (alg: none)', async () => {
    const encode = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
    const token = `${encode({ alg: 'none', typ: 'JWT' })}.${encode({ sub: String(admin._id) })}.`;
    const res = await request(app).get('/api/auth/me').set('Cookie', `token=${token}`);
    expect(res.status).toBe(401);
  });

  it('rejects a valid token whose user no longer exists', async () => {
    const ghost = await createAdmin({ email: 'ghost@example.com' });
    const cookie = cookieFor(ghost);
    await User.deleteOne({ _id: ghost._id });

    const res = await request(app).get('/api/auth/me').set('Cookie', cookie);
    expect(res.status).toBe(401);
  });

  it('POST /api/auth/logout clears the cookie', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(200);
    expect(res.headers['set-cookie'].join(';')).toMatch(/token=;/);
  });
});

describe('PUT /api/auth/password', () => {
  let user;

  beforeAll(async () => {
    user = await createAdmin({ email: 'pw@example.com' });
  });

  const change = (body) =>
    request(app).put('/api/auth/password').set('Cookie', cookieFor(user)).send(body);

  it('requires a session', async () => {
    const res = await request(app)
      .put('/api/auth/password')
      .send({ currentPassword: TEST_PASSWORD, newPassword: 'AnotherPassword456' });
    expect(res.status).toBe(401);
  });

  it('rejects a wrong current password', async () => {
    const res = await change({ currentPassword: 'WrongPassword123', newPassword: 'AnotherPassword456' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/current password is incorrect/i);
  });

  it('rejects reusing the current password', async () => {
    const res = await change({ currentPassword: TEST_PASSWORD, newPassword: TEST_PASSWORD });
    expect(res.status).toBe(400);
  });

  it('rejects a too-short new password', async () => {
    const res = await change({ currentPassword: TEST_PASSWORD, newPassword: 'short' });
    expect(res.status).toBe(400);
    expect(res.body.details.map((d) => d.field)).toContain('newPassword');
  });

  it('changes the password: the old one stops working and the new one works', async () => {
    const res = await change({ currentPassword: TEST_PASSWORD, newPassword: 'AnotherPassword456' });
    expect(res.status).toBe(200);

    const oldLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'pw@example.com', password: TEST_PASSWORD });
    expect(oldLogin.status).toBe(401);

    const newLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'pw@example.com', password: 'AnotherPassword456' });
    expect(newLogin.status).toBe(200);
  });
});
