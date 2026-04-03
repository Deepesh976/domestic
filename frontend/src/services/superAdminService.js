// src/services/superAdminService.js
import axios from '../utils/axiosConfig';

/* =====================================================
   AUTH
===================================================== */
export const superAdminLogin = (data) => {
  return axios.post('/api/superadmin/auth/login', data);
};

/* =====================================================
   ORGANIZATIONS
===================================================== */

// Get all organizations
export const getOrganizations = () => {
  return axios.get('/api/superadmin/organizations');
};

// Get single organization by ID
export const getOrganizationById = (id) => {
  return axios.get(`/api/superadmin/organizations/${id}`);
};

// Create organization (✅ supports logo upload)
export const createOrganization = (data) => {
  return axios.post('/api/superadmin/organizations', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Update organization (✅ supports optional logo update)
export const updateOrganization = (id, data) => {
  return axios.put(`/api/superadmin/organizations/${id}`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Delete organization
export const deleteOrganization = (id) => {
  return axios.delete(`/api/superadmin/organizations/${id}`);
};

/* =====================================================
   ADMINS / HEAD ADMINS
===================================================== */

export const getAdmins = () => {
  return axios.get('/api/superadmin/admins');
};

export const getAdminById = (id) => {
  return axios.get(`/api/superadmin/admins/${id}`);
};

export const createAdmin = (data) => {
  return axios.post('/api/superadmin/admins', data);
};

export const updateAdmin = (id, data) => {
  return axios.put(`/api/superadmin/admins/${id}`, data);
};

export const deleteAdmin = (id) => {
  return axios.delete(`/api/superadmin/admins/${id}`);
};

/* =====================================================
   DEVICES
===================================================== */

export const getDevices = () => {
  return axios.get('/api/superadmin/devices');
};

export const createDevice = (data) => {
  return axios.post('/api/superadmin/devices', data);
};

export const assignDeviceToOrganization = (
  deviceId,
  organizationId
) => {
  return axios.put(
    `/api/superadmin/devices/${deviceId}/assign-org`,
    { organizationId }
  );
};

/* =====================================================
   CUSTOMERS (VIEW ONLY)
===================================================== */

export const getCustomers = () => {
  return axios.get('/api/superadmin/customers');
};

/* =====================================================
   TRANSACTIONS (VIEW ONLY)
===================================================== */

export const getTransactions = () => {
  return axios.get('/api/superadmin/transactions');
};

/* =====================================================
   DASHBOARD
===================================================== */

export const getDashboardOrganizations = () => {
  return axios.get('/api/superadmin/dashboard/organizations');
};

export const getDashboardStats = (organizationId) => {
  return axios.get('/api/superadmin/dashboard/stats', {
    params: { organizationId },
  });
};
