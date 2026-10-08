import rateLimit from 'express-rate-limit';

const make = (windowMs, limit, message) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { success: false, message },
  });

export const apiLimiter = make(15 * 60 * 1000, 300, 'Too many requests, please try again later.');
export const loginLimiter = make(15 * 60 * 1000, 10, 'Too many login attempts, try again in 15 minutes.');
export const contactLimiter = make(60 * 60 * 1000, 5, 'Too many messages sent, please try again later.');
