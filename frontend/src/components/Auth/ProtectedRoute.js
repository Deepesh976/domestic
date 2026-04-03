import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

/* =====================================================
   PROTECTED ROUTE
   - Auth guard
   - Role-based access
   - Org isolation for headadmin/admin
===================================================== */

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const location = useLocation();

  /* =========================
     READ AUTH (REDUX → STORAGE)
  ========================= */
  const auth = useSelector((state) => state.auth || {});

  const token =
    auth.token ||
    localStorage.getItem('token');

  const role =
    auth.role ||
    localStorage.getItem('role');

  let orgId =
    auth.org_id ||
    localStorage.getItem('org_id');

  /* =========================
     EXTRACT ORG_ID FROM JWT IF MISSING
  ========================= */
  if (!orgId && token) {
    try {
      // Decode JWT (base64 decode the payload)
      const payload = token.split('.')[1];
      if (payload) {
        const decoded = JSON.parse(
          atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
        );
        orgId = decoded.org_id;

        if (orgId) {
          console.log('📌 Extracted org_id from JWT token:', orgId);
          // Sync to localStorage so it persists for future page loads
          localStorage.setItem('org_id', orgId);
        }
      }
    } catch (e) {
      // If JWT parsing fails, just continue without org_id
      console.warn('⚠️ Failed to decode JWT token:', e.message);
    }
  }

  /* =========================
     NOT AUTHENTICATED
  ========================= */
  if (!token || !role) {
    return (
      <Navigate
        to="/"
        replace
        state={{ from: location }}
      />
    );
  }

  /* =========================
     NORMALIZE ROLE
  ========================= */
  const normalizedRole = String(role).toLowerCase();
  const normalizedAllowedRoles = allowedRoles.map((r) =>
    String(r).toLowerCase()
  );

  /* =========================
     ROLE NOT ALLOWED
  ========================= */
  if (
    normalizedAllowedRoles.length > 0 &&
    !normalizedAllowedRoles.includes(normalizedRole)
  ) {
    return <Navigate to="/" replace />;
  }

  /* =========================
     ORG CHECK (HEADADMIN / ADMIN)
  ========================= */
  if (
    (normalizedRole === 'headadmin' ||
      normalizedRole === 'admin') &&
    !orgId
  ) {
    console.error(
      `❌ ${normalizedRole} missing org_id - redirecting to login`,
      {
        role: normalizedRole,
        hasToken: !!token,
        hasReduxOrgId: !!auth.org_id,
        hasStorageOrgId: !!localStorage.getItem('org_id'),
      }
    );
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  /* =========================
     ACCESS GRANTED ✅
  ========================= */
  return <Outlet />;
};

export default ProtectedRoute;
