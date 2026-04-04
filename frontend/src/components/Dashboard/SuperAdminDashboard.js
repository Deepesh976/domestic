import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import { MdBusiness, MdPeople, MdDevices, MdTrendingUp } from 'react-icons/md';
import axios from '../../utils/axiosConfig';
import SuperAdminNavbar from '../../components/Navbar/SuperAdminNavbar';
import './SuperAdminDashboard.css';

/* =========================
   CONSTANTS
========================= */
const MONTHS = [
  'Jan','Feb','Mar','Apr','May','Jun',
  'Jul','Aug','Sep','Oct','Nov','Dec',
];

const YEARS = [2024, 2025, 2026];

/* =========================
   COMPONENT
========================= */
const SuperAdminDashboard = () => {
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  const [stats, setStats] = useState({
    totalAdmins: 0,
    totalDevices: 0,
  });

  const [deviceGrowth, setDeviceGrowth] = useState([]);
  const [revenueGrowth, setRevenueGrowth] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [devices, setDevices] = useState([]);

  /* =========================
     LOAD ORGANIZATIONS
  ========================= */
useEffect(() => {
  Promise.all([
    axios.get('/api/superadmin/organizations'),
    axios.get('/api/superadmin/transactions'),
    axios.get('/api/superadmin/devices'),
  ])
    .then(([orgRes, txnRes, deviceRes]) => {
      // ORGS
      const orgs = Array.isArray(orgRes.data) ? orgRes.data : [];
      setOrganizations(orgs);

      if (orgs.length > 0) {
        setSelectedOrg(orgs[0]);
      }

      // TRANSACTIONS
      const txns = Array.isArray(txnRes.data) ? txnRes.data : [];
      setTransactions(txns);

      const devs = Array.isArray(deviceRes.data) ? deviceRes.data : [];
      setDevices(devs);
    })
    .catch(() => {
      setOrganizations([]);
      setTransactions([]);
      setDevices([]);
    });
}, []);

  /* =========================
     LOAD DASHBOARD DATA
  ========================= */
  useEffect(() => {
    if (!selectedOrg) return;

    setLoading(true);

    axios
      .get('/api/superadmin/dashboard/summary', {
        params: {
          organizationId: selectedOrg?._id,
          year,
        },
      })
      .then((res) => {
        setStats(res.data?.stats || { totalAdmins: 0, totalDevices: 0 });
        setDeviceGrowth(
          Array.isArray(res.data?.deviceGrowth)
            ? res.data.deviceGrowth
            : []
        );
        setRevenueGrowth(
          Array.isArray(res.data?.revenueGrowth)
            ? res.data.revenueGrowth
            : []
        );
      })
      .finally(() => setLoading(false));
  }, [selectedOrg, year]);

  /* =========================
     NORMALIZE DEVICE DATA
     Month-wise device creation
  ========================= */
const deviceChartData = useMemo(() => {
  const base = MONTHS.map((m, index) => ({
    month: m,
    devices: 0,
  }));

  deviceGrowth.forEach((d) => {
    if (!d.month) return;

    const monthIndex = d.month - 1; // backend gives 1–12

    base[monthIndex].devices = d.count;
  });

  return base;
}, [deviceGrowth]);

console.log("Device Chart Data:", deviceChartData);
  /* =========================
     NORMALIZE REVENUE DATA
  ========================= */
const revenueChartData = useMemo(() => {
  const base = MONTHS.map((m, index) => ({
    month: m,
    revenue: 0,
  }));

  transactions.forEach((t) => {
    if (!t.created_at || !t.amount) return;

    // ✅ match selected org
    if (t.org_id !== selectedOrg?.org_id) return;

    const date = new Date(t.created_at);
    const monthIndex = date.getMonth(); // 0–11

    base[monthIndex].revenue += Number(t.amount || 0);
  });

  return base;
}, [transactions, selectedOrg]);
   
const totalRevenueFromTransactions = useMemo(() => {
  return transactions
    .filter((t) => t.org_id === selectedOrg?.org_id)  // ✅ CORRECT MATCH
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
}, [transactions, selectedOrg]);

  /* =========================
     RENDER
  ========================= */
  return (
    <SuperAdminNavbar>
      <div className="dashboard-page">

        {/* HEADER */}
        <div className="dashboard-header-section">
          <div className="header-content">
            <h1 className="dashboard-title">Dashboard</h1>
            <p className="dashboard-subtitle">Platform overview and organization metrics</p>
          </div>

<div className="header-info">

  <div className="header-filters">
<select
  className="filter-select"
  value={selectedOrg?._id || ''}
  onChange={(e) => {
    const org = organizations.find(o => o._id === e.target.value);
    setSelectedOrg(org);
  }}
>
  {organizations.map((org) => (
    <option key={org._id} value={org._id}>
      {org.org_name}
    </option>
  ))}
</select>

    <select
      className="filter-select"
      value={year}
      onChange={(e) => setYear(Number(e.target.value))}
    >
      {YEARS.map((y) => (
        <option key={y} value={y}>
          {y}
        </option>
      ))}
    </select>
  </div>

  <span className="current-date">
    {new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    })}
  </span>

