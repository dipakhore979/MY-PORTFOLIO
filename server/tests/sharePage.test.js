import { describe, expect, it } from 'vitest';
import { ogImageUrl, renderSharePage, stripMarkdown, truncate } from '../src/utils/sharePage.js';

describe('truncate', () => {
  it('collapses whitespace and shortens long text with an ellipsis', () => {
    expect(truncate('  a   b \n c ')).toBe('a b c');
    const long = truncate('word '.repeat(100), 50);
    expect(long.length).toBe(50);
    expect(long.endsWith('…')).toBe(true);
  });
});

describe('stripMarkdown', () => {
  it('removes formatting, code blocks and image syntax', () => {
    const md = '# Title\n\nSome **bold** [link](https://x.test) text\n\n```js\nconst a = 1;\n```\n\n![alt](a.png)';
    expect(stripMarkdown(md)).toBe('Title Some bold link text');
  });
});

describe('ogImageUrl', () => {
  const fallback = 'https://site.test/og-image.png';

  it('uses the fallback for missing or non-http images', () => {
    expect(ogImageUrl('', fallback)).toBe(fallback);
    expect(ogImageUrl(undefined, fallback)).toBe(fallback);
    expect(ogImageUrl('javascript:alert(1)', fallback)).toBe(fallback);
  });

  it('leaves normal image URLs alone', () => {
    expect(ogImageUrl('https://cdn.test/a.png', fallback)).toBe('https://cdn.test/a.png');
  });

  it('crops Cloudinary images to 1200x630', () => {
    expect(ogImageUrl('https://res.cloudinary.com/demo/image/upload/v1/a.png', fallback)).toBe(
      'https://res.cloudinary.com/demo/image/upload/c_fill,w_1200,h_630,q_auto,f_jpg/v1/a.png',
    );
  });
});

describe('renderSharePage', () => {
  it('escapes everything it prints and keeps the redirect script safe', () => {
    const html = renderSharePage({
      siteName: 'S',
      title: '</title><script>alert(1)</script>',
      description: '"><img src=x onerror=alert(1)>',
      url: 'https://site.test/p?x=</script>',
      image: 'https://site.test/i.png',
    });

    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).not.toContain('<img src=x');
    // the only script is the redirect, and "<" inside its string is escaped
    expect(html.match(/<script>/g)).toHaveLength(1);
    expect(html).toContain('\\u003c/script>');
  });
});
