import React, { useEffect, useState, useMemo } from 'react';
import styled from 'styled-components';
import axios from '../../utils/axiosConfig';
import HeadAdminNavbar from '../../components/Navbar/HeadAdminNavbar';
import { useLocation } from 'react-router-dom';
import { useDebounce } from 'use-debounce';
import { 
  MdReceipt, 
  MdSearch, 
  MdCheckCircle, 
  MdError, 
  MdPayments, 
  MdHistory,
  MdOutlineAccountBalanceWallet,
  MdTrendingUp
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
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 2px solid #e2e8f0;
  text-align: center;
`;

const Td = styled.td`
  padding: 1rem;
  font-size: 0.875rem;
  color: #334155;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
  font-weight: 600;
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

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
  
  background: ${(p) => (p.status === 'success' ? '#dcfce7' : '#fef2f2')};
  color: ${(p) => (p.status === 'success' ? '#166534' : '#991b1b')};

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }
`;

const Amount = styled.span`
  font-weight: 700;
  color: #1e293b;
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
const formatDate = (date) => {
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
export default function RechargeTransactions() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 300);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const deviceId = params.get('device_id');

  useEffect(() => {
    setLoading(true);
    axios
      .get('/api/headadmin/transactions', {
        params: deviceId ? { device_id: deviceId } : {},
      })
      .then((res) => {
        setData(res.data || []);
        setError('');
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load transactions');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [deviceId]);

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    return data.filter(
      (t) =>
        t.user_name?.toLowerCase().includes(q) ||
        t.txn_id?.toLowerCase().includes(q) ||
        t.plan_name?.toLowerCase().includes(q)
    );
  }, [data, debouncedSearch]);

  const stats = useMemo(() => {
    const successful = data.filter(
  t => t.payment_status?.toLowerCase() === 'success'
);
    return {
      totalCount: data.length,
      successCount: successful.length,
      failedCount: data.length - successful.length,
      totalRevenue: successful.reduce(
  (acc, t) => acc + (t.amount || 0),
  0
)
    };
  }, [data]);

  return (
    <HeadAdminNavbar>
      <PageContainer>
        <HeaderSection>
          <TitleGroup>
            <MdPayments />
            <Title>
              Recharge Transactions
              {deviceId && <span> — {deviceId}</span>}
            </Title>
          </TitleGroup>
        </HeaderSection>

        <StatsGrid>
          <StatCard bg="#eff6ff" color="#2563eb">
            <div className="icon-box">
              <MdHistory />
            </div>
            <div className="info">
              <span className="label">Total Transactions</span>
              <span className="value">{loading ? '...' : stats.totalCount}</span>
            </div>
          </StatCard>
          <StatCard bg="#dcfce7" color="#16a34a">
            <div className="icon-box">
              <MdTrendingUp />
            </div>
            <div className="info">
              <span className="label">Total Revenue</span>
              <span className="value">₹ {loading ? '...' : stats.totalRevenue.toLocaleString()}</span>
            </div>
          </StatCard>
          <StatCard bg="#f0fdf4" color="#16a34a">
            <div className="icon-box">
              <MdCheckCircle />
            </div>
            <div className="info">
              <span className="label">Successful</span>
              <span className="value">{loading ? '...' : stats.successCount}</span>
            </div>
          </StatCard>
          <StatCard bg="#fef2f2" color="#dc2626">
            <div className="icon-box">
              <MdError />
            </div>
            <div className="info">
              <span className="label">Failed</span>
              <span className="value">{loading ? '...' : stats.failedCount}</span>
            </div>
          </StatCard>
        </StatsGrid>

        <ControlsWrapper>
          <SearchBox>
            <MdSearch />
            <input
              placeholder="Search by User Name, Transaction ID or Plan Name..."
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
            <h3>Oops! Something went wrong</h3>
            <p>{error}</p>
          </EmptyState>
        ) : filtered.length === 0 ? (
          <EmptyState>
            <MdReceipt className="icon" />
            <h3>No transactions found</h3>
            <p>We couldn't find any recharge records matching your criteria.</p>
          </EmptyState>
        ) : (
          <TableContainer>
            <TableScroll>
              <StyledTable>
                <thead>
                  <tr>
                    <Th style={{ width: '60px' }}>#</Th>
                    <Th>User Name</Th>
                    <Th>Transaction ID</Th>
                    <Th>Plan Name</Th>
                    <Th>Amount</Th>
                    <Th>Payment Mode</Th>
                    <Th>Status</Th>
                    <Th>Date</Th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t, i) => (
                    <tr key={t._id}>
                      <Td style={{ color: '#94a3b8', fontWeight: 600 }}>{i + 1}</Td>
                      <Td>
                        <TxnId style={{ background: '#eff6ff', color: '#2563eb', border: 'none', fontWeight: 700 }}>
                          {t.user_name || '-'}
                        </TxnId>
                      </Td>
                      <Td>
                        <TxnId>{t.txn_id}</TxnId>
                      </Td>
                      <Td>{t.plan_name || '—'}</Td>
                      <Td>
                        <Amount>₹ {t.amount?.toLocaleString() || '0'}</Amount>
                      </Td>
                      <Td>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                          <MdOutlineAccountBalanceWallet color="#64748b" />
                          {t.payment_mode || '—'}
                        </div>
                      </Td>
                      <Td>
                        <StatusBadge status={t.payment_status?.toLowerCase()}>
  {t.payment_status}
</StatusBadge>
                      </Td>
                      <Td style={{ whiteSpace: 'nowrap', fontWeight: 500 }}>{formatDate(t.created_at)}</Td>
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