</div>
        </div>

        {/* CONTENT */}
        {loading ? (
          <div className="dashboard-loading">
            <div className="loading-spinner"></div>
            <p>Loading dashboard data...</p>
          </div>
        ) : (
          <>
            {/* STATS */}
            <div className="dashboard-stats">
              <div className="stat-card stat-admins">
                <div className="stat-card-header">
                  <MdPeople className="stat-icon" />
                  <span className="stat-badge">Active</span>
                </div>
                <div className="stat-value">{stats.totalAdmins}</div>
                <p className="stat-label">Total Admins</p>
                <div className="stat-footer">Managing organizations</div>
              </div>

              <div className="stat-card stat-devices">
                <div className="stat-card-header">
                  <MdDevices className="stat-icon" />
                  <span className="stat-badge">Active</span>
                </div>
                <div className="stat-value">{stats.totalDevices}</div>
                <p className="stat-label">Total Devices</p>
                <div className="stat-footer">Deployed across platform</div>
              </div>

              <div className="stat-card stat-growth">
                <div className="stat-card-header">
                  <MdTrendingUp className="stat-icon" />
                  <span className="stat-badge">Growing</span>
                </div>
<div className="stat-value">
  ₹{totalRevenueFromTransactions.toLocaleString('en-IN')}
</div>
                <p className="stat-label">Total Revenue (₹)</p>
                <div className="stat-footer">Year to date</div>
              </div>
            </div>

            {/* CHARTS */}
            <div className="dashboard-charts">

              {/* DEVICE GROWTH */}
              <div className="chart-card chart-card-large">
                <div className="chart-header">
                  <div>
                    <h3 className="chart-title">Device Creation Growth</h3>
                    <p className="chart-subtitle">Monthly device installations tracking</p>
                  </div>
                </div>

                <div className="chart-content">
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart
                      data={deviceChartData}
                      margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

                      <XAxis
                        dataKey="month"
                        stroke="#94a3b8"
                        style={{ fontSize: '13px' }}
                      />

                      <YAxis
                        allowDecimals={false}
                        domain={[0, (dataMax) => Math.max(dataMax, 5)]}
                        tickCount={6}
                        stroke="#94a3b8"
                        style={{ fontSize: '13px' }}
                      />

<Tooltip
  formatter={(value) => [value, "Devices"]}
  labelFormatter={(label) => `Month: ${label}`}
  contentStyle={{
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px'
  }}
/>

                      <Bar
                        dataKey="devices"
                        name="Devices"
                        fill="#3b82f6"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* REVENUE */}
              <div className="chart-card chart-card-large">
                <div className="chart-header">
                  <div>
                    <h3 className="chart-title">Revenue Trend</h3>
                    <p className="chart-subtitle">Monthly revenue analysis</p>
                  </div>
                </div>

                <div className="chart-content">
                  <ResponsiveContainer width="100%" height={320}>
                    <LineChart
                      data={revenueChartData}
                      margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

                      <XAxis
                        dataKey="month"
                        stroke="#94a3b8"
                        style={{ fontSize: '13px' }}
                      />

                      <YAxis
                        domain={[0, (dataMax) => Math.max(dataMax, 200)]}
                        stroke="#94a3b8"
                        style={{ fontSize: '13px' }}
                      />

                      <Tooltip
                        contentStyle={{
                          background: '#ffffff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px'
                        }}
                      />

                      <Line
                        type="monotone"
                        dataKey="revenue"
                        name="Revenue (₹)"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={{ r: 5, fill: '#10b981' }}
                        activeDot={{ r: 7 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </>
        )}
      </div>
    </SuperAdminNavbar>
  );
};

export default SuperAdminDashboard;
