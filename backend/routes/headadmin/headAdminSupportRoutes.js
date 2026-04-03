import express from 'express';
import auth from '../../middleware/auth.js';
import roleMiddleware from '../../middleware/roleMiddleware.js';

import {
  getSupport,
  createSupport,
  updateSupport,
  deleteSupport,
} from '../../controllers/headadmin/headAdminSupportController.js';

const router = express.Router();

/* =====================================================
   SUPPORT ROUTES
   - HeadAdmin: full access
   - Admin: read-only access
===================================================== */

/**
 * GET /api/headadmin/support
 *
 * Access:
 *  - headadmin → full access
 *  - admin     → read-only access
 */
router.get(
  '/',
  auth,
  roleMiddleware('headadmin', 'admin'),
  getSupport
);

/**
 * POST /api/headadmin/support
 *
 * Access:
 *  - headadmin only
 */
router.post(
  '/',
  auth,
  roleMiddleware('headadmin'),
  createSupport
);

/**
 * PUT /api/headadmin/support
 *
 * Access:
 *  - headadmin only
 */
router.put(
  '/',
  auth,
  roleMiddleware('headadmin'),
  updateSupport
);

/**
 * DELETE /api/headadmin/support
 *
 * Access:
 *  - headadmin only
 */
router.delete(
  '/',
  auth,
  roleMiddleware('headadmin'),
  deleteSupport
);

export default router;
