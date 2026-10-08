import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { verifyToken } from '../utils/token.js';

const readUser = async (req) => {
  const token = req.cookies?.[env.cookie.name];
  if (!token) return null;
  const payload = verifyToken(token);
  return User.findById(payload.sub);
};

/** Requires a valid session cookie. */
export const protect = asyncHandler(async (req, _res, next) => {
  let user;
  try {
    user = await readUser(req);
  } catch {
    throw new ApiError(401, 'Session expired or invalid. Please log in again.');
  }
  if (!user) throw new ApiError(401, 'Authentication required');
  req.user = user;
  next();
});

/** Attaches req.user when a valid session exists, otherwise continues anonymously. */
export const optionalAuth = asyncHandler(async (req, _res, next) => {
  try {
    req.user = (await readUser(req)) || undefined;
  } catch {
    req.user = undefined;
  }
  next();
});
