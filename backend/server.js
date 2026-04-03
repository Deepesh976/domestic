/*************************************************
 *  SERVER ENTRY POINT
 *  Project: Domestic
 *************************************************/

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') }); // 🔥 MUST be first

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import multer from 'multer';

import connectDB from './config/db.js';

const app = express();

/* =========================
   ENV VALIDATION
========================= */
if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET missing in environment variables');
  process.exit(1);
}

/* =========================
   CORS CONFIG (BUILDER + DEV + PROD SAFE)
========================= */

// Explicit allowed origins (prod / fixed ports)
const allowedOrigins = [
  'http://localhost:3000', // normal React dev
  process.env.CLIENT_URL,  // production frontend
].filter(Boolean);

// Builder runs on random localhost ports
const isLocalhost = (origin) =>
  origin && origin.startsWith('http://localhost');

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (Postman, mobile apps)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin) || isLocalhost(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error(`CORS blocked for origin: ${origin}`)
      );
    },
    credentials: true,
  })
);

/* =========================
   BODY PARSERS
========================= */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/* =========================
   LOGGER (DEV ONLY)
========================= */
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

/* =========================
   STATIC FILES (UPLOADS)
========================= */
app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'))
);

/* =========================
   DATABASE CONNECTION
========================= */
connectDB();

/* =====================================================
   ROUTES – SUPER ADMIN
===================================================== */
import superAdminAuthRoutes from './routes/superadmin/superAdminAuthRoutes.js';
import superAdminOrganizationRoutes from './routes/superadmin/superAdminOrganizationRoutes.js';
import superAdminAdminRoutes from './routes/superadmin/superAdminAdminRoutes.js';
import superAdminDeviceRoutes from './routes/superadmin/superAdminDeviceRoutes.js';
import superAdminCustomerRoutes from './routes/superadmin/superAdminCustomerRoutes.js';
import superAdminTransactionRoutes from './routes/superadmin/superAdminTransactionRoutes.js';
import superAdminDashboardRoutes from './routes/superadmin/superAdminDashboardRoutes.js';

/* =====================================================
   ROUTES – HEAD ADMIN (ADMIN INCLUDED)
===================================================== */
import headAdminAuthRoutes from './routes/headadmin/authRoutes.js';
import headAdminCustomerRoutes from './routes/headadmin/headAdminCustomerRoutes.js';
import headAdminAdminRoutes from './routes/headadmin/headAdminAdminRoutes.js';
import headAdminPurifierRoutes from './routes/headadmin/headAdminPurifierRoutes.js';
import headAdminPurifierHistoryRoutes from './routes/headadmin/headAdminPurifierHistoryRoutes.js';
import headAdminTransactionRoutes from './routes/headadmin/headAdminTransactionRoutes.js';
import headAdminDashboardRoutes from './routes/headadmin/headAdminDashboardRoutes.js';
import headAdminPlanRoutes from './routes/headadmin/headAdminPlanRoutes.js';
import headAdminRechargedPlanRoutes from './routes/headadmin/headAdminRechargedPlanRoutes.js';
import headAdminSupportRoutes from './routes/headadmin/headAdminSupportRoutes.js';
import headAdminTechnicianRoutes from './routes/headadmin/headAdminTechnicianRoutes.js';
import headAdminInstallationOrderRoutes from './routes/headadmin/headAdminInstallationOrderRoutes.js';
import headAdminServiceRequestRoutes from './routes/headadmin/headAdminServiceRequestRoutes.js';

/* =====================================================
   API ROUTES – SUPER ADMIN
===================================================== */
app.use('/api/superadmin/auth', superAdminAuthRoutes);
app.use('/api/superadmin/organizations', superAdminOrganizationRoutes);
app.use('/api/superadmin/admins', superAdminAdminRoutes);
app.use('/api/superadmin/devices', superAdminDeviceRoutes);
app.use('/api/superadmin/customers', superAdminCustomerRoutes);
app.use('/api/superadmin/transactions', superAdminTransactionRoutes);
app.use('/api/superadmin/dashboard', superAdminDashboardRoutes);

/* =====================================================
   API ROUTES – HEAD ADMIN (ADMIN INCLUDED)
===================================================== */
app.use('/api/headadmin/auth', headAdminAuthRoutes);
app.use('/api/headadmin/customers', headAdminCustomerRoutes);
app.use('/api/headadmin/admins', headAdminAdminRoutes);
app.use('/api/headadmin/purifiers', headAdminPurifierRoutes);
// app.use('/api/headadmin/purifiers/history', headAdminPurifierHistoryRoutes);
app.use('/api/headadmin/transactions', headAdminTransactionRoutes);
app.use('/api/headadmin/dashboard', headAdminDashboardRoutes);
app.use('/api/headadmin/plans', headAdminPlanRoutes);
app.use('/api/headadmin/recharged-plans', headAdminRechargedPlanRoutes);
app.use('/api/headadmin/support', headAdminSupportRoutes);
app.use('/api/headadmin/technicians', headAdminTechnicianRoutes);
app.use('/api/headadmin/installations', headAdminInstallationOrderRoutes);
app.use('/api/headadmin/service-requests', headAdminServiceRequestRoutes);

/* =========================
   HEALTH CHECK
========================= */
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Domestic API running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

/* =========================
   404 HANDLER
========================= */
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl,
  });
});

/* =========================
   MULTER ERROR HANDLER
========================= */
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message });
  }
  next(err);
});

/* =========================
   GLOBAL ERROR HANDLER
========================= */
app.use((err, req, res, next) => {
  console.error('🔥 Global Error:', err);

  res.status(err.statusCode || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

/* =========================
   SERVER START
========================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `🚀 Server running on port ${PORT} | Mode: ${
      process.env.NODE_ENV || 'development'
    }`
  );
});
