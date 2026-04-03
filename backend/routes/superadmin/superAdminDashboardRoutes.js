import express from 'express';
import { getDashboardSummary } from '../../controllers/superadmin/superAdminDashboardController.js';
import auth from '../../middleware/auth.js';
import roleMiddleware from '../../middleware/roleMiddleware.js';

const router = express.Router();

/**
 * GET /api/superadmin/dashboard/summary
 * Query: organizationId, year
 * Role: superadmin
 */
router.get(
  '/summary',
  auth,
  roleMiddleware('superadmin'),
  getDashboardSummary
);

export default router;
