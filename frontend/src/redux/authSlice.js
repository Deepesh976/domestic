import { createSlice } from '@reduxjs/toolkit';

/* =========================
   INITIAL STATE (FROM STORAGE)
========================= */
const token = localStorage.getItem('token');
const role = localStorage.getItem('role');
const org_id = localStorage.getItem('org_id');

const initialState = {
  token: token || null,
  role: role || null,
  org_id: org_id || null, // ✅ REQUIRED FOR HEADADMIN
  isAuthenticated: !!token,
  loading: false,
  error: null,
};

/* =========================
   SLICE
========================= */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /* =========================
       LOGIN SUCCESS
    ========================= */
    loginSuccess: (state, action) => {
      const { token, role, org_id } = action.payload;

      state.token = token;
      state.role = role;
      state.org_id = org_id || null;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;

      // 🔥 persist
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);

      if (org_id) {
        localStorage.setItem('org_id', org_id);
      } else {
        localStorage.removeItem('org_id');
      }
    },

    /* =========================
       LOGOUT
    ========================= */
    logout: (state) => {
      state.token = null;
      state.role = null;
      state.org_id = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;

      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('org_id');
    },

    /* =========================
       AUTH ERROR (OPTIONAL)
    ========================= */
    authError: (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Authentication failed';
      state.isAuthenticated = false;
    },
  },
});

export const { loginSuccess, logout, authError } = authSlice.actions;
export default authSlice.reducer;
