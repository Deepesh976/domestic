import express from 'express';
import auth from '../../middleware/auth.js';
import roleMiddleware from '../../middleware/roleMiddleware.js';
import kycCustomerUpload from '../../middleware/kycCustomerUpload.js';

import {
  getCustomers,
  getCustomerById,
  createCustomer,
  deleteCustomer,
  updateCustomer,
  updateKycStatus,
  updateDeviceStatus,
  uploadCustomerKyc,
} from '../../controllers/headadmin/headAdminCustomerController.js';

const router = express.Router();

/* =====================================================
   HEAD ADMIN – CUSTOMER ROUTES (FINAL)
===================================================== */


/* =========================
   GET ALL CUSTOMERS
   - Supports latest-first sorting (backend)
========================= */
router.get(
  '/',
  auth,
  roleMiddleware('headadmin', 'admin'),
  getCustomers
);


/* =========================
   GET SINGLE CUSTOMER
========================= */
router.get(
  '/:id',
  auth,
  roleMiddleware('headadmin', 'admin'),
  getCustomerById
);


/* =========================
   CREATE CUSTOMER
   - Triggered from "Create User" button
   - UUID auto generated in model
========================= */
router.post(
  '/',
  auth,
  roleMiddleware('headadmin'),
  createCustomer
);


/* =========================
   DELETE CUSTOMER
========================= */
router.delete(
  '/:id',
  auth,
  roleMiddleware('headadmin'),
  deleteCustomer
);


/* =========================
   UPDATE KYC STATUS
========================= */
router.patch(
  '/:id/kyc',
  auth,
  roleMiddleware('headadmin'),
  updateKycStatus
);


/* =========================
   UPLOAD CUSTOMER KYC
========================= */
router.post(
  '/:id/kyc-upload',
  auth,
  roleMiddleware('headadmin'),
  kycCustomerUpload.single('doc_image'),
  uploadCustomerKyc
);


/* =========================
   UPDATE DEVICE STATUS
========================= */
router.patch(
  '/:id/device-status',
  auth,
  roleMiddleware('headadmin'),
  updateDeviceStatus
);


router.put(
  '/:id',
  auth,
  roleMiddleware('headadmin'),
  updateCustomer
);

export default router;