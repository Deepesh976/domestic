import express from 'express';
import auth from '../../middleware/auth.js';
import roleMiddleware from '../../middleware/roleMiddleware.js';
import kycUpload from '../../middleware/kycUpload.js';

import {
  createAdmin,
  getAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
} from '../../controllers/superadmin/superAdminAdminController.js';

const router = express.Router();

router.use(auth, roleMiddleware('superadmin'));

// ✅ CREATE (with image)
router.post(
  '/',
  kycUpload.single('kyc_image'),
  createAdmin
);

// ✅ UPDATE (with image)
router.put(
  '/:id',
  kycUpload.single('kyc_image'),
  updateAdmin
);

router.get('/', getAdmins);
router.get('/:id', getAdminById);
router.delete('/:id', deleteAdmin);

export default router;
