import { Profile } from '../models/Profile.js';
import { removeImage } from '../services/storage.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/** Public: returns the profile, or null if it has not been created yet. */
export const getProfile = asyncHandler(async (_req, res) => {
  const profile = await Profile.findOne({ key: 'main' }).lean();
  res.json({ success: true, data: profile });
});

/** Admin: creates or updates the single profile document. */
export const updateProfile = asyncHandler(async (req, res) => {
  const existing = await Profile.findOne({ key: 'main' });
  const previousPhoto = existing?.photo?.publicId;

  const profile = await Profile.findOneAndUpdate(
    { key: 'main' },
    { $set: req.body },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  );

  if (previousPhoto && previousPhoto !== profile.photo?.publicId) removeImage(previousPhoto);

  res.json({ success: true, data: profile });
});
