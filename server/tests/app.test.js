import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import app from '../src/app.js';
import { connect, disconnect } from './helpers/db.js';

beforeAll(connect);
afterAll(disconnect);

describe('app basics', () => {
  it('reports health', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('answers unknown API routes with a JSON 404', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('turns malformed JSON into a 400', async () => {
    const res = await request(app)
      .post('/api/contact')
      .set('Content-Type', 'application/json')
      .send('{"name": broken');
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Malformed JSON body');
  });

  it('sets security headers and hides the framework', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });
});

describe('CORS', () => {
  it('allows the configured site origin, with credentials', async () => {
    const res = await request(app).get('/api/health').set('Origin', 'http://localhost:5173');
    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    expect(res.headers['access-control-allow-credentials']).toBe('true');
  });

  it('refuses other origins', async () => {
    const res = await request(app).get('/api/health').set('Origin', 'https://evil.example');
    expect(res.status).toBe(403);
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('refuses a cross-origin login attempt', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('Origin', 'https://evil.example')
      .send({ email: 'admin@example.com', password: 'whatever12345' });
    expect(res.status).toBe(403);
  });
});
