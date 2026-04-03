import './utils/axiosConfig';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import UnifiedLoginPage from './pages/UnifiedLoginPage';
import ProtectedRoute from './components/Auth/ProtectedRoute';

/* ================= COMMON ================= */
import Profile from './pages/Profile';
import ResetPassword from './pages/ResetPassword';

/* ================= SUPER ADMIN ================= */
import SuperAdminDashboard from './components/Dashboard/SuperAdminDashboard';
import SuperAdminOrg from './pages/SuperAdmin/SuperAdminOrg';
import CreateOrganization from './pages/SuperAdmin/CreateOrganization';
import EditOrganization from './pages/SuperAdmin/EditOrganization';

import AdminInfo from './pages/SuperAdmin/AdminInfo';
import CreateAdmin from './pages/SuperAdmin/CreateAdmin';
import EditAdmin from './pages/SuperAdmin/EditAdmin';
import SuperAdminAdminKycView from './pages/SuperAdmin/AdminKycView';

import Customer from './pages/SuperAdmin/Customer';
import SuperAdminCustomerInfo from './pages/SuperAdmin/SuperAdminCustomerInfo';

import Device from './pages/SuperAdmin/Device';
import AddDevice from './pages/SuperAdmin/AddDevice';
import Transaction from './pages/SuperAdmin/Transaction';

/* ================= HEAD ADMIN / ADMIN ================= */
import HeadAdminDashboard from './components/Dashboard/HeadAdminDashboard';
import HeadAdminCustomers from './pages/Headadmin/Customers';
import CustomerKycView from './pages/Headadmin/CustomerKycView';

import HeadAdminAdmins from './pages/Headadmin/Admins';
import HeadAdminCreateAdmin from './pages/Headadmin/CreateAdmin';
import HeadAdminEditAdmin from './pages/Headadmin/EditAdmin';
import HeadAdminAdminKycView from './pages/Headadmin/AdminKycView';

import HeadAdminPurifiers from './pages/Headadmin/Purifiers';
import HeadAdminPurifierHistory from './pages/Headadmin/PurifierHistory';
import HeadAdminRechargedPlan from './pages/Headadmin/RechargedPlan';

import HeadAdminAnalysis from './pages/Headadmin/Analysis';
import HeadAdminTransactions from './pages/Headadmin/Transactions';

import HeadAdminPlans from './pages/Headadmin/Plan';
import HeadAdminCreatePlan from './pages/Headadmin/CreatePlan';
import HeadAdminEditPlan from './pages/Headadmin/EditPlan';

import HeadAdminOrders from './pages/Headadmin/Order';
import HeadAdminCreateOrder from './pages/Headadmin/CreateOrder';
import HeadAdminTechnicians from './pages/Headadmin/Technician';
import HeadAdminInstallationOrder from './pages/Headadmin/InstallationOrder';
import HeadAdminServiceRequest from './pages/Headadmin/ServiceRequest';
import HeadAdminServiceRequestDetail from './pages/Headadmin/ServiceRequestDetail';
import HeadAdminSupport from './pages/Headadmin/Support';

function App() {
  return (
    <Router>
      <Routes>

        {/* ================= AUTH ================= */}
        <Route path="/" element={<UnifiedLoginPage />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* ================= SUPER ADMIN ================= */}
        <Route
          path="/superadmin"
          element={<ProtectedRoute allowedRoles={['superadmin']} />}
        >
          <Route index element={<SuperAdminDashboard />} />

          <Route path="organizations" element={<SuperAdminOrg />} />
          <Route path="organizations/create" element={<CreateOrganization />} />
          <Route path="organizations/:id/edit" element={<EditOrganization />} />

          <Route path="admins" element={<AdminInfo />} />
          <Route path="admins/create" element={<CreateAdmin />} />
          <Route path="admins/:id/edit" element={<EditAdmin />} />
          <Route path="admins/:id/kyc" element={<SuperAdminAdminKycView />} />

          <Route path="customers" element={<Customer />} />
          <Route path="customers/:id" element={<SuperAdminCustomerInfo />} />

          <Route path="devices" element={<Device />} />
          <Route path="devices/add" element={<AddDevice />} />

          <Route path="transactions" element={<Transaction />} />
        </Route>

        {/* ================= HEAD ADMIN ================= */}
        <Route
          path="/headadmin"
          element={<ProtectedRoute allowedRoles={['headadmin', 'admin']} />}
        >
          <Route index element={<HeadAdminDashboard />} />

          <Route path="customers" element={<HeadAdminCustomers />} />
          <Route path="customers/:id/kyc" element={<CustomerKycView />} />

          <Route path="admins" element={<HeadAdminAdmins />} />
          <Route path="admins/create" element={<HeadAdminCreateAdmin />} />
          <Route path="admins/:adminId/edit" element={<HeadAdminEditAdmin />} />
          <Route path="admins/:adminId/kyc" element={<HeadAdminAdminKycView />} />

          <Route path="purifiers" element={<HeadAdminPurifiers />} />
          <Route path="purifiers/:deviceId/history" element={<HeadAdminPurifierHistory />} />
          <Route path="purifiers/:deviceId/recharged-plan" element={<HeadAdminRechargedPlan />} />
          <Route path="purifiers/:deviceId/analysis" element={<HeadAdminAnalysis />} />

          <Route path="plans" element={<HeadAdminPlans />} />
          <Route path="plans/create" element={<HeadAdminCreatePlan />} />
          <Route path="plans/:planId/edit" element={<HeadAdminEditPlan />} />

          <Route path="transactions" element={<HeadAdminTransactions />} />

          <Route path="orders" element={<HeadAdminOrders />} />
          <Route path="orders/create" element={<HeadAdminCreateOrder />} />
          <Route path="technicians" element={<HeadAdminTechnicians />} />
          <Route path="installations" element={<HeadAdminInstallationOrder />} />
          <Route path="service-requests">
  <Route index element={<HeadAdminServiceRequest />} />
  <Route path=":id" element={<HeadAdminServiceRequestDetail />} />
</Route>

          <Route path="support" element={<HeadAdminSupport />} />

          <Route path="analysis" element={<HeadAdminAnalysis />} />
        </Route>

        {/* ================= PROFILE ================= */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={['superadmin', 'headadmin', 'admin']} />
          }
        >
          <Route index element={<Profile />} />
        </Route>

        <Route path="*" element={<UnifiedLoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;
