import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { detectFileType } from '../utils/fileType.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const uploadDir = path.resolve(__dirname, '../../uploads');
export const localResumePath = path.join(uploadDir, 'resume.pdf');
export const useCloudinary = env.cloudinary.enabled;

const CLOUDINARY_RESUME_ID = 'portfolio/resume.pdf';

if (useCloudinary) {
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
    secure: true,
  });
}

const streamToCloudinary = (buffer, options) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) =>
      err ? reject(err) : resolve(result),
    );
    stream.end(buffer);
  });

/** Saves an image (Cloudinary if configured, otherwise ./uploads). */
export const saveImage = async (file, baseUrl) => {
  const ext = detectFileType(file.buffer);
  if (!ext || ext === '.pdf') throw new ApiError(400, 'Unsupported or corrupt image file');

  if (useCloudinary) {
    const result = await streamToCloudinary(file.buffer, {
      folder: 'portfolio',
      resource_type: 'image',
    });
    return { url: result.secure_url, publicId: result.public_id };
  }

  await fs.mkdir(uploadDir, { recursive: true });
  const filename = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
  await fs.writeFile(path.join(uploadDir, filename), file.buffer);
  return { url: `${baseUrl}/uploads/${filename}`, publicId: `local:${filename}` };
};

/** Deletes a previously saved image. Never throws. */
export const removeImage = async (publicId) => {
  if (!publicId) return;
  try {
    if (publicId.startsWith('local:')) {
      await fs.unlink(path.join(uploadDir, path.basename(publicId.slice(6))));
    } else if (useCloudinary) {
      await cloudinary.uploader.destroy(publicId);
    }
  } catch (err) {
    if (err.code !== 'ENOENT') console.warn('Could not remove file:', err.message);
  }
};

/** Saves the resume PDF, replacing any previous one. */
export const saveResume = async (file) => {
  if (detectFileType(file.buffer) !== '.pdf') throw new ApiError(400, 'File is not a valid PDF');

  if (useCloudinary) {
    await streamToCloudinary(file.buffer, {
      public_id: CLOUDINARY_RESUME_ID,
      resource_type: 'raw',
      overwrite: true,
      invalidate: true,
    });
    return;
  }
  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(localResumePath, file.buffer);
};

/**
 * Resolves where the resume lives:
 *  { type: 'redirect', url } | { type: 'file', path } | null
 */
export const resolveResume = async () => {
  if (env.resumeUrl) return { type: 'redirect', url: env.resumeUrl };

  if (useCloudinary) {
    try {
      const res = await cloudinary.api.resource(CLOUDINARY_RESUME_ID, { resource_type: 'raw' });
      return { type: 'redirect', url: res.secure_url };
    } catch {
      return null;
    }
  }

  try {
    await fs.access(localResumePath);
    return { type: 'file', path: localResumePath };
  } catch {
    return null;
  }
};
