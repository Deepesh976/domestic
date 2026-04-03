import express from 'express';
import auth from '../../middleware/auth.js';
import roleMiddleware from '../../middleware/roleMiddleware.js';

import {
  createPlan,
  getActivePlans,
  getArchivedPlans,
  updatePlan,
  deletePlan,
} from '../../controllers/headadmin/headAdminPlanController.js';

const router = express.Router();

/* =====================================================
   PLAN ROUTES
   Rules:
   - HeadAdmin: full access (CRUD)
   - Admin: read-only (active + archived)
===================================================== */

/* =========================
   AUTH (REQUIRED FOR ALL)
========================= */
router.use(auth);

/* =========================
   READ ACCESS
   - headadmin
   - admin
========================= */

/**
 * GET /api/headadmin/plans/active
 */
router.get(
  '/active',
  roleMiddleware('headadmin', 'admin'),
  getActivePlans
);

/**
 * GET /api/headadmin/plans/archived
 */
router.get(
  '/archived',
  roleMiddleware('headadmin', 'admin'),
  getArchivedPlans
);

/* =========================
   WRITE ACCESS
   - headadmin only
========================= */

/**
 * POST /api/headadmin/plans
 */
router.post(
  '/',
  roleMiddleware('headadmin'),
  createPlan
);

/**
 * PUT /api/headadmin/plans/:id
 */
router.put(
  '/:id',
  roleMiddleware('headadmin'),
  updatePlan
);

/**
 * DELETE /api/headadmin/plans/:id
 */
router.delete(
  '/:id',
  roleMiddleware('headadmin'),
  deletePlan
);

export default router;
