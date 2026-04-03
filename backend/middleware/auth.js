import jwt from 'jsonwebtoken';

/* =====================================================
   AUTH MIDDLEWARE
   - Verifies JWT
   - Normalizes org context
   - Supports superadmin, headadmin, admin
===================================================== */

const auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    /* =========================
       CHECK AUTH HEADER
    ========================= */
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Authorization token required',
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        message: 'Token missing',
      });
    }

    /* =========================
       VERIFY JWT
    ========================= */
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (!decoded?.id || !decoded?.role) {
      return res.status(401).json({
        message: 'Invalid token payload',
      });
    }

    /* =========================
       NORMALIZE USER CONTEXT
       (CRITICAL FIX)
    ========================= */
    const orgId =
      decoded.organization ||
      decoded.org_id ||
      null;

    req.user = {
      id: decoded.id,
      role: decoded.role,
      org_id: orgId,          // admin-compatible
      organization: orgId,    // headadmin-compatible
    };

    next();
  } catch (error) {
    console.error(
      '❌ Auth Middleware Error:',
      error.message
    );

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Token expired, please login again',
      });
    }

    return res.status(401).json({
      message: 'Invalid or expired token',
    });
  }
};

export default auth;
