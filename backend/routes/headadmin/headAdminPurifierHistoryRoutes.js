import express from 'express';
import auth from '../../middleware/auth.js';
import roleMiddleware from '../../middleware/roleMiddleware.js';
import {
  getPurifierHistory,
} from '../../controllers/headadmin/headAdminPurifierHistoryController.js';

const router = express.Router();

/* =====================================================
   PURIFIER HISTORY
   - HeadAdmin: full access
   - Admin: read-only access
===================================================== */

/**
 * GET /api/headadmin/purifiers/:deviceId/history
 *
 * Access:
 *  - headadmin
 *  - admin (same org)
 */
router.get(
  '/:deviceId/history',
  auth,
  roleMiddleware('headadmin', 'admin'),
  getPurifierHistory
);

export default router;
