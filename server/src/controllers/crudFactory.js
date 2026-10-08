import mongoose from 'mongoose';
import { removeImage } from '../services/storage.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uniqueSlug } from '../utils/slug.js';

/**
 * Builds list/getOne/create/update/remove handlers for a model.
 *
 * Options:
 *  label        Human name used in messages ("Project")
 *  slugSource   Field used to generate a slug (enables lookup by slug)
 *  publicFilter Extra filter applied to anonymous visitors (e.g. { published: true })
 *  publicSelect Mongoose select string applied to anonymous list requests
 *  sort         Default sort
 *  imageFields  Fields shaped like { url, publicId } that should be cleaned up
 *  buildFilter  (query) => extra filter derived from validated query params
 */
export const createCrudController = (
  Model,
  {
    label,
    slugSource,
    publicFilter = {},
    publicSelect = '',
    sort = { createdAt: -1 },
    imageFields = [],
    buildFilter = () => ({}),
  },
) => {
  const isAdmin = (req) => Boolean(req.user);

  const list = asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 50;
    const filter = { ...(isAdmin(req) ? {} : publicFilter), ...buildFilter(req.query) };

    const query = Model.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);
    if (!isAdmin(req) && publicSelect) query.select(publicSelect);

    const [data, total] = await Promise.all([query.lean(), Model.countDocuments(filter)]);
    res.json({
      success: true,
      count: data.length,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      data,
    });
  });

  const getOne = asyncHandler(async (req, res) => {
    const param = req.params.idOrSlug;
    let lookup;
    if (mongoose.isValidObjectId(param)) lookup = { _id: param };
    else if (slugSource) lookup = { slug: String(param).toLowerCase() };
    else throw new ApiError(404, `${label} not found`);

    const doc = await Model.findOne({ ...lookup, ...(isAdmin(req) ? {} : publicFilter) });
    if (!doc) throw new ApiError(404, `${label} not found`);
    res.json({ success: true, data: doc });
  });

  const create = asyncHandler(async (req, res) => {
    const body = { ...req.body };
    if (slugSource) body.slug = await uniqueSlug(Model, body.slug || body[slugSource]);
    const doc = await Model.create(body);
    res.status(201).json({ success: true, data: doc });
  });

  const update = asyncHandler(async (req, res) => {
    const doc = await Model.findById(req.params.id);
    if (!doc) throw new ApiError(404, `${label} not found`);

    const previousImages = imageFields.map((field) => doc[field]?.publicId);
    const body = { ...req.body };

    if (slugSource && body.slug && body.slug !== doc.slug) {
      body.slug = await uniqueSlug(Model, body.slug, doc._id);
    }

    doc.set(body);
    await doc.save();

    imageFields.forEach((field, i) => {
      const previous = previousImages[i];
      if (previous && previous !== doc[field]?.publicId) removeImage(previous);
    });

    res.json({ success: true, data: doc });
  });

  const remove = asyncHandler(async (req, res) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) throw new ApiError(404, `${label} not found`);
    imageFields.forEach((field) => removeImage(doc[field]?.publicId));
    res.json({ success: true, message: `${label} deleted` });
  });

  return { list, getOne, create, update, remove };
};
