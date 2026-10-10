import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import app from '../src/app.js';
import { clearDb, connect, disconnect } from './helpers/db.js';

beforeAll(async () => {
  await connect();
  await clearDb();
});
afterAll(disconnect);

describe('rate limiting', () => {
  it('limits the contact form to 5 messages per hour', async () => {
    const message = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      message: 'This is a perfectly valid message.',
    };

    for (let i = 0; i < 5; i += 1) {
      const res = await request(app).post('/api/contact').send(message);
      expect(res.status).toBe(201);
    }

    const blocked = await request(app).post('/api/contact').send(message);
    expect(blocked.status).toBe(429);
    expect(blocked.body.success).toBe(false);
  });

  it('limits login attempts to 10 per 15 minutes', async () => {
    const attempt = () =>
      request(app).post('/api/auth/login').send({ email: 'nobody@example.com', password: 'WrongPassword123' });

    for (let i = 0; i < 10; i += 1) {
      expect((await attempt()).status).toBe(401);
    }

    const blocked = await attempt();
    expect(blocked.status).toBe(429);
    expect(blocked.body.message).toMatch(/too many/i);
  });
});
