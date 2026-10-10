import { describe, expect, it } from 'vitest';
import { escapeHtml, escapeRegex } from '../src/utils/escape.js';
import { detectFileType } from '../src/utils/fileType.js';
import { slugify } from '../src/utils/slug.js';

describe('slugify', () => {
  it('lowercases and hyphenates', () => {
    expect(slugify('Hello, World!')).toBe('hello-world');
  });

  it('removes accents', () => {
    expect(slugify('  Crème Brûlée  ')).toBe('creme-brulee');
  });

  it('never returns an empty slug', () => {
    expect(slugify('!!!')).toBe('item');
    expect(slugify('')).toBe('item');
  });

  it('caps the length without a trailing hyphen', () => {
    const slug = slugify(`${'a'.repeat(79)} b`);
    expect(slug.length).toBeLessThanOrEqual(80);
    expect(slug.endsWith('-')).toBe(false);
  });
});

describe('escaping', () => {
  it('escapes regular-expression characters', () => {
    expect(escapeRegex('a.b*c(d)')).toBe('a\\.b\\*c\\(d\\)');
    expect(new RegExp(`^${escapeRegex('.*')}$`).test('anything')).toBe(false);
  });

  it('escapes HTML', () => {
    expect(escapeHtml(`<img src="x" onerror='y'>&`)).toBe(
      '&lt;img src=&quot;x&quot; onerror=&#39;y&#39;&gt;&amp;',
    );
  });
});

describe('detectFileType', () => {
  const pad = (bytes) => Buffer.concat([Buffer.from(bytes), Buffer.alloc(16)]);

  it('recognises supported formats by their first bytes', () => {
    expect(detectFileType(pad([0xff, 0xd8, 0xff, 0xe0]))).toBe('.jpg');
    expect(detectFileType(pad([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe('.png');
    expect(detectFileType(pad(Buffer.from('GIF89a')))).toBe('.gif');
    expect(detectFileType(pad(Buffer.from('%PDF-1.7')))).toBe('.pdf');
    expect(
      detectFileType(Buffer.concat([Buffer.from('RIFF'), Buffer.alloc(4), Buffer.from('WEBP')])),
    ).toBe('.webp');
  });

  it('rejects everything else', () => {
    expect(detectFileType(Buffer.from('just some text, not an image'))).toBeNull();
    expect(detectFileType(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>'))).toBeNull();
    expect(detectFileType(Buffer.alloc(4))).toBeNull();
    expect(detectFileType(null)).toBeNull();
  });
});
