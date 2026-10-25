import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';

const router = Router();

// Gom các route con vào đầu mối quản lý tập trung
router.use('/', healthRoutes);     // => /api/health
router.use('/auth', authRoutes);   // => /api/auth (register, login, logout, me)

export default router;
