import Joi from 'joi';
import { EXPERIENCE_TYPES, SKILL_CATEGORIES } from '../utils/constants.js';

const httpUrl = Joi.string().trim().uri({ scheme: ['http', 'https'] }).max(500).allow('');
const text = (max) => Joi.string().trim().max(max).allow('');
const image = Joi.object({
  url: httpUrl,
  publicId: Joi.string().trim().max(300).allow(''),
});
const slug = Joi.string()
  .trim()
  .lowercase()
  .max(100)
  .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  .messages({ 'string.pattern.base': 'slug may only contain lowercase letters, numbers and hyphens' });
const tagList = Joi.array().items(Joi.string().trim().min(1).max(40)).max(30);
const order = Joi.number().integer().min(-1000).max(100000);

// ---------- generic list query ----------
export const listQuerySchema = Joi.object({
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
  tech: Joi.string().trim().max(40),
  tag: Joi.string().trim().max(40),
  category: Joi.string().valid(...SKILL_CATEGORIES),
  type: Joi.string().valid(...EXPERIENCE_TYPES),
  featured: Joi.boolean(),
  unread: Joi.boolean(),
});

// ---------- auth ----------
export const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().min(1).max(128).required(),
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().min(1).max(128).required(),
  newPassword: Joi.string().min(10).max(128).required(),
});

// ---------- contact / messages ----------
export const contactSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80).required(),
  email: Joi.string().trim().lowercase().email().max(254).required(),
  subject: text(150),
  message: Joi.string().trim().min(10).max(3000).required(),
  website: Joi.string().max(200).allow(''), // honeypot: real users leave this empty
});

export const messageUpdateSchema = Joi.object({
  read: Joi.boolean().required(),
});

// ---------- projects ----------
const projectBase = Joi.object({
  title: Joi.string().trim().min(2).max(120),
  slug,
  description: Joi.string().trim().min(10).max(500),
  content: text(20000),
  image,
  tech: tagList,
  liveUrl: httpUrl,
  githubUrl: httpUrl,
  featured: Joi.boolean(),
  order,
  published: Joi.boolean(),
});
export const projectCreateSchema = projectBase.fork(['title', 'description'], (s) => s.required());
export const projectUpdateSchema = projectBase.min(1);

// ---------- skills ----------
const skillBase = Joi.object({
  name: Joi.string().trim().min(1).max(50),
  category: Joi.string().valid(...SKILL_CATEGORIES),
  level: Joi.number().integer().min(0).max(100),
  icon: text(50),
  order,
});
export const skillCreateSchema = skillBase.fork(['name', 'category'], (s) => s.required());
export const skillUpdateSchema = skillBase.min(1);

// ---------- experience ----------
const experienceBase = Joi.object({
  type: Joi.string().valid(...EXPERIENCE_TYPES),
  title: Joi.string().trim().min(2).max(120),
  organization: Joi.string().trim().min(2).max(120),
  location: text(120),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso().allow(null, ''),
  current: Joi.boolean(),
  description: text(2000),
  order,
});
export const experienceCreateSchema = experienceBase.fork(
  ['title', 'organization', 'startDate'],
  (s) => s.required(),
);
export const experienceUpdateSchema = experienceBase.min(1);

// ---------- posts ----------
const postBase = Joi.object({
  title: Joi.string().trim().min(2).max(150),
  slug,
  excerpt: text(300),
  content: Joi.string().min(1).max(50000),
  coverImage: image,
  tags: tagList,
  published: Joi.boolean(),
});
export const postCreateSchema = postBase.fork(['title', 'content'], (s) => s.required());
export const postUpdateSchema = postBase.min(1);

// ---------- profile ----------
export const profileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80),
  role: Joi.string().trim().min(2).max(120),
  tagline: text(300),
  description: text(300),
  bio: text(3000),
  photo: image,
  email: Joi.string().trim().lowercase().email().max(254).allow(''),
  github: httpUrl,
  linkedin: httpUrl,
}).min(1);
