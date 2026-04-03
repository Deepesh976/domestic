import axios from '../utils/axiosConfig';

/* =====================================================
   SUPPORT
===================================================== */

/* Get all support tickets */
export const getSupport = () => {
  return axios.get('/api/headadmin/support');
};

/* Create support ticket */
export const createSupport = (data) => {
  return axios.post('/api/headadmin/support', data);
};

/* Update support ticket */
export const updateSupport = (data) => {
  return axios.put('/api/headadmin/support', data);
};

/* Delete support ticket */
export const deleteSupport = () => {
  return axios.delete('/api/headadmin/support');
};

/* =====================================================
   TECHNICIANS
===================================================== */

/* Get all technicians */
export const getTechnicians = () => {
  return axios.get('/api/headadmin/technicians');
};

/* Update technician (KYC / Active / Work Status) */
export const updateTechnician = (id, data) => {
  return axios.put(`/api/headadmin/technicians/${id}`, data);
};

/* =====================================================
   INSTALLATION ORDERS
===================================================== */

/* Get installation orders */
export const getInstallationOrders = () => {
  return axios.get('/api/headadmin/installations');
};

/* Assign technician to installation order */
export const assignInstallationTechnician = (
  installationId,
  technician_id
) => {
  return axios.put(
    `/api/headadmin/installations/${installationId}/assign`,
    { technician_id } // ✅ always object
  );
};

/* =====================================================
   SERVICE REQUESTS 🔥🔥🔥
===================================================== */

/* Get service requests
   params:
   - status
   - search
*/
export const getServiceRequests = (params = {}) => {
  return axios.get('/api/headadmin/service-requests', {
    params,
  });
};

/* Get only FREE + APPROVED technicians */
export const getAvailableServiceTechnicians = () => {
  return axios.get(
    '/api/headadmin/service-requests/technicians/available'
  );
};

/* Assign technician to service request */
export const assignServiceTechnician = (
  serviceRequestId,
  technician_id
) => {
  return axios.patch(
    `/api/headadmin/service-requests/${serviceRequestId}/assign`,
    {
      technician_id, // ✅ backend expects this exact key
    }
  );
};

/* Update service request status
   status: 'open' | 'assigned' | 'closed'
*/
export const updateServiceRequestStatus = (
  serviceRequestId,
  status
) => {
  return axios.patch(
    `/api/headadmin/service-requests/${serviceRequestId}/status`,
    {
      status, // ✅ FIXED: must be object
    }
  );
};

/* Get single service request by ID */
export const getServiceRequestById = (id) => {
  return axios.get(
    `/api/headadmin/service-requests/${id}`
  );
};

export const removeServiceTechnician = (id) => {
  return axios.patch(`/api/headadmin/service-requests/${id}/remove-technician`);
};