import express from 'express';
import auth from '../../middleware/auth.js';
import roleMiddleware from '../../middleware/roleMiddleware.js';

import {
  getInstallationOrders,
  updateInstallationKycStatus,
  assignInstallationTechnician,
  removeTechnicianAssignment,
  completeInstallation,
} from '../../controllers/headadmin/headAdminInstallationOrderController.js';

const router = express.Router();

/* =====================================================
   INSTALLATION ORDER ROUTES
   WORKFLOW:
   - Status: OPEN → CLOSED
   - Assign → technician_approval_status = PENDING
   - Technician approves → technician_assigned = true
   - Admin can remove pending assignment
===================================================== */

/**
 * GET /api/headadmin/installations
 *
 * Access:
 *  - headadmin → full access
 *  - admin     → read-only
 */
router.get(
  '/',
  auth,
  roleMiddleware('headadmin', 'admin'),
  getInstallationOrders
);

/**
 * PATCH /api/headadmin/installations/:id/kyc
 *
 * Access:
 *  - headadmin only
 *
 * Body:
 *  {
 *    status: "approved" | "rejected" | "pending"
 *  }
 */
router.patch(
  '/:id/kyc',
  auth,
  roleMiddleware('headadmin'),
  updateInstallationKycStatus
);

/**
 * PUT /api/headadmin/installations/:id/assign
 *
 * Access:
 *  - headadmin only
 *
 * Conditions:
 *  - Order must be OPEN
 *  - Payment must be received
 *  - KYC must be APPROVED
 *
 * Effect:
 *  - assigned_to set
 *  - technician_approval_status = PENDING
 */
router.put(
  '/:id/assign',
  auth,
  roleMiddleware('headadmin'),
  assignInstallationTechnician
);

/**
 * PATCH /api/headadmin/installations/:id/remove-assignment
 *
 * Access:
 *  - headadmin only
 *
 * Condition:
 *  - technician_approval_status must be PENDING
 *
 * Effect:
 *  - assigned_to = null
 *  - technician_approval_status = null
 *  - technician_assigned = false
 */
router.patch(
  '/:id/remove-assignment',
  auth,
  roleMiddleware('headadmin'),
  removeTechnicianAssignment
);

/**
 * PUT /api/headadmin/installations/:id/complete
 *
 * Access:
 *  - headadmin only
 *
 * Effect:
 *  - installation_completed = true
 *  - completed_at set
 *  - status = CLOSED
 */
router.put(
  '/:id/complete',
  auth,
  roleMiddleware('headadmin'),
  completeInstallation
);

export default router;