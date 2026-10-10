import 'dotenv/config';

const required = ['MONGODB_URI', 'JWT_SECRET'];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

const nodeEnv = process.env.NODE_ENV || 'development';
const isProd = nodeEnv === 'production';

if (isProd && process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters in production');
}

const toList = (value = '') =>
  value
    .split(',')
    .map((item) => item.trim().replace(/\/$/, ''))
    .filter(Boolean);

const sameSite = (process.env.COOKIE_SAMESITE || (isProd ? 'none' : 'lax')).toLowerCase();
if (!['lax', 'strict', 'none'].includes(sameSite)) {
  throw new Error('COOKIE_SAMESITE must be one of: lax, strict, none');
}

const jwtDays = Number(process.env.JWT_EXPIRES_DAYS) || 7;

const smtp = {
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  user: process.env.SMTP_USER,
  pass: process.env.SMTP_PASS,
  from: process.env.MAIL_FROM || process.env.SMTP_USER,
  to: process.env.CONTACT_RECEIVER || process.env.SMTP_USER,
};
smtp.enabled = Boolean(smtp.host && smtp.user && smtp.pass && smtp.to);

const cloudinary = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET,
};
const resend = {
  apiKey: process.env.RESEND_API_KEY,
  from: process.env.RESEND_FROM || 'Portfolio <onboarding@resend.dev>',
  to: process.env.CONTACT_RECEIVER || process.env.SMTP_USER,
};
resend.enabled = Boolean(resend.apiKey && resend.to);

const parseTrustProxy = (value) => {
  if (value === undefined || value === '') return 1;
  if (value === 'true') return true;
  const hops = Number(value);
  return Number.isInteger(hops) && hops >= 0 ? hops : 1;
};

cloudinary.enabled = Boolean(cloudinary.cloudName && cloudinary.apiKey && cloudinary.apiSecret);

export const env = Object.freeze({
  nodeEnv,
  isProd,
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: `${jwtDays}d`,
  cookie: {
    name: 'token',
    maxAgeMs: jwtDays * 24 * 60 * 60 * 1000,
    sameSite,
    domain: process.env.COOKIE_DOMAIN || undefined,
  },
  clientUrls: toList(process.env.CLIENT_URL || 'http://localhost:5173'),
  serverUrl: (process.env.SERVER_URL || '').replace(/\/$/, ''),
  siteUrl: (process.env.SITE_URL || toList(process.env.CLIENT_URL || 'http://localhost:5173')[0]).replace(/\/$/, ''),
  trustProxy: parseTrustProxy(process.env.TRUST_PROXY),
  smtp: Object.freeze(smtp),
  resend: Object.freeze(resend),
  mail: Object.freeze({ enabled: resend.enabled || smtp.enabled }),
  cloudinary: Object.freeze(cloudinary),
  resumeUrl: process.env.RESUME_URL || '',
  githubUsername: process.env.GITHUB_USERNAME || '',
  githubToken: process.env.GITHUB_TOKEN || '',
  seed: {
    adminName: process.env.ADMIN_NAME || 'Admin',
    adminEmail: (process.env.ADMIN_EMAIL || '').toLowerCase(),
    adminPassword: process.env.ADMIN_PASSWORD || '',
  },
});
