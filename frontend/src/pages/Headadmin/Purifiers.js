import React, { useEffect, useState } from 'react';
import axios from '../../utils/axiosConfig';
import { useNavigate } from 'react-router-dom';
import HeadAdminNavbar from '../../components/Navbar/HeadAdminNavbar';
import styled from 'styled-components';
import { useDebounce } from 'use-debounce';
import { 
  MdSearch, 
  MdDownload, 
  MdDevices, 
  MdSettings, 
  MdPerson, 
  MdHistory, 
  MdBarChart, 
  MdVisibility, 
  MdClose, 
  MdLocationOn, 
  MdCheckCircle, 
  MdError,
  MdInfo
} from 'react-icons/md';

/* =========================
   STYLES - LAYOUT & CONTAINERS
========================= */
const PageContainer = styled.div`
  padding: 1rem 2rem;
  background-color: #f8fafc;
  min-height: calc(100vh - 64px);
  font-family: 'Inter', -apple-system, sans-serif;
`;

const HeaderSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

const TitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;

  svg {
    font-size: 2rem;
    color: #2563eb;
  }
`;

const Title = styled.h1`
  font-size: 1.875rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 1.25rem;

  .icon-box {
    width: 3.5rem;
    height: 3.5rem;
    border-radius: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.75rem;
    background: ${(p) => p.bg || '#eff6ff'};
    color: ${(p) => p.color || '#2563eb'};
  }

  .info {
    display: flex;
    flex-direction: column;
    
    .label {
      font-size: 0.875rem;
      font-weight: 600;
      color: #64748b;
    }
    
    .value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1e293b;
    }
  }
`;

/* =========================
   STYLES - CONTROLS
========================= */
const ControlsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  background: white;
  padding: 1rem;
  border-radius: 1rem;
  border: 1px solid #e2e8f0;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const SearchBox = styled.div`
  position: relative;
  flex: 1;
  min-width: 300px;

  svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
    font-size: 1.25rem;
  }

  input {
    width: 100%;
    padding: 10px 10px 10px 40px;
    border-radius: 0.75rem;
    border: 1.5px solid #e2e8f0;
    font-size: 0.95rem;
    transition: all 0.2s;
    outline: none;

    &:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
    }

    &::placeholder {
      color: #94a3b8;
    }
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  
  background: ${(p) => (p.variant === 'secondary' ? '#f1f5f9' : '#2563eb')};
  color: ${(p) => (p.variant === 'secondary' ? '#475569' : 'white')};

  &:hover {
    background: ${(p) => (p.variant === 'secondary' ? '#e2e8f0' : '#1d4ed8')};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

/* =========================
   STYLES - TABLE
========================= */
const TableContainer = styled.div`
  background: white;
  border-radius: 1rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

const TableScroll = styled.div`
  overflow-x: auto;
  
  &::-webkit-scrollbar {
    height: 8px;
  }
  &::-webkit-scrollbar-track {
    background: #f1f5f9;
  }
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: center;
`;

const Th = styled.th`
  padding: 1rem;
  background: #f8fafc;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 2px solid #e2e8f0;
  text-align: center;
`;

const Td = styled.td`
  padding: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #334155;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
`;

const DeviceId = styled.button`
  background: #eff6ff;
  color: #2563eb;
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: #dbeafe;
    text-decoration: underline;
  }
`;

const UserName = styled.button`
  background: none;
  border: none;
  color: #1e293b;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0;

  &:hover {
    color: #2563eb;
    text-decoration: underline;
  }
  
  .avatar {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background: #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #64748b;
    font-size: 0.75rem;
  }
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
  
  background: ${(p) => (p.status === 'active' ? '#dcfce7' : '#f1f5f9')};
  color: ${(p) => (p.status === 'active' ? '#166534' : '#475569')};

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }
`;

const ActionGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: center;
`;

const IconButton = styled.button`
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.15s;
  background: ${(p) => p.bg || '#f1f5f9'};
  color: ${(p) => p.color || '#475569'};

  &:hover {
    transform: translateY(-2px);
    background: ${(p) => p.hoverBg || '#e2e8f0'};
    color: white;
  }
  
  svg {
    font-size: 1.125rem;
  }
`;

/* =========================
   STYLES - MODAL
========================= */
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 1.5rem;
`;

const ModalContent = styled.div`
  background: white;
  width: 100%;
  max-width: ${(p) => p.width || '600px'};
  border-radius: 1.25rem;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
`;

const ModalHeader = styled.div`
  padding: 1.5rem;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 700;
    color: #1e293b;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    
    svg {
      color: #2563eb;
    }
  }

  button {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #94a3b8;
    cursor: pointer;
    transition: color 0.15s;
    display: flex;
    align-items: center;

    &:hover {
      color: #ef4444;
    }
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
  overflow-y: auto;
`;

const ModalFooter = styled.div`
  padding: 1.25rem 1.5rem;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const DetailItem = styled.div`
  .label {
    font-size: 0.75rem;
    font-weight: 700;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.025em;
    margin-bottom: 0.375rem;
  }
  .value {
    font-size: 0.9375rem;
    font-weight: 600;
    color: #1e293b;
    word-break: break-all;
  }
`;

/* =========================
   COMPONENTS
========================= */
const EmptyState = styled.div`
  padding: 4rem 2rem;
  text-align: center;
  color: #64748b;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  .icon {
    font-size: 4rem;
    color: #e2e8f0;
  }

  h3 {
    margin: 0;
    color: #1e293b;
    font-size: 1.25rem;
  }
`;

const LoadingSkeleton = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;

  .row {
    height: 3.5rem;
    background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
    border-radius: 0.5rem;
  }

  @keyframes loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

/* =========================
   HELPERS
========================= */
const formatIST = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatFullAddress = (p) => {
  if (p?.user_details?.address) {
    const { flat_no, area, city, state, postal_code } = p.user_details.address;
    return [flat_no, area, city, state, postal_code].filter(Boolean).join(', ');
  }
  return p?.installed_location || 'Not Specified';
};

/* =========================
   MAIN COMPONENT
========================= */
export default function Purifiers() {
  const navigate = useNavigate();

  const [purifiers, setPurifiers] = useState([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 300);
  const [view, setView] = useState(null);
  const [userView, setUserView] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPurifiers = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/headadmin/purifiers');
        setPurifiers(res.data.purifiers || []);
      } catch (err) {
        console.error('PURIFIER ERROR:', err);
        setError('Failed to load purifiers data');
      } finally {
        setLoading(false);
      }
    };

    fetchPurifiers();
  }, []);

  const filtered = purifiers.filter((p) => {
    const searchLower = debouncedSearch.toLowerCase();
    const fullName = `${p.user_details?.user_name?.first_name || ''} ${
      p.user_details?.user_name?.last_name || ''
    }`.toLowerCase();
    
    return (
      p.device_id?.toLowerCase().includes(searchLower) ||
      fullName.includes(searchLower) ||
      p.installed_location?.toLowerCase().includes(searchLower)
    );
  });

  const stats = {
    total: purifiers.length,
    active: purifiers.filter((p) => p.status === 'active').length,
    offline: purifiers.filter((p) => p.status !== 'active').length,
  };

  const downloadCSV = () => {
    if (!filtered.length) return;

    const rows = filtered.map((p, i) => ({
      SNo: i + 1,
      DeviceID: p.device_id,
      Name: p.user_details
        ? `${p.user_details.user_name?.first_name} ${p.user_details.user_name?.last_name}`
        : '',
      Status: p.status,
      Location: formatFullAddress(p),
      TotalUsage: p.total_usage ?? '',
      AvgUsage: p.avg_usage ?? '',
      CreatedOn: formatIST(p.createdAt),
    }));

    const csvHeaders = Object.keys(rows[0]).join(',');
    const csvRows = rows.map((r) => Object.values(r).map(v => `"${v}"`).join(',')).join('\n');
    const csv = `${csvHeaders}\n${csvRows}`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `purifiers_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <HeadAdminNavbar>
      <PageContainer>
        <HeaderSection>
          <TitleGroup>
            <MdDevices />
            <Title>Purifiers Management</Title>
          </TitleGroup>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <ActionButton 
              variant="secondary" 
              onClick={downloadCSV}
              disabled={loading || filtered.length === 0}
            >
              <MdDownload /> Export CSV
            </ActionButton>
          </div>
        </HeaderSection>

        <StatsGrid>
          <StatCard bg="#eff6ff" color="#2563eb">
            <div className="icon-box">
              <MdDevices />
            </div>
            <div className="info">
              <span className="label">Total Devices</span>
              <span className="value">{loading ? '...' : stats.total}</span>
            </div>
          </StatCard>
          <StatCard bg="#dcfce7" color="#16a34a">
            <div className="icon-box">
              <MdCheckCircle />
            </div>
            <div className="info">
              <span className="label">Active Units</span>
              <span className="value">{loading ? '...' : stats.active}</span>
            </div>
          </StatCard>
          <StatCard bg="#f1f5f9" color="#64748b">
            <div className="icon-box">
              <MdError />
            </div>
            <div className="info">
              <span className="label">Inactive Units</span>
              <span className="value">{loading ? '...' : stats.offline}</span>
            </div>
          </StatCard>
        </StatsGrid>

        <ControlsWrapper>
          <SearchBox>
            <MdSearch />
            <input
              placeholder="Search by Device ID, Customer Name or Location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </SearchBox>
        </ControlsWrapper>

        {loading ? (
          <TableContainer>
            <LoadingSkeleton>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="row" />
              ))}
            </LoadingSkeleton>
          </TableContainer>
        ) : error ? (
          <EmptyState>
            <MdError className="icon" />
            <h3>Opps! Something went wrong</h3>
            <p>{error}</p>
            <ActionButton onClick={() => window.location.reload()}>Try Again</ActionButton>
          </EmptyState>
        ) : filtered.length === 0 ? (
          <EmptyState>
            <MdSearch className="icon" />
            <h3>No results found</h3>
            <p>We couldn't find any purifiers matching your search criteria.</p>
          </EmptyState>
        ) : (
          <TableContainer>
            <TableScroll>
              <StyledTable>
                <thead>
                  <tr>
                    <Th style={{ width: '60px' }}>#</Th>
                    <Th>Device ID</Th>
                    <Th>Customer</Th>
                    <Th>Status</Th>
                    <Th>Location</Th>
                    <Th>Total Usage</Th>
                    <Th>Avg Usage</Th>
                    <Th>Created On</Th>
                    <Th style={{ textAlign: 'center' }}>Actions</Th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => (
                    <tr key={p._id}>
                      <Td style={{ color: '#94a3b8', fontWeight: 600 }}>{i + 1}</Td>
                      <Td>
                        <DeviceId onClick={() => navigate(`/headadmin/purifiers/${p.device_id}/history`)}>
                          {p.device_id}
                        </DeviceId>
                      </Td>
                      <Td>
                        {p.user_details ? (
                          <UserName onClick={() => setUserView(p.user_details)} style={{ margin: '0 auto' }}>
                            {p.user_details.user_name?.first_name} {p.user_details.user_name?.last_name}
                          </UserName>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>Unassigned</span>
                        )}
                      </Td>
                      <Td>
                        <StatusBadge status={p.status}>{p.status}</StatusBadge>
                      </Td>
                      <Td>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', color: p.installed_location || p.user_details?.address ? 'inherit' : '#94a3b8' }}>
                          {formatFullAddress(p)}
                        </div>
                      </Td>
                      <Td style={{ fontWeight: 600 }}>{p.total_usage ?? '0'} L</Td>
                      <Td>{p.avg_usage ?? '0'} L/d</Td>
                      <Td style={{ whiteSpace: 'nowrap' }}>{formatIST(p.createdAt)}</Td>
                      <Td>
                        <ActionGroup>
                          <IconButton 
                            title="View Details"
                            bg="#eff6ff" 
                            color="#2563eb"
                            hoverBg="#2563eb"
                            onClick={() => setView(p)}
                          >
                            <MdVisibility />
                          </IconButton>
                          <IconButton 
                            title="Analytics"
                            bg="#f5f3ff" 
                            color="#7c3aed"
                            hoverBg="#7c3aed"
                            onClick={() => navigate(`/headadmin/purifiers/${p.device_id}/analysis`)}
                          >
                            <MdBarChart />
                          </IconButton>
                          <IconButton 
                            title="Recharged Plan"
                            bg="#f0fdf4" 
                            color="#16a34a"
                            hoverBg="#16a34a"
                            onClick={() => navigate(`/headadmin/purifiers/${p.device_id}/recharged-plan`)}
                          >
                            <MdHistory />
                          </IconButton>
                        </ActionGroup>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </StyledTable>
            </TableScroll>
          </TableContainer>
        )}
      </PageContainer>

      {/* ================= USER DETAILS MODAL ================= */}
      {userView && (
        <ModalOverlay onClick={() => setUserView(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h3><MdPerson /> Customer Information</h3>
              <button onClick={() => setUserView(null)}><MdClose /></button>
            </ModalHeader>
            <ModalBody>
              <DetailGrid>
                <DetailItem>
                  <div className="label">First Name</div>
                  <div className="value">{userView.user_name?.first_name || '—'}</div>
                </DetailItem>
                <DetailItem>
                  <div className="label">Last Name</div>
                  <div className="value">{userView.user_name?.last_name || '—'}</div>
                </DetailItem>
                <DetailItem>
                  <div className="label">Email Address</div>
                  <div className="value">{userView.email_address || '—'}</div>
                </DetailItem>
                <DetailItem>
                  <div className="label">Phone Number</div>
                  <div className="value">{userView.phone_number || '—'}</div>
                </DetailItem>
                <DetailItem style={{ gridColumn: '1 / span 2' }}>
                  <div className="label">Full Address</div>
                  <div className="value">
                    {userView.address ? (
                      [userView.address.flat_no, userView.address.area, userView.address.city, userView.address.state, userView.address.postal_code, userView.address.country].filter(Boolean).join(', ')
                    ) : '—'}
                  </div>
                </DetailItem>
              </DetailGrid>
            </ModalBody>
            <ModalFooter>
              <ActionButton variant="secondary" onClick={() => setUserView(null)}>Close</ActionButton>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* ================= PURIFIER DETAILS MODAL ================= */}
      {view && (
        <ModalOverlay onClick={() => setView(null)}>
          <ModalContent width="750px" onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h3><MdInfo /> Purifier Specifications</h3>
              <button onClick={() => setView(null)}><MdClose /></button>
            </ModalHeader>
            <ModalBody>
              <DetailGrid>
                <DetailItem>
                  <div className="label">Device ID</div>
                  <div className="value" style={{ fontFamily: 'monospace', background: '#f8fafc', padding: '0.25rem' }}>{view.device_id}</div>
                </DetailItem>
                <DetailItem>
                  <div className="label">Installed Date</div>
                  <div className="value">{formatIST(view.installed_at)}</div>
                </DetailItem>
                <DetailItem>
                  <div className="label">Connectivity</div>
                  <div className="value">{view.connectivity_status || 'Online'}</div>
                </DetailItem>
                <DetailItem>
                  <div className="label">Firmware</div>
                  <div className="value">{view.firmware_version || 'v1.0.0'}</div>
                </DetailItem>
                <DetailItem>
                  <div className="label">Security Status</div>
                  <div className="value">{view.is_locked ? '🔒 Locked' : '🔓 Unlocked'}</div>
                </DetailItem>
                <DetailItem>
                  <div className="label">Last Service</div>
                  <div className="value">{formatIST(view.last_service_date)}</div>
                </DetailItem>
                <DetailItem>
                  <div className="label">Filter Life</div>
                  <div className="value">
                    <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', marginTop: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${view.filter_life || 0}%`, height: '100%', background: '#16a34a' }} />
                    </div>
                    <span style={{ fontSize: '0.8rem' }}>{view.filter_life || 0}% Remaining</span>
                  </div>
                </DetailItem>
                <DetailItem>
                  <div className="label">Physical ID</div>
                  <div className="value">{view.module_physical_id || '—'}</div>
                </DetailItem>
                <DetailItem>
                  <div className="label">TDS Range</div>
                  <div className="value">{view.tds_low || 0} - {view.tds_high || 0} ppm</div>
                </DetailItem>
                <DetailItem>
                  <div className="label">Flow Count</div>
                  <div className="value">{view.flow_sensor_count ?? '—'}</div>
                </DetailItem>
                <DetailItem style={{ gridColumn: '1 / span 2' }}>
                  <div className="label">Installation Location</div>
                  <div className="value" style={{ background: '#f8fafc', padding: '0.5rem', borderRadius: '0.5rem' }}>
                    {formatFullAddress(view)}
                  </div>
                </DetailItem>
              </DetailGrid>
              
              {view.replaced_module_history?.length > 0 && (
                <div style={{ marginTop: '1.5rem' }}>
                  <div className="label" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Module History</div>
                  <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
                    {view.replaced_module_history.join(', ')}
                  </div>
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <ActionButton onClick={() => setView(null)}>Done</ActionButton>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}
    </HeadAdminNavbar>
  );
}
