import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import app from '../src/app.js';
import { Message } from '../src/models/Message.js';
import { cookieFor, createAdmin } from './helpers/auth.js';
import { clearDb, connect, disconnect } from './helpers/db.js';

let cookie;
let first;

const as = (method, path) => request(app)[method](path).set('Cookie', cookie);

beforeAll(async () => {
  await connect();
  await clearDb();
  cookie = cookieFor(await createAdmin());
});
beforeEach(async () => {
  await clearDb({ keepUsers: true });
  [first] = await Message.create([
    { name: 'Alice', email: 'alice@example.com', message: 'First message body' },
    { name: 'Bob', email: 'bob@example.com', message: 'Second message body', read: true },
  ]);
});
afterAll(disconnect);

describe('admin inbox', () => {
  it('lists messages with the unread count', async () => {
    const res = await as('get', '/api/messages');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ total: 2, unread: 1 });
  });

  it('filters to unread messages', async () => {
    const res = await as('get', '/api/messages?unread=true');
    expect(res.body.total).toBe(1);
    expect(res.body.data[0].name).toBe('Alice');
  });

  it('marks a message as read', async () => {
    const res = await as('patch', `/api/messages/${first._id}`).send({ read: true });
    expect(res.status).toBe(200);
    expect(res.body.data.read).toBe(true);
    expect((await as('get', '/api/messages')).body.unread).toBe(0);
  });

  it('only accepts a boolean "read" value', async () => {
    const res = await as('patch', `/api/messages/${first._id}`).send({ read: 'maybe' });
    expect(res.status).toBe(400);
  });

  it('cannot edit other fields through PATCH', async () => {
    await as('patch', `/api/messages/${first._id}`).send({ read: true, message: 'tampered', name: 'Eve' });
    const saved = await Message.findById(first._id);
    expect(saved.message).toBe('First message body');
    expect(saved.name).toBe('Alice');
  });

  it('deletes a message', async () => {
    const res = await as('delete', `/api/messages/${first._id}`);
    expect(res.status).toBe(200);
    expect((await as('get', `/api/messages/${first._id}`)).status).toBe(404);
  });
});
