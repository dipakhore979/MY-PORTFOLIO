import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

const make = (allowedMimes, label, field) =>
  multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_SIZE, files: 1 },
    fileFilter: (_req, file, cb) =>
      allowedMimes.includes(file.mimetype)
        ? cb(null, true)
        : cb(new ApiError(400, `Only ${label} files are allowed`)),
  }).single(field);

// Final validation happens on magic bytes in services/storage.js
export const uploadImage = make(
  ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  'JPEG, PNG, WebP or GIF',
  'image',
);
export const uploadResume = make(['application/pdf'], 'PDF', 'file');
