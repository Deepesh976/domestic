import express from 'express';
import auth from '../../middleware/auth.js';
import roleMiddleware from '../../middleware/roleMiddleware.js';
import { getCustomers } from '../../controllers/superadmin/superAdminCustomerController.js';

const router = express.Router();

// 🔐 SuperAdmin only
router.use(
  auth,
  roleMiddleware('superadmin') // ✅ lowercase
);

// VIEW ONLY
router.get('/', getCustomers);

export default router;
