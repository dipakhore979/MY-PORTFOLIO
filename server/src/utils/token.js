import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const signToken = (userId) =>
  jwt.sign({ sub: String(userId) }, env.jwtSecret, {
    algorithm: 'HS256',
    expiresIn: env.jwtExpiresIn,
  });

export const verifyToken = (token) =>
  jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] });

const baseCookieOptions = () => ({
  httpOnly: true,
  secure: env.isProd || env.cookie.sameSite === 'none',
  sameSite: env.cookie.sameSite,
  domain: env.cookie.domain,
  path: '/',
});

export const setAuthCookie = (res, token) =>
  res.cookie(env.cookie.name, token, { ...baseCookieOptions(), maxAge: env.cookie.maxAgeMs });

export const clearAuthCookie = (res) => res.clearCookie(env.cookie.name, baseCookieOptions());
