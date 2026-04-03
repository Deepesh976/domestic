import express from 'express';
import { getRechargedPlans } from '../../controllers/headadmin/headAdminRechargedPlanController.js';
import authMiddleware from '../../middleware/auth.js'; // ✅ FIXED
import roleMiddleware from '../../middleware/roleMiddleware.js';

const router = express.Router();

router.get(
  '/',
  authMiddleware,
  roleMiddleware('headadmin'),
  getRechargedPlans
);

export default router;
