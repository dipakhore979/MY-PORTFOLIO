import { Helmet } from 'react-helmet-async';
import { useSite } from '../../context/ProfileContext';

/**
 * Per-page <head> tags: title, description, canonical, Open Graph, Twitter, JSON-LD.
 * `path` is the page's path (e.g. "/projects/my-app") used for the canonical URL.
 */
export default function Seo({
  title,
  description,
  path = '/',
  image,
  type = 'website',
  noindex = false,
  jsonLd,
}) {
  const site = useSite();
  const fullTitle = title ? `${title} | ${site.name}` : `${site.name} | ${site.role}`;
  const url = `${site.url}${path === '/' ? '' : path}` || site.url;
  const metaDescription = description || site.description;
  const ogImage = image || `${site.url}/og-image.png`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={site.name} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={ogImage} />

      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  );
}
