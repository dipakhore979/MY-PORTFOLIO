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

export const downloadResume = asyncHandler(async (req, res) => {
  const resume = await resolveResume();
  if (!resume) throw new ApiError(404, 'Resume not available yet');

  if (resume.type === 'redirect') return res.redirect(302, resume.url);

  if (req.query.inline) {
    // Shown inside the site's resume preview frame: allow framing by the site only
    res.removeHeader('X-Frame-Options');
    res.set('Content-Security-Policy', `frame-ancestors 'self' ${env.clientUrls.join(' ')}`);
    return res.sendFile(resume.path, {
      headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': 'inline; filename="resume.pdf"' },
    });
  }
  return res.download(resume.path, 'resume.pdf');
});

/** Tells the site whether a resume exists and where its preview can be loaded from. */
export const resumeInfo = asyncHandler(async (req, res) => {
  const resume = await resolveResume();
  if (!resume) return res.json({ success: true, available: false });

  const previewUrl =
    resume.type === 'redirect' ? resume.url : `${baseUrl(req)}/api/resume?inline=1`;
  return res.json({ success: true, available: true, previewUrl });
});
