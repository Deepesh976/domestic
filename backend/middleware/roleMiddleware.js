/* =====================================================
   ROLE MIDDLEWARE
   - Role-based access control
   - Role hierarchy supported
===================================================== */

const ROLE_HIERARCHY = {
  superadmin: 3,
  headadmin: 2,
  admin: 1,
};

const roleMiddleware = (...allowedRoles) => {
  const normalizedAllowedRoles = allowedRoles.map(
    (role) => role.toLowerCase()
  );

  return (req, res, next) => {
    /* =========================
       AUTH CHECK
    ========================= */
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        message: 'Authentication required',
      });
    }

    const userRole = req.user.role.toLowerCase();

    if (!ROLE_HIERARCHY[userRole]) {
      return res.status(403).json({
        message: 'Invalid role',
      });
    }

    /* =========================
       ROLE AUTHORIZATION
    ========================= */
    const hasPermission =
      normalizedAllowedRoles.length === 0 ||
      normalizedAllowedRoles.some(
        (allowedRole) =>
          ROLE_HIERARCHY[userRole] >=
          ROLE_HIERARCHY[allowedRole]
      );

    if (!hasPermission) {
      return res.status(403).json({
        message:
          'Access denied: insufficient permissions',
      });
    }

    next();
  };
};

export default roleMiddleware;
