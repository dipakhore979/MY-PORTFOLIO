import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import app from '../src/app.js';
import { removeImage } from '../src/services/storage.js';
import { cookieFor, createAdmin } from './helpers/auth.js';
import { clearDb, connect, disconnect } from './helpers/db.js';

// 8-byte PNG signature + IHDR chunk header: enough for the file-type check
const PNG = Buffer.from('89504e470d0a1a0a0000000d49484452', 'hex');

let cookie;
const upload = (field, buffer, filename, contentType) =>
  request(app).post(`/api/upload/${field === 'file' ? 'resume' : 'image'}`).set('Cookie', cookie).attach(field, buffer, { filename, contentType });

beforeAll(async () => {
  await connect();
  await clearDb();
  cookie = cookieFor(await createAdmin());
});
afterAll(disconnect);

describe('image upload', () => {
  it('stores a valid image and serves it back', async () => {
    const res = await upload('image', PNG, 'pic.png', 'image/png');

    try {
      expect(res.status).toBe(201);
      expect(res.body.data.publicId).toMatch(/^local:/);

      const file = await request(app).get(new URL(res.body.data.url).pathname);
      expect(file.status).toBe(200);
      expect(file.headers['content-type']).toMatch(/image\/png/);
      expect(file.headers['cross-origin-resource-policy']).toBe('cross-origin');
    } finally {
      await removeImage(res.body?.data?.publicId); // keep the uploads folder clean
    }
  });

  it('rejects files that are not images', async () => {
    const res = await upload('image', Buffer.from('hello world'), 'notes.txt', 'text/plain');
    expect(res.status).toBe(400);
  });

  it('rejects a file that claims to be a PNG but is not', async () => {
    const res = await upload('image', Buffer.from('this is definitely not a png'), 'fake.png', 'image/png');
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/unsupported or corrupt/i);
  });

  it('rejects files over 5 MB', async () => {
    const big = Buffer.concat([PNG, Buffer.alloc(5 * 1024 * 1024 + 1024)]);
    const res = await upload('image', big, 'big.png', 'image/png');
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/too large/i);
  });

  it('requires the "image" field name', async () => {
    const res = await request(app)
      .post('/api/upload/image')
      .set('Cookie', cookie)
      .attach('wrong', PNG, { filename: 'pic.png', contentType: 'image/png' });
    expect(res.status).toBe(400);
  });

  it('answers 400 when no file is sent', async () => {
    const res = await request(app).post('/api/upload/image').set('Cookie', cookie);
    expect(res.status).toBe(400);
  });
});

describe('resume upload', () => {
  it('rejects a file that is not a PDF, even with a PDF content type', async () => {
    const res = await upload('file', Buffer.from('definitely not a pdf'), 'resume.pdf', 'application/pdf');
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/not a valid pdf/i);
  });

  it('rejects other file types', async () => {
    const res = await upload('file', PNG, 'resume.png', 'image/png');
    expect(res.status).toBe(400);
  });
});
