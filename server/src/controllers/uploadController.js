import { env } from '../config/env.js';
import { resolveResume, saveImage, saveResume } from '../services/storage.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const baseUrl = (req) => env.serverUrl || `${req.protocol}://${req.get('host')}`;

export const uploadImageHandler = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No image uploaded (field name must be "image")');
  const data = await saveImage(req.file, baseUrl(req));
  res.status(201).json({ success: true, data });
});

export const uploadResumeHandler = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No file uploaded (field name must be "file")');
  await saveResume(req.file);
  res.status(201).json({ success: true, message: 'Resume updated' });
});

export const downloadResume = asyncHandler(async (_req, res) => {
  const resume = await resolveResume();
  if (!resume) throw new ApiError(404, 'Resume not available yet');

  if (resume.type === 'redirect') return res.redirect(302, resume.url);
  return res.download(resume.path, 'resume.pdf');
});
