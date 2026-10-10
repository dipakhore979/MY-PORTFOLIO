import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import app from '../src/app.js';
import { Post } from '../src/models/Post.js';
import { Profile } from '../src/models/Profile.js';
import { Project } from '../src/models/Project.js';
import { textParser } from './helpers/auth.js';
import { clearDb, connect, disconnect } from './helpers/db.js';

const BOT = 'LinkedInBot/1.0 (compatible; Mozilla/5.0)';
const SITE = 'https://portfolio.test';

const share = (path) => request(app).get(`/api/share${path}`).set('User-Agent', BOT);
const meta = (html, name) =>
  html.match(new RegExp(`<meta (?:property|name)="${name}" content="([^"]*)">`))?.[1] ?? null;

beforeAll(connect);
beforeEach(async () => {
  await clearDb();
  await Profile.create({
    name: 'Dipak Hore',
    role: 'Full-Stack Developer',
    tagline: 'I build fast web apps.',
  });
});
afterAll(disconnect);

describe('link previews: projects', () => {
  it('returns Open Graph tags for a published project', async () => {
    await Project.create({
      title: 'Task Manager',
      slug: 'task-manager',
      description: 'A full-stack task manager.',
      image: { url: 'https://res.cloudinary.com/demo/image/upload/v1/task.png' },
    });

    const res = await share('/projects/task-manager');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/html/);
    expect(meta(res.text, 'og:title')).toBe('Task Manager | Dipak Hore');
    expect(meta(res.text, 'og:description')).toBe('A full-stack task manager.');
    expect(meta(res.text, 'og:url')).toBe(`${SITE}/projects/task-manager`);
    expect(meta(res.text, 'og:image')).toContain('c_fill,w_1200,h_630');
    expect(meta(res.text, 'twitter:card')).toBe('summary_large_image');
    expect(res.text).toContain(`<link rel="canonical" href="${SITE}/projects/task-manager">`);
  });

  it('falls back to the default share image when the project has none', async () => {
    await Project.create({ title: 'No Image', slug: 'no-image', description: 'A project without a picture.' });
    const res = await share('/projects/no-image');
    expect(meta(res.text, 'og:image')).toBe(`${SITE}/og-image.png`);
  });

  it('escapes HTML in titles', async () => {
    await Project.create({
      title: '<b>"Quoted"</b> app',
      slug: 'quoted',
      description: 'Description with <script>alert(1)</script>',
    });
    const res = await share('/projects/quoted');

    expect(res.text).not.toContain('<script>alert(1)</script>');
    expect(res.text).not.toContain('<b>"Quoted"</b>');
    expect(meta(res.text, 'og:title')).toContain('&lt;b&gt;&quot;Quoted&quot;&lt;/b&gt;');
  });

  it('finds the project whatever the case of the slug', async () => {
    await Project.create({ title: 'Task Manager', slug: 'task-manager', description: 'A task manager app.' });
    expect((await share('/projects/TASK-MANAGER')).status).toBe(200);
  });

  it('returns 404 for drafts and unknown slugs', async () => {
    await Project.create({ title: 'Secret', slug: 'secret', description: 'An unpublished draft.', published: false });
    expect((await share('/projects/secret')).status).toBe(404);
    expect((await share('/projects/does-not-exist')).status).toBe(404);
  });
});

describe('link previews: posts, home and blog', () => {
  it('marks posts as articles with their publish date and tags', async () => {
    await Post.create({
      title: 'Hello World',
      slug: 'hello-world',
      excerpt: 'My first post.',
      content: 'Body',
      tags: ['mern'],
      published: true,
    });
    const res = await share('/posts/hello-world');

    expect(res.status).toBe(200);
    expect(meta(res.text, 'og:type')).toBe('article');
    expect(meta(res.text, 'og:description')).toBe('My first post.');
    expect(meta(res.text, 'og:url')).toBe(`${SITE}/blog/hello-world`);
    expect(meta(res.text, 'article:published_time')).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(meta(res.text, 'article:tag')).toBe('mern');
  });

  it('builds the description from the content when there is no excerpt', async () => {
    await Post.create({
      title: 'No Excerpt',
      slug: 'no-excerpt',
      content: '# Heading\n\nSome **bold** words here',
      published: true,
    });
    const res = await share('/posts/no-excerpt');
    expect(meta(res.text, 'og:description')).toBe('Heading Some bold words here');
  });

  it('returns 404 for draft posts', async () => {
    await Post.create({ title: 'Draft', slug: 'draft', content: 'Body' });
    expect((await share('/posts/draft')).status).toBe(404);
  });

  it('describes the home page from the profile', async () => {
    const res = await share('/home');
    expect(meta(res.text, 'og:title')).toBe('Dipak Hore | Full-Stack Developer');
    expect(meta(res.text, 'og:description')).toBe('I build fast web apps.');
    expect(meta(res.text, 'og:url')).toBe(SITE);
  });

  it('describes the blog page', async () => {
    const res = await share('/blog');
    expect(meta(res.text, 'og:title')).toBe('Blog | Dipak Hore');
    expect(meta(res.text, 'og:url')).toBe(`${SITE}/blog`);
  });

  it('restricts what the page may load', async () => {
    const res = await share('/home');
    expect(res.headers['content-security-policy']).toContain("default-src 'none'");
  });
});

describe('sitemap.xml', () => {
  it('lists published pages only, using the public site address', async () => {
    await Project.create([
      { title: 'Live', slug: 'live-project', description: 'A published project.' },
      { title: 'Draft', slug: 'draft-project', description: 'An unpublished project.', published: false },
    ]);
    await Post.create([
      { title: 'Live post', slug: 'live-post', content: 'Body', published: true },
      { title: 'Draft post', slug: 'draft-post', content: 'Body' },
    ]);

    const res = await request(app).get('/api/sitemap.xml').buffer(true).parse(textParser);
    const xml = res.body;

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/xml/);
    expect(xml).toContain(`<loc>${SITE}/</loc>`);
    expect(xml).toContain(`<loc>${SITE}/projects/live-project</loc>`);
    expect(xml).toContain(`<loc>${SITE}/blog/live-post</loc>`);
    expect(xml).not.toContain('draft-project');
    expect(xml).not.toContain('draft-post');
  });
});
