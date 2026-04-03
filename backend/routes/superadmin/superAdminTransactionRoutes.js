import express from 'express';
import auth from '../../middleware/auth.js';
import roleMiddleware from '../../middleware/roleMiddleware.js';
import { getTransactions } from '../../controllers/superadmin/superAdminTransactionController.js';

const router = express.Router();

// 🔐 SuperAdmin only
router.use(
  auth,
  roleMiddleware('superadmin') // ✅ lowercase
);

/* =========================
   TRANSACTIONS (READ ONLY)
========================= */
router.get('/', getTransactions);

export default router;
