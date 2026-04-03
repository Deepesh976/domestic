import express from 'express';
import auth from '../../middleware/auth.js';
import roleMiddleware from '../../middleware/roleMiddleware.js';
import serviceImageUpload from '../../middleware/serviceImageUpload.js';

import {
  getServiceRequests,
  getAvailableTechnicians,
  assignTechnicianToRequest,
  updateServiceStatus,
  getServiceRequestById,
  removeTechnicianFromRequest,
} from '../../controllers/headadmin/headAdminServiceRequestController.js';

const router = express.Router();

/* =====================================================
   SERVICE REQUEST ROUTES
   Access:
   - headadmin ✅
   - admin     ✅
===================================================== */

/* =========================
   GET SERVICE REQUESTS
========================= */
router.get(
  '/',
  auth,
  roleMiddleware('headadmin', 'admin'),
  getServiceRequests
);

/* =========================
   GET AVAILABLE TECHNICIANS
   🔥 FIXED: ADMIN ALLOWED
========================= */
router.get(
  '/technicians/available',
  auth,
  roleMiddleware('headadmin', 'admin'),
  getAvailableTechnicians
);

/* =========================
   GET SINGLE SERVICE REQUEST
========================= */
router.get(
  '/:id',
  auth,
  roleMiddleware('headadmin', 'admin'),
  getServiceRequestById
);

/* =========================
   ASSIGN TECHNICIAN
   🔥 FIXED: ADMIN ALLOWED
========================= */
router.patch(
  '/:id/assign',
  auth,
  roleMiddleware('headadmin', 'admin'),
  assignTechnicianToRequest
);


/* =========================
   UPDATE SERVICE STATUS
   🔥 FIXED: ADMIN ALLOWED
========================= */
router.patch(
  '/:id/status',
  auth,
  roleMiddleware('headadmin', 'admin'),
  serviceImageUpload.array('completion_images', 5),
  updateServiceStatus
);

router.patch(
  '/:id/remove-technician',
  auth,
  roleMiddleware('headadmin', 'admin'),
  removeTechnicianFromRequest
);

export default router;
