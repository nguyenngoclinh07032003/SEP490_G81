import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

// 1. Tuyến đường công khai (Public routes - KHÔNG dùng verifyToken)
router.post('/register', authController.register);
router.post('/login', authController.login);

// 2. Tuyến đường yêu cầu xác thực (Protected routes - BẮT BUỘC có token hợp lệ)
router.post('/logout', verifyToken, authController.logout);
router.get('/me', verifyToken, authController.getMe);

export default router;
