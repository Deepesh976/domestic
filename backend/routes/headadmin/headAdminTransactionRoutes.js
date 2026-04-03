import express from 'express';
import auth from '../../middleware/auth.js';
import roleMiddleware from '../../middleware/roleMiddleware.js';
import {
  getRechargeTransactions,
} from '../../controllers/headadmin/headAdminTransactionController.js';

const router = express.Router();

/* =====================================================
   TRANSACTION ROUTES
   - HeadAdmin: full access
   - Admin: read-only access
===================================================== */

/**
 * GET /api/headadmin/transactions
 *
 * Access:
 *  - headadmin → full access
 *  - admin     → read-only access
 */
router.get(
  '/',
  auth,
  roleMiddleware('headadmin', 'admin'),
  getRechargeTransactions
);

export default router;
