import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import axios from '../../utils/axiosConfig';
import { useParams, useNavigate } from 'react-router-dom';
import HeadAdminNavbar from '../../components/Navbar/HeadAdminNavbar';
import { 
  MdArrowBack, 
  MdSearch, 
  MdReceipt, 
  MdHistory, 
  MdInfoOutline,
  MdCheckCircle,
  MdError,
  MdLayers
} from 'react-icons/md';

/* =========================
   STYLES - LAYOUT & CONTAINERS
========================= */
const PageContainer = styled.div`
  padding: 2rem;
  background-color: #f8fafc;
  min-height: calc(100vh - 64px);
  font-family: 'Inter', -apple-system, sans-serif;
`;

const HeaderSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

const TitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  .back-btn {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    border: 1px solid #e2e8f0;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #64748b;
    transition: all 0.2s;

    &:hover {
      background: #f1f5f9;
      color: #2563eb;
      border-color: #2563eb;
    }
  }

  h1 {
    font-size: 1.5rem;
    font-weight: 800;
    color: #1e293b;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    span {
      color: #64748b;
      font-weight: 500;
      font-family: 'JetBrains Mono', monospace;
    }
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.25rem;
  border-radius: 1rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 1rem;

  .icon-box {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    background: ${(p) => p.bg || '#eff6ff'};
    color: ${(p) => p.color || '#2563eb'};
  }

  .info {
    display: flex;
    flex-direction: column;
    
    .label {
      font-size: 0.75rem;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
    }
    
    .value {
      font-size: 1.125rem;
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
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
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
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
`;

const Th = styled.th`
  padding: 0.875rem 1rem;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
`;

const Td = styled.td`
  padding: 0.875rem 1rem;
  font-size: 0.875rem;
  color: #1e293b;
  border-bottom: 1px solid #f1f5f9;
`;

const IndexTd = styled(Td)`
  color: #94a3b8;
  font-weight: 600;
`;

const LimitTd = styled(Td)`
  font-weight: 700;
  color: #2563eb;
`;

const CreatedOnTd = styled(Td)`
  white-space: nowrap;
  font-weight: 500;
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
  
  background: ${(p) => {
    switch (p.status) {
      case 'active': return '#dcfce7';
      case 'consumed': return '#f1f5f9';
      default: return '#fef2f2';
    }
  }};
  color: ${(p) => {
    switch (p.status) {
      case 'active': return '#166534';
      case 'consumed': return '#475569';
      default: return '#991b1b';
    }
  }};
`;

const TxnId = styled.span`
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8125rem;
  color: #64748b;
  background: #f8fafc;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  border: 1px solid #e2e8f0;
`;

const PlanName = styled.div`
  display: flex;
  flex-direction: column;
  
  .name {
    font-weight: 700;
    color: #1e293b;
  }
  .id {
    font-size: 0.75rem;
    color: #94a3b8;
    font-family: 'JetBrains Mono', monospace;
  }
`;

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
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

/* =========================
   COMPONENT
========================= */
export default function RechargedPlan() {
  const { deviceId } = useParams();
  const navigate = useNavigate();

  const [recharges, setRecharges] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecharges = async () => {
      try {
        setLoading(true);
        setError('');

        const res = await axios.get(
          '/api/headadmin/recharged-plans',
          {
            params: { device_id: deviceId },
          }
        );

        setRecharges(res.data || []);
      } catch (err) {
        console.error('RECHARGE FETCH ERROR:', err);
        setError('Failed to load recharged plans. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (deviceId) fetchRecharges();
  }, [deviceId]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();

    return recharges.filter(
      (r) =>
        r.device_id?.toLowerCase().includes(q) ||
        r.plan_id?.toLowerCase().includes(q) ||
        r.plan_name?.toLowerCase().includes(q) ||
        r.txn_id?.toLowerCase().includes(q)
    );
  }, [recharges, search]);

  const stats = useMemo(() => {
    return {
      total: recharges.length,
      active: recharges.filter(r => r.status === 'active').length,
      totalLimit: recharges.reduce((sum, r) => sum + (r.limit || 0), 0)
    };
  }, [recharges]);

  return (
    <HeadAdminNavbar>
      <PageContainer>
        <HeaderSection>
          <TitleGroup>
            <button className="back-btn" onClick={() => navigate('/headadmin/purifiers')}>
              <MdArrowBack />
            </button>
            <h1>Plan History <span>#{deviceId}</span></h1>
          </TitleGroup>
        </HeaderSection>

        <StatsGrid>
          <StatCard bg="#eff6ff" color="#2563eb">
            <div className="icon-box">
              <MdHistory />
            </div>
            <div className="info">
              <span className="label">Total Recharges</span>
              <span className="value">{loading ? '...' : stats.total}</span>
            </div>
          </StatCard>
          <StatCard bg="#dcfce7" color="#16a34a">
            <div className="icon-box">
              <MdCheckCircle />
            </div>
            <div className="info">
              <span className="label">Active Plan</span>
              <span className="value">{loading ? '...' : stats.active}</span>
            </div>
          </StatCard>
          <StatCard bg="#f5f3ff" color="#7c3aed">
            <div className="icon-box">
              <MdLayers />
            </div>
            <div className="info">
              <span className="label">Total Volume Limit</span>
              <span className="value">{loading ? '...' : stats.totalLimit} L</span>
            </div>
          </StatCard>
        </StatsGrid>

        <ControlsWrapper>
          <SearchBox>
            <MdSearch />
            <input
              placeholder="Search by Plan Name, Transaction ID or Plan ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </SearchBox>
        </ControlsWrapper>

        {loading ? (
          <TableContainer>
            <LoadingSkeleton>
              {[1, 2, 3, 4, 5].map(i => <div key={i} className="row" />)}
            </LoadingSkeleton>
          </TableContainer>
        ) : error ? (
          <EmptyState>
            <MdError className="icon" />
            <h3>Oops! Something went wrong</h3>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} style={{ padding: '0.5rem 1rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>
              Retry
            </button>
          </EmptyState>
        ) : filtered.length === 0 ? (
          <EmptyState>
            <MdReceipt className="icon" />
            <h3>No records found</h3>
            <p>We couldn't find any plan recharges for this device.</p>
          </EmptyState>
        ) : (
          <TableContainer>
            <TableScroll>
              <StyledTable>
                <thead>
                  <tr>
                    <Th style={{ width: '60px' }}>#</Th>
                    <Th>Plan Details</Th>
                    <Th>Transaction ID</Th>
                    <Th>Limit (L)</Th>
                    <Th>Validity</Th>
                    <Th>Status</Th>
                    <Th>Created On</Th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => (
                    <tr key={r._id}>
                      <IndexTd>{i + 1}</IndexTd>
                      <Td>
                        <PlanName>
                          <span className="name">{r.plan_name || 'Unknown Plan'}</span>
                          <span className="id">#{r.plan_id || 'N/A'}</span>
                        </PlanName>
                      </Td>
                      <Td>
                        <TxnId>{r.txn_id || '—'}</TxnId>
                      </Td>
                      <LimitTd>{r.limit ?? '—'} L</LimitTd>
                      <Td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                          <MdHistory style={{ color: '#64748b' }} />
                          {r.validity || '—'}
                        </div>
                      </Td>
                      <Td>
                        <StatusBadge status={r.status || 'unknown'}>
                          {r.status || 'unknown'}
                        </StatusBadge>
                      </Td>
                      <CreatedOnTd>{formatIST(r.createdAt)}</CreatedOnTd>
                    </tr>
                  ))}
                </tbody>
              </StyledTable>
            </TableScroll>
          </TableContainer>
        )}
      </PageContainer>
    </HeadAdminNavbar>
  );
}
