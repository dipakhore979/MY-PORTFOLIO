import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import app from '../src/app.js';
import { Message } from '../src/models/Message.js';
import { clearDb, connect, disconnect } from './helpers/db.js';

// NOTE: POST /api/contact allows 5 requests per hour per IP and every request counts.
// This file sends exactly 5. Rate-limit behaviour itself is tested in rateLimit.test.js.

const valid = {
  name: 'Jane Doe',
  email: 'jane@example.com',
  subject: 'Hello',
  message: 'Hi, I love your portfolio and would like to talk.',
};

beforeAll(async () => {
  await connect();
  await clearDb();
});
afterAll(disconnect);

describe('POST /api/contact', () => {
  it('saves a valid message', async () => {
    const res = await request(app).post('/api/contact').send(valid);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    const saved = await Message.findOne().lean();
    expect(saved).toMatchObject({ name: 'Jane Doe', email: 'jane@example.com', read: false });
  });

  it('silently drops submissions that fill the hidden honeypot field', async () => {
    const before = await Message.countDocuments();
    const res = await request(app)
      .post('/api/contact')
      .send({ ...valid, website: 'http://spam.example' });

    expect(res.status).toBe(201); // looks like success to the bot
    expect(await Message.countDocuments()).toBe(before);
  });

  it('rejects an invalid email', async () => {
    const res = await request(app).post('/api/contact').send({ ...valid, email: 'not-an-email' });
    expect(res.status).toBe(400);
    expect(res.body.details.map((d) => d.field)).toContain('email');
  });

  it('rejects a too-short message', async () => {
    const res = await request(app).post('/api/contact').send({ ...valid, message: 'Hi' });
    expect(res.status).toBe(400);
    expect(res.body.details.map((d) => d.field)).toContain('message');
  });

  it('rejects a too-short name and ignores unknown fields', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({ ...valid, name: 'J', read: true });
    expect(res.status).toBe(400);
  });
});
