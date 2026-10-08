#!/usr/bin/env node
/**
 * Post-deploy smoke test. Safe to run against production: it reads public data and sends
 * deliberately invalid requests, so nothing is created or changed.
 *
 *   node scripts/smoke-test.mjs https://your-site.com/api
 *   node scripts/smoke-test.mjs http://localhost:5000/api
 */
const base = (process.argv[2] || 'http://localhost:5000/api').replace(/\/$/, '');
let failed = 0;

const check = async (label, fn) => {
  try {
    const detail = await fn();
    console.log(`PASS  ${label}${detail ? `  (${detail})` : ''}`);
  } catch (err) {
    failed += 1;
    console.log(`FAIL  ${label}  -> ${err.message}`);
  }
};

const expect = (condition, message) => {
  if (!condition) throw new Error(message);
};

const request = (path, options = {}) =>
  fetch(`${base}${path}`, { redirect: 'manual', signal: AbortSignal.timeout(90000), ...options });

console.log(`Testing ${base}\n(the first request can take ~1 minute if the host was asleep)\n`);

await check('GET /health', async () => {
  const res = await request('/health');
  expect(res.status === 200, `status ${res.status}`);
  const body = await res.json();
  expect(body.status === 'ok', 'unexpected body');
});

for (const name of ['projects', 'skills', 'experience', 'posts']) {
  await check(`GET /${name}`, async () => {
    const res = await request(`/${name}`);
    expect(res.status === 200, `status ${res.status}`);
    const body = await res.json();
    expect(Array.isArray(body.data), 'data is not an array');
    return `${body.total} item(s)`;
  });
}

await check('GET /profile', async () => {
  const res = await request('/profile');
  expect(res.status === 200, `status ${res.status}`);
  const body = await res.json();
  return body.data ? `name: ${body.data.name}` : 'no profile yet: run seed:admin';
});

await check('GET /sitemap.xml', async () => {
  const res = await request('/sitemap.xml');
  expect(res.status === 200, `status ${res.status}`);
  expect((await res.text()).includes('<urlset'), 'not a sitemap');
});

await check('GET /resume (200/302 = uploaded, 404 = none yet)', async () => {
  const res = await request('/resume');
  expect([200, 302, 404].includes(res.status), `status ${res.status}`);
  return `status ${res.status}`;
});

await check('POST /contact rejects invalid input', async () => {
  const res = await request('/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'x' }),
  });
  expect(res.status === 400, `status ${res.status}`);
});

await check('POST /auth/login rejects bad credentials', async () => {
  const res = await request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'nobody@example.com', password: 'wrong-password' }),
  });
  expect(res.status === 401, `status ${res.status}`);
});

await check('Admin routes require login', async () => {
  const res = await request('/messages');
  expect(res.status === 401, `status ${res.status}`);
});

console.log(failed ? `\n${failed} check(s) failed.` : '\nAll checks passed.');
process.exit(failed ? 1 : 0);
