export const slugify = (text = '') =>
  text
    .toString()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '') || 'item';

/** Returns a slug that is unique within the model's collection. */
export const uniqueSlug = async (Model, text, excludeId) => {
  const base = slugify(text);
  let slug = base;
  let n = 1;
  const taken = (candidate) =>
    Model.exists({ slug: candidate, ...(excludeId && { _id: { $ne: excludeId } }) });
  while (await taken(slug)) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
};
