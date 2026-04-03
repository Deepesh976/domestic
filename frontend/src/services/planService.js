import axios from '../utils/axiosConfig';

// ACTIVE PLANS
export const getActivePlans = () =>
  axios.get('/api/headadmin/plans/active');

// ARCHIVED PLANS
export const getArchivedPlans = () =>
  axios.get('/api/headadmin/plans/archived');

// CREATE PLAN
export const createPlan = (data) =>
  axios.post('/api/headadmin/plans', data);

// UPDATE PLAN
export const updatePlan = (id, data) =>
  axios.put(`/api/headadmin/plans/${id}`, data);

// DELETE PLAN
export const deletePlan = (id) =>
  axios.delete(`/api/headadmin/plans/${id}`);
