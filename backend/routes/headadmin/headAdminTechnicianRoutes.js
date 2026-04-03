import express from 'express';
import auth from '../../middleware/auth.js';
import roleMiddleware from '../../middleware/roleMiddleware.js';
import kycTechnicianUpload from '../../middleware/kycTechnicianUpload.js';

import {
  getTechnicians,
  createTechnician,
  updateTechnician,
  uploadTechnicianKyc,
} from '../../controllers/headadmin/headAdminTechnicianController.js';

const router = express.Router();

/* =====================================================
   TECHNICIAN ROUTES
===================================================== */

/**
 * GET /api/headadmin/technicians
 *
 * Access:
 *  - headadmin → full access
 *  - admin     → read-only
 */
router.get(
  '/',
  auth,
  roleMiddleware('headadmin', 'admin'),
  getTechnicians
);

/**
 * POST /api/headadmin/technicians
 *
 * Create technician
 *
 * Access:
 *  - headadmin only
 */
router.post(
  '/',
  auth,
  roleMiddleware('headadmin'),
  createTechnician
);

/**
 * PUT /api/headadmin/technicians/:id
 *
 * Update technician status / KYC approval
 *
 * Access:
 *  - headadmin only
 */
router.put(
  '/:id',
  auth,
  roleMiddleware('headadmin'),
  updateTechnician
);

/**
 * POST /api/headadmin/technicians/:id/kyc
 *
 * Upload technician KYC
 * - doc_type (body)
 * - doc_image (file)
 *
 * Access:
 *  - headadmin only
 */
router.post(
  '/:id/kyc',
  auth,
  roleMiddleware('headadmin'),
  kycTechnicianUpload.single('doc_image'),
  uploadTechnicianKyc
);

export default router;
