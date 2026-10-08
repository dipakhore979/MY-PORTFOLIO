import { env } from '../config/env.js';
import { Post } from '../models/Post.js';
import { Project } from '../models/Project.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { escapeHtml as escapeXml } from '../utils/escape.js';

const urlEntry = (path, lastmod, priority) => `  <url>
    <loc>${escapeXml(env.siteUrl + path)}</loc>${lastmod ? `\n    <lastmod>${new Date(lastmod).toISOString()}</lastmod>` : ''}
    <priority>${priority}</priority>
  </url>`;

/** Dynamic sitemap built from published projects and posts. */
export const sitemap = asyncHandler(async (_req, res) => {
  const [projects, posts] = await Promise.all([
    Project.find({ published: true }).select('slug updatedAt').lean(),
    Post.find({ published: true }).select('slug updatedAt').lean(),
  ]);

  const entries = [
    urlEntry('/', undefined, '1.0'),
    urlEntry('/blog', undefined, '0.7'),
    ...projects.map((p) => urlEntry(`/projects/${p.slug}`, p.updatedAt, '0.8')),
    ...posts.map((p) => urlEntry(`/blog/${p.slug}`, p.updatedAt, '0.6')),
  ];

  res
    .type('application/xml')
    .set('Cache-Control', 'public, max-age=3600')
    .send(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`,
    );
});
