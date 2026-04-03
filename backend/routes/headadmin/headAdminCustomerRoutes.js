import express from 'express';
import auth from '../../middleware/auth.js';
import roleMiddleware from '../../middleware/roleMiddleware.js';

import kycCustomerUpload from '../../middleware/kycCustomerUpload.js';
import {
  getCustomers,
  updateKycStatus,
  updateDeviceStatus,
  uploadCustomerKyc,
} from '../../controllers/headadmin/headAdminCustomerController.js';


const router = express.Router();

/* =====================================================
   CUSTOMER ROUTES
   - HeadAdmin: full access
   - Admin: read-only access
===================================================== */

/**
 * GET /api/headadmin/customers
 * Access:
 *  - headadmin
 *  - admin (read-only)
 */
router.get(
  '/',
  auth,
  roleMiddleware('headadmin', 'admin'),
  getCustomers
);

/**
 * PATCH /api/headadmin/customers/:id/kyc
 * Access:
 *  - headadmin only
 */
router.patch(
  '/:id/kyc',
  auth,
  roleMiddleware('headadmin'),
  updateKycStatus
);

/**
 * POST /api/headadmin/customers/:id/kyc-upload
 * Access:
 *  - headadmin only
 */
router.post(
  '/:id/kyc-upload',
  auth,
  roleMiddleware('headadmin'),
  kycCustomerUpload.single('doc_image'),
  uploadCustomerKyc
);


/**
 * PATCH /api/headadmin/customers/:id/device-status
 * Access:
 *  - headadmin only
 */
router.patch(
  '/:id/device-status',
  auth,
  roleMiddleware('headadmin'),
  updateDeviceStatus
);

export default router;
