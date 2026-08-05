import express from 'express';
import auth from '../../middleware/auth.js';
import roleMiddleware from '../../middleware/roleMiddleware.js';

import {
  getRechargeTransactions,
  createRechargeTransaction,
  deleteRechargeTransaction,
  getTransactionsByUser,
} from '../../controllers/headadmin/headAdminTransactionController.js';

const router = express.Router();

/* =====================================================
   HEAD ADMIN – TRANSACTION ROUTES (FINAL)
===================================================== */


/* =========================
   GET ALL TRANSACTIONS
   - Latest first
   - Optional filter: device_id
========================= */
router.get(
  '/',
  auth,
  roleMiddleware('headadmin', 'admin'),
  getRechargeTransactions
);

/* =========================
   GET TRANSACTIONS BY USER
========================= */
router.get(
  '/user/:user_id',
  auth,
  roleMiddleware('headadmin'),
  getTransactionsByUser
);


/* =========================
   CREATE TRANSACTION
========================= */
router.post(
  '/',
  auth,
  roleMiddleware('headadmin'),
  createRechargeTransaction
);


/* =========================
   DELETE TRANSACTION
========================= */
router.delete(
  '/:id',
  auth,
  roleMiddleware('headadmin'),
  deleteRechargeTransaction
);


/* =========================
   HEALTH CHECK (OPTIONAL DEBUG)
========================= */
router.get('/test', (req, res) => {
  res.send('Transaction API working ✅');
});

export default router;