import React, { useEffect, useMemo, useState } from 'react';
import axios from '../../utils/axiosConfig';
import HeadAdminNavbar from '../Navbar/HeadAdminNavbar';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from 'recharts';
import { MdPeople, MdBusiness, MdTrendingUp } from 'react-icons/md';
import './HeadAdminDashboard.css';

/* =========================
   CONSTANTS
========================= */
const YEARS = [2024, 2025, 2026];
const COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#dc2626'];

const MONTHS = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: new Date(0, i).toLocaleString('en-IN', { month: 'long' }),
}));

/* =========================
   HELPERS
========================= */
const formatIST = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

export default function HeadAdminDashboard() {
  const now = new Date();

  /* =========================
     STATE
  ========================= */
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalTechnicians: 0,
  });

  const [purifierGrowth, setPurifierGrowth] = useState([]);
  const [trendingPlans, setTrendingPlans] = useState([]);

  const [purifierYear, setPurifierYear] = useState(now.getFullYear());
  const [planYear, setPlanYear] = useState('');
  const [planMonth, setPlanMonth] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /* =========================
     LOAD DASHBOARD
  ========================= */
  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await axios.get('/api/headadmin/dashboard', {
        params: {
          purifierYear,
          planYear,
          planMonth,
        },
      });

      setStats({
        totalCustomers: res.data?.stats?.totalCustomers ?? 0,
        totalTechnicians: res.data?.stats?.totalTechnicians ?? 0,
      });

      setPurifierGrowth(
        Array.isArray(res.data?.purifierGrowth)
          ? res.data.purifierGrowth
          : []
      );

      setTrendingPlans(
        Array.isArray(res.data?.trendingPlans)
          ? res.data.trendingPlans
          : []
      );
    } catch (err) {
      console.error('❌ Dashboard load failed:', err);
      setError('Failed to load dashboard');
      setTrendingPlans([]);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     EFFECT
  ========================= */
  useEffect(() => {
    loadDashboard();
  }, [purifierYear, planYear, planMonth]);

  /* =========================
     DERIVED STATE
  ========================= */
  const hasPurifierData = useMemo(
    () => purifierGrowth.some((m) => m.purifiers > 0),
    [purifierGrowth]
  );

  const hasTrendingPlans =
    Array.isArray(trendingPlans) && trendingPlans.length > 0;

  const totalPlans = trendingPlans.reduce(
    (sum, p) => sum + (p.count || 0),
    0
  );

  /* =========================
     RENDER
  ========================= */
  return (
    <HeadAdminNavbar>
      <div className="head-admin-dashboard-page">
        {/* ================= HEADER ================= */}
        <div className="dashboard-header">
          <div>
            <h1 className="head-admin-dashboard-title">Dashboard Overview</h1>
            <p className="dashboard-subtitle">Welcome back! Here's what's happening today.</p>
          </div>
          <div className="header-actions">
            <div className="dashboard-date">
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
        </div>

        {error && <div className="dashboard-error">{error}</div>}

        {/* ================= STATS ================= */}
        <div className="head-admin-dashboard-stats">
          <div className="head-admin-stat-card stat-customers">
            <div className="stat-card-header">
              <span className="stat-label">Total Customers</span>
              <div className="stat-icon"><MdPeople /></div>
            </div>
            <div className="head-admin-stat-value">{stats.totalCustomers}</div>
            <div className="stat-footer">
              <span className="stat-badge">Active Customers</span>
            </div>
          </div>

          <div className="head-admin-stat-card stat-technicians">
            <div className="stat-card-header">
              <span className="stat-label">Total Technicians</span>
              <div className="stat-icon"><MdBusiness /></div>
            </div>
            <div className="head-admin-stat-value">{stats.totalTechnicians}</div>
            <div className="stat-footer">
              <span className="stat-badge">On-field Staff</span>
            </div>
          </div>

          <div className="head-admin-stat-card stat-growth">
            <div className="stat-card-header">
              <span className="stat-label">Total Purifiers</span>
              <div className="stat-icon"><MdTrendingUp /></div>
            </div>
            <div className="head-admin-stat-value">
              {purifierGrowth.reduce((sum, m) => sum + (m.purifiers || 0), 0)}
            </div>
            <div className="stat-footer">
              <span className="stat-badge">Installed Units</span>
            </div>
          </div>
        </div>

        {/* ================= CHARTS ================= */}
        <div className="head-admin-dashboard-charts">
          {/* ===== PURIFIER GROWTH ===== */}
          <div className="head-admin-chart-card">
            <div className="chart-header">
              <div>
                <h3 className="chart-title">Purifier Creation Growth</h3>
                <p className="chart-subtitle">Monthly registration trends</p>
              </div>
              <select
                className="year-select"
                value={purifierYear}
                onChange={(e) => setPurifierYear(Number(e.target.value))}
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div className="chart-content">
              {!hasPurifierData ? (
                <div className="chart-empty">
                  No purifier data for {purifierYear}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={purifierGrowth}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                    <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                      cursor={{ fill: '#f8fafc' }}
                    />
                    <Bar dataKey="purifiers" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* ===== TRENDING PLANS ===== */}
          <div className="head-admin-chart-card">
            <div className="chart-header">
              <div>
                <h3 className="chart-title">Plan Distribution</h3>
                <p className="chart-subtitle">Installation usage by plan type</p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select
                  className="year-select"
                  value={planYear}
                  onChange={(e) => setPlanYear(e.target.value ? Number(e.target.value) : '')}
                >
                  <option value="">All Years</option>
                  {YEARS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>

                <select
                  className="year-select"
                  value={planMonth}
                  onChange={(e) => setPlanMonth(e.target.value ? Number(e.target.value) : '')}
                >
                  <option value="">All Months</option>
                  {MONTHS.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="chart-content">
              {loading ? (
                <div className="head-admin-dashboard-loading">
                  <div className="head-admin-loading-spinner"></div>
                  <span>Loading data...</span>
                </div>
              ) : trendingPlans.length === 0 ? (
                <div className="chart-empty">
                  No installation data available
                </div>
              ) : (
                <>
                  <div style={{ textAlign: 'center', marginBottom: 16, fontSize: '14px', color: '#64748b' }}>
                    <strong>Total Installations: {totalPlans}</strong>
                  </div>

                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={trendingPlans}
                        dataKey="count"
                        nameKey="plan"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {trendingPlans.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                        formatter={(value, name, props) => {
                          const p = props?.payload || {};
                          return [`${value} installations`, p.plan];
                        }}
                      />
                      <Legend
                        layout="horizontal"
                        verticalAlign="bottom"
                        align="center"
                        iconType="circle"
                        formatter={(value) => {
                          const item = trendingPlans.find((p) => p.plan === value);
                          return <span style={{ color: '#64748b', fontSize: '12px' }}>{value} ({item?.count || 0})</span>;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </HeadAdminNavbar>
  );
}
