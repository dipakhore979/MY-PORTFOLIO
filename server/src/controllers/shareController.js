import { env } from '../config/env.js';
import { Post } from '../models/Post.js';
import { Profile } from '../models/Profile.js';
import { Project } from '../models/Project.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  ogImageUrl,
  renderNotFoundPage,
  renderSharePage,
  stripMarkdown,
  truncate,
} from '../utils/sharePage.js';

/**
 * Link-preview pages. The hosting proxy sends only social-media crawlers here
 * (see client/vercel.json); real visitors get the React app.
 */

const defaultImage = () => `${env.siteUrl}/og-image.png`;
const pageUrl = (path) => (path === '/' ? env.siteUrl : `${env.siteUrl}${path}`);

const send = (res, status, html) =>
  res
    .status(status)
    .type('html')
    .set({
      'Cache-Control': status === 200 ? 'public, max-age=300' : 'no-store',
      // These pages need one inline redirect script; nothing else may load.
      'Content-Security-Policy': "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'",
    })
    .send(html);

const loadProfile = () => Profile.findOne({ key: 'main' }).select('name role tagline description').lean();
const slugFrom = (req) => String(req.params.slug).toLowerCase().slice(0, 100);
const notFound = (res) => send(res, 404, renderNotFoundPage(env.siteUrl));

export const shareHome = asyncHandler(async (_req, res) => {
  const profile = await loadProfile();
  const siteName = profile?.name || 'Portfolio';

  send(
    res,
    200,
    renderSharePage({
      siteName,
      title: profile?.role ? `${siteName} | ${profile.role}` : siteName,
      description: truncate(profile?.tagline || profile?.description || `Portfolio of ${siteName}.`),
      url: pageUrl('/'),
      image: defaultImage(),
    }),
  );
});

export const shareBlog = asyncHandler(async (_req, res) => {
  const profile = await loadProfile();
  const siteName = profile?.name || 'Portfolio';

  send(
    res,
    200,
    renderSharePage({
      siteName,
      title: `Blog | ${siteName}`,
      description: `Articles and notes by ${siteName}.`,
      url: pageUrl('/blog'),
      image: defaultImage(),
    }),
  );
});

export const shareProject = asyncHandler(async (req, res) => {
  const [project, profile] = await Promise.all([
    Project.findOne({ slug: slugFrom(req), published: true })
      .select('title slug description image')
      .lean(),
    loadProfile(),
  ]);
  if (!project) return notFound(res);

  const siteName = profile?.name || 'Portfolio';
  return send(
    res,
    200,
    renderSharePage({
      siteName,
      title: `${project.title} | ${siteName}`,
      description: truncate(project.description),
      url: pageUrl(`/projects/${project.slug}`),
      image: ogImageUrl(project.image?.url, defaultImage()),
    }),
  );
});

export const sharePost = asyncHandler(async (req, res) => {
  const [post, profile] = await Promise.all([
    Post.findOne({ slug: slugFrom(req), published: true })
      .select('title slug excerpt content coverImage tags publishedAt createdAt')
      .lean(),
    loadProfile(),
  ]);
  if (!post) return notFound(res);

  const siteName = profile?.name || 'Portfolio';
  return send(
    res,
    200,
    renderSharePage({
      siteName,
      title: `${post.title} | ${siteName}`,
      description: truncate(post.excerpt || stripMarkdown(post.content)),
      url: pageUrl(`/blog/${post.slug}`),
      image: ogImageUrl(post.coverImage?.url, defaultImage()),
      type: 'article',
      publishedTime: new Date(post.publishedAt || post.createdAt).toISOString(),
      tags: post.tags,
    }),
  );
});
