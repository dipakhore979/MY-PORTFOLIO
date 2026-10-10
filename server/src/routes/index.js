import { Router } from 'express';
import authRoutes from './authRoutes.js';
import contactRoutes from './contactRoutes.js';
import experienceRoutes from './experienceRoutes.js';
import messageRoutes from './messageRoutes.js';
import postRoutes from './postRoutes.js';
import profileRoutes from './profileRoutes.js';
import projectRoutes from './projectRoutes.js';
import resumeRoutes from './resumeRoutes.js';
import shareRoutes from './shareRoutes.js';
import skillRoutes from './skillRoutes.js';
import { sitemap } from '../controllers/sitemapController.js';
import uploadRoutes from './uploadRoutes.js';

const router = Router();

router.get('/health', (_req, res) =>
  res.json({ success: true, status: 'ok', uptime: Math.round(process.uptime()) }),
);

router.get('/sitemap.xml', sitemap);

router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/skills', skillRoutes);
router.use('/experience', experienceRoutes);
router.use('/posts', postRoutes);
router.use('/profile', profileRoutes);
router.use('/contact', contactRoutes);
router.use('/messages', messageRoutes);
router.use('/upload', uploadRoutes);
router.use('/resume', resumeRoutes);
router.use('/share', shareRoutes);

export default router;
