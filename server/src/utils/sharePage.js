import { escapeHtml } from './escape.js';

/** Collapses whitespace and cuts text to `max` characters. */
export const truncate = (text, max = 200) => {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
};

/** Rough Markdown -> plain text, good enough for a preview description. */
export const stripMarkdown = (markdown = '') =>
  String(markdown)
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~|]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const CLOUDINARY_MARKER = '/image/upload/';

/**
 * Picks the image for a link preview. Cloudinary images are cropped to the
 * 1200x630 shape every platform expects; other URLs are used as they are.
 */
export const ogImageUrl = (url, fallback) => {
  if (!url || !/^https?:\/\//i.test(url)) return fallback;
  if (url.includes('res.cloudinary.com') && url.includes(CLOUDINARY_MARKER)) {
    return url.replace(CLOUDINARY_MARKER, `${CLOUDINARY_MARKER}c_fill,w_1200,h_630,q_auto,f_jpg/`);
  }
  return url;
};

/**
 * HTML served to link-preview bots. People who land here are sent on to the real page.
 * Every dynamic value is escaped.
 */
export const renderSharePage = ({
  siteName,
  title,
  description,
  url,
  image,
  type = 'website',
  publishedTime,
  tags = [],
}) => {
  const e = escapeHtml;
  const target = JSON.stringify(url).replace(/</g, '\\u003c');

  const head = [
    `<title>${e(title)}</title>`,
    `<meta name="description" content="${e(description)}">`,
    `<link rel="canonical" href="${e(url)}">`,
    `<meta property="og:site_name" content="${e(siteName)}">`,
    `<meta property="og:type" content="${e(type)}">`,
    `<meta property="og:title" content="${e(title)}">`,
    `<meta property="og:description" content="${e(description)}">`,
    `<meta property="og:url" content="${e(url)}">`,
    `<meta property="og:image" content="${e(image)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${e(title)}">`,
    `<meta name="twitter:description" content="${e(description)}">`,
    `<meta name="twitter:image" content="${e(image)}">`,
    publishedTime && `<meta property="article:published_time" content="${e(publishedTime)}">`,
    ...tags.map((tag) => `<meta property="article:tag" content="${e(tag)}">`),
  ].filter(Boolean);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    ${head.join('\n    ')}
  </head>
  <body>
    <h1>${e(title)}</h1>
    <p>${e(description)}</p>
    <p><a href="${e(url)}">Open the page</a></p>
    <script>location.replace(${target});</script>
  </body>
</html>
`;
};

export const renderNotFoundPage = (homeUrl) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Not found</title>
    <meta name="robots" content="noindex">
  </head>
  <body>
    <h1>Not found</h1>
    <p><a href="${escapeHtml(homeUrl)}">Go to the home page</a></p>
  </body>
</html>
`;
