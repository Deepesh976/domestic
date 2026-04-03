import express from 'express';
import auth from '../../middleware/auth.js';
import roleMiddleware from '../../middleware/roleMiddleware.js';

import {
  login,
  changePassword,
  forgotPassword,
  resetPassword,
} from '../../controllers/headadmin/authController.js';

const router = express.Router();

/* =====================================================
   ADMIN + HEADADMIN AUTH ROUTES
===================================================== */

/* =========================
   LOGIN
   POST /api/headadmin/auth/login
========================= */
router.post('/login', login);

/* =========================
   FORGOT PASSWORD
   POST /api/headadmin/auth/forgot-password
   - Public
========================= */
router.post('/forgot-password', forgotPassword);

/* =========================
   RESET PASSWORD
   POST /api/headadmin/auth/reset-password/:token
   - Public (token based)
========================= */
router.post('/reset-password/:token', resetPassword);

/* =========================
   CHANGE PASSWORD
   POST /api/headadmin/auth/change-password
   - Protected
   - Admin + HeadAdmin
========================= */
router.post(
  '/change-password',
  auth,
  roleMiddleware('headadmin', 'admin'),
  changePassword
);

export default router;
