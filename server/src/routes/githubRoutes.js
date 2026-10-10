import { Router } from 'express';
import { getGithub } from '../controllers/githubController.js';

const router = Router();

router.get('/', getGithub);

export default router;
