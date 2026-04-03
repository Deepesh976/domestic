import express from 'express';
import auth from '../../middleware/auth.js';
import roleMiddleware from '../../middleware/roleMiddleware.js';
import {
  getProfile,
  getOrganizationAdmins,
} from '../../controllers/headadmin/headAdminController.js';

const router = express.Router();

router.get(
  '/profile',
  auth,
  roleMiddleware('HEADADMIN'),
  getProfile
);

router.get(
  '/admins',
  auth,
  roleMiddleware('HEADADMIN'),
  getOrganizationAdmins
);

export default router;
