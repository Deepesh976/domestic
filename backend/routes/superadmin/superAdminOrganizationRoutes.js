import express from 'express';
import auth from '../../middleware/auth.js';
import roleMiddleware from '../../middleware/roleMiddleware.js';
import {
  createOrganization,
  getOrganizations,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
} from '../../controllers/superadmin/superAdminOrganizationController.js';

// ✅ Multer middleware for logo upload
import { uploadOrgLogo } from '../../middleware/orgUpload.js';

const router = express.Router();

/* =====================================================
   SUPERADMIN PROTECTION
===================================================== */
router.use(auth, roleMiddleware('superadmin')); // ✅ lowercase (matches auth.js)

/* =====================================================
   ROUTES
===================================================== */

// CREATE organization (with logo upload)
router.post(
  '/',
  uploadOrgLogo.single('logo'),
  createOrganization
);

// GET all organizations
router.get('/', getOrganizations);

// GET organization by ID
router.get('/:id', getOrganizationById);

// UPDATE organization (optional logo replace)
router.put(
  '/:id',
  uploadOrgLogo.single('logo'),
  updateOrganization
);

// DELETE organization (also deletes logo file)
router.delete('/:id', deleteOrganization);

export default router;
