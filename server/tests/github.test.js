import request from 'supertest';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import app from '../src/app.js';
import { githubCache, usernameFrom } from '../src/controllers/githubController.js';
import { Profile } from '../src/models/Profile.js';
import { clearDb, connect, disconnect } from './helpers/db.js';

const json = (data, status = 200) => ({ ok: status < 400, status, json: async () => data });

/** Fake GitHub API for the user "dipak": 3 repos (one is a fork). */
const fakeGithub = (overrides = {}) =>
  vi.fn(async (url) => {
    const path = new URL(url).pathname;
    if (overrides.fail) return json({}, overrides.fail);
    if (path === '/users/dipak') {
      return json({ html_url: 'https://github.com/dipak', public_repos: 3, followers: 5 });
    }
    if (path === '/users/dipak/repos') {
      return json([
        { name: 'app', fork: false, stargazers_count: 4 },
        { name: 'api', fork: false, stargazers_count: 1 },
        { name: 'forked', fork: true, stargazers_count: 100 },
      ]);
    }
    if (path === '/repos/dipak/app/languages') return json({ JavaScript: 750, CSS: 250 });
    if (path === '/repos/dipak/api/languages') return json({ JavaScript: 500, Python: 500 });
    return json({}, 404);
  });

const useProfile = (github) => Profile.create({ name: 'Dipak', role: 'Developer', github });

beforeAll(connect);
beforeEach(async () => {
  await clearDb();
  githubCache.clear();
});
afterEach(() => vi.unstubAllGlobals());
afterAll(disconnect);

describe('usernameFrom', () => {
  it.each([
    ['dipak', 'dipak'],
    ['https://github.com/dipak', 'dipak'],
    ['https://github.com/dipak/', 'dipak'],
    ['https://github.com/dipak?tab=repositories', 'dipak'],
    ['', ''],
    ['https://github.com/bad name!', ''],
    ['https://github.com/-leading-dash', ''],
  ])('%s -> %s', (input, expected) => {
    expect(usernameFrom(input)).toBe(expected);
  });
});

describe('GET /api/github', () => {
  it('summarises repos, stars, followers and languages', async () => {
    const fetchMock = fakeGithub();
    vi.stubGlobal('fetch', fetchMock);
    await useProfile('https://github.com/dipak');

    const res = await request(app).get('/api/github');

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({
      username: 'dipak',
      url: 'https://github.com/dipak',
      publicRepos: 3,
      followers: 5,
      stars: 5, // forks are not counted
      languageCount: 3,
    });
    // JavaScript 1250 / CSS 250 / Python 500 of 2000 bytes
    expect(res.body.data.languages).toEqual([
      { name: 'JavaScript', percent: 62.5 },
      { name: 'Python', percent: 25 },
      { name: 'CSS', percent: 12.5 },
    ]);
  });

  it('is a 404 when no GitHub link is configured', async () => {
    vi.stubGlobal('fetch', fakeGithub());
    const res = await request(app).get('/api/github');
    expect(res.status).toBe(404);
  });

  it('ignores an invalid GitHub link', async () => {
    const fetchMock = fakeGithub();
    vi.stubGlobal('fetch', fetchMock);
    await useProfile('https://github.com/bad name!');

    expect((await request(app).get('/api/github')).status).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('caches results so GitHub is not called on every visit', async () => {
    const fetchMock = fakeGithub();
    vi.stubGlobal('fetch', fetchMock);
    await useProfile('https://github.com/dipak');

    await request(app).get('/api/github');
    const callsAfterFirst = fetchMock.mock.calls.length;
    const second = await request(app).get('/api/github');

    expect(second.status).toBe(200);
    expect(fetchMock.mock.calls.length).toBe(callsAfterFirst);
  });

  it('sends a User-Agent header, which GitHub requires', async () => {
    const fetchMock = fakeGithub();
    vi.stubGlobal('fetch', fetchMock);
    await useProfile('https://github.com/dipak');

    await request(app).get('/api/github');
    expect(fetchMock.mock.calls[0][1].headers['User-Agent']).toBeTruthy();
  });

  it('answers 404 for a GitHub user that does not exist', async () => {
    vi.stubGlobal('fetch', fakeGithub({ fail: 404 }));
    await useProfile('https://github.com/dipak');

    const res = await request(app).get('/api/github');
    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/not found/i);
  });

  it('answers 503 with a clear message when GitHub rate-limits the server', async () => {
    vi.stubGlobal('fetch', fakeGithub({ fail: 403 }));
    await useProfile('https://github.com/dipak');

    const res = await request(app).get('/api/github');
    expect(res.status).toBe(503);
    expect(res.body.message).toMatch(/rate limit/i);
  });

  it('answers 502 when GitHub is down and nothing is cached', async () => {
    vi.stubGlobal('fetch', fakeGithub({ fail: 500 }));
    await useProfile('https://github.com/dipak');

    const res = await request(app).get('/api/github');
    expect(res.status).toBe(502);
  });

  it('serves the old numbers (marked stale) when GitHub fails after the cache expired', async () => {
    vi.stubGlobal('fetch', fakeGithub());
    await useProfile('https://github.com/dipak');
    await request(app).get('/api/github');

    githubCache.get('dipak').expires = 0; // force expiry
    vi.stubGlobal('fetch', fakeGithub({ fail: 500 }));

    const res = await request(app).get('/api/github');
    expect(res.status).toBe(200);
    expect(res.body.stale).toBe(true);
    expect(res.body.data.publicRepos).toBe(3);
  });

  it('survives network errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('network down')));
    await useProfile('https://github.com/dipak');

    expect((await request(app).get('/api/github')).status).toBe(502);
  });

  it('still returns data when one repo language lookup fails', async () => {
    const base = fakeGithub();
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url) =>
        new URL(url).pathname === '/repos/dipak/api/languages' ? json({}, 500) : base(url),
      ),
    );
    await useProfile('https://github.com/dipak');

    const res = await request(app).get('/api/github');
    expect(res.status).toBe(200);
    expect(res.body.data.languages.map((l) => l.name)).toEqual(['JavaScript', 'CSS']);
  });
});

describe('GET /api/resume/info', () => {
  it('is public and reports whether a resume exists', async () => {
    const res = await request(app).get('/api/resume/info');
    expect(res.status).toBe(200);
    expect(typeof res.body.available).toBe('boolean');
    if (res.body.available) expect(res.body.previewUrl).toMatch(/^https?:\/\//);
  });
});
