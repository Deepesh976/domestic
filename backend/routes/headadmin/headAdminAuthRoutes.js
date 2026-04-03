import express from 'express';
import auth from '../../middleware/auth.js';
import roleMiddleware from '../../middleware/roleMiddleware.js';

import {
  login,
  changePassword,
} from '../../controllers/headadmin/headAdminAuthController.js';

const router = express.Router();

/* =====================================================
   HEAD ADMIN AUTH ROUTES
===================================================== */

/* =========================
   LOGIN
   POST /api/headadmin/auth/login
========================= */
router.post('/login', login);

/* =========================
   CHANGE PASSWORD
   POST /api/headadmin/auth/change-password
   - Protected
   - Only headadmin
========================= */
router.post(
  '/change-password',
  auth,
  roleMiddleware('headadmin'),
  changePassword
);

export default router;
