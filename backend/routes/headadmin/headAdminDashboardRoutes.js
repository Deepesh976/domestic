import express from 'express';
import auth from '../../middleware/auth.js';
import roleMiddleware from '../../middleware/roleMiddleware.js';
import { getDashboard } from '../../controllers/headadmin/headAdminDashboardController.js';

const router = express.Router();

router.get(
  '/',
  auth,
  roleMiddleware('headadmin', 'admin'),
  getDashboard
);

export default router;
