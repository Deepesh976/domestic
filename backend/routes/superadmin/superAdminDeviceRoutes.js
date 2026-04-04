import express from 'express';
import auth from '../../middleware/auth.js';
import roleMiddleware from '../../middleware/roleMiddleware.js';
import {
  createDevice,
  getDevices,
  deleteDevice,
} from '../../controllers/superadmin/superAdminDeviceController.js';

const router = express.Router();

// 🔐 SuperAdmin only
router.use(auth, roleMiddleware('superadmin'));

router.post('/', createDevice);
router.get('/', getDevices);
router.delete('/:id', deleteDevice);

export default router;
