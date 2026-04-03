import express from 'express';
import auth from '../../middleware/auth.js';

import {
  superAdminRegister,
  superAdminLogin,
  changeSuperAdminPassword,
  forgotSuperAdminPassword,
  resetSuperAdminPassword,
} from '../../controllers/superadmin/superAdminAuthController.js';

const router = express.Router();

/* =====================================================
   SUPER ADMIN AUTH ROUTES
===================================================== */

/* =========================
   REGISTER
   POST /api/superadmin/auth/register
========================= */
router.post('/register', superAdminRegister);

/* =========================
   LOGIN
   POST /api/superadmin/auth/login
========================= */
router.post('/login', superAdminLogin);

/* =========================
   FORGOT PASSWORD
   POST /api/superadmin/auth/forgot-password
   - Public
========================= */
router.post('/forgot-password', forgotSuperAdminPassword);

/* =========================
   RESET PASSWORD
   POST /api/superadmin/auth/reset-password/:token
   - Public (token based)
========================= */
router.post('/reset-password/:token', resetSuperAdminPassword);

/* =========================
   CHANGE PASSWORD
   POST /api/superadmin/auth/change-password
   - Protected
========================= */
router.post('/change-password', auth, changeSuperAdminPassword);

export default router;
