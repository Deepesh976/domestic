import express from 'express';
import auth from '../../middleware/auth.js';
import roleMiddleware from '../../middleware/roleMiddleware.js';

import {
  getPurifiers,
} from '../../controllers/headadmin/headAdminPurifierController.js';

import {
  getPurifierHistory,
} from '../../controllers/headadmin/headAdminPurifierHistoryController.js';

const router = express.Router();

/* =========================
   PURIFIERS LIST
========================= */
router.get(
  '/',
  auth,
  roleMiddleware('headadmin', 'admin'),
  getPurifiers
);

/* =========================
   PURIFIER HISTORY
========================= */
router.get(
  '/:deviceId/history',
  auth,
  roleMiddleware('headadmin', 'admin'),
  getPurifierHistory
);

export default router;
