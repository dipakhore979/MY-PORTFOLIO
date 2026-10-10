import { Router } from 'express';
import {
  shareBlog,
  shareHome,
  sharePost,
  shareProject,
} from '../controllers/shareController.js';

const router = Router();

router.get('/home', shareHome);
router.get('/blog', shareBlog);
router.get('/projects/:slug', shareProject);
router.get('/posts/:slug', sharePost);

export default router;
