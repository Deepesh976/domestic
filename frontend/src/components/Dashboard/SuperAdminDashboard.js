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

  /* =========================
     LOAD ORGANIZATIONS
  ========================= */
  useEffect(() => {
    axios
      .get('/api/superadmin/organizations')
      .then((res) => {
        const orgs = Array.isArray(res.data) ? res.data : [];
        setOrganizations(orgs);
        if (orgs.length > 0) {
          setSelectedOrg(orgs[0]._id);
        }
      })
      .catch(() => setOrganizations([]));
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
          organizationId: selectedOrg,
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
    const base = MONTHS.map((m) => ({
      month: m,
      devices: 0,
    }));

    deviceGrowth.forEach((item) => {
      if (!item || typeof item.month !== 'number') return;

      const index = item.month - 1;
      if (index >= 0 && index < 12) {
        base[index].devices = item.count || 0;
      }
    });

    return base;
  }, [deviceGrowth]);

  /* =========================
     NORMALIZE REVENUE DATA
  ========================= */
  const revenueChartData = useMemo(() => {
    const base = MONTHS.map((m) => ({
      month: m,
      revenue: 0,
    }));

    revenueGrowth.forEach((item) => {
      if (!item || typeof item.month !== 'number') return;

      const index = item.month - 1;
      if (index >= 0 && index < 12) {
        base[index].revenue = item.total || 0;
      }
    });

    return base;
  }, [revenueGrowth]);

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
            <span className="current-date">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
        </div>

        {/* FILTERS */}
        <div className="filters-section">
          <div className="filter-group">
            <label>Organization</label>
            <select
              className="filter-select"
              value={selectedOrg}
              onChange={(e) => setSelectedOrg(e.target.value)}
            >
              {organizations.map((org) => (
                <option key={org._id} value={org._id}>
                  {org.org_name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Year</label>
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

              {/* <div className="stat-card stat-orgs">
                <div className="stat-card-header">
                  <MdBusiness className="stat-icon" />
                  <span className="stat-badge">Active</span>
                </div>
                <div className="stat-value">{organizations.length}</div>
                <p className="stat-label">Organizations</p>
                <div className="stat-footer">On the platform</div>
              </div> */}

              <div className="stat-card stat-growth">
                <div className="stat-card-header">
                  <MdTrendingUp className="stat-icon" />
                  <span className="stat-badge">Growing</span>
                </div>
                <div className="stat-value">
                  {revenueChartData.reduce((sum, m) => sum + (m.revenue || 0), 0).toLocaleString()}
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
