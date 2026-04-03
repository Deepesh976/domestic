import express from 'express';
import auth from '../../middleware/auth.js';
import roleMiddleware from '../../middleware/roleMiddleware.js';
import mongoose from 'mongoose';
import kycUpload from '../../middleware/kycUpload.js';

import {
  getAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
} from '../../controllers/headadmin/headAdminAdminController.js';

const router = express.Router();

/* =========================
   AUTH + ROLE
========================= */
router.use(auth, roleMiddleware('headadmin'));

/* =========================
   VALIDATE ADMIN ID
========================= */
const validateAdminId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.adminId)) {
    return res.status(400).json({ message: 'Invalid admin ID' });
  }
  next();
};

/* =========================
   ROUTES
========================= */

router.get('/', getAdmins);

router.post(
  '/',
  kycUpload.single('kyc_image'), // 🔥 IMPORTANT
  createAdmin
);

router.put(
  '/:adminId',
  validateAdminId,
  kycUpload.single('kyc_image'),
  updateAdmin
);

router.delete('/:adminId', validateAdminId, deleteAdmin);

export default router;
