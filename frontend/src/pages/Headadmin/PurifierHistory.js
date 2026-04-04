import React, { useEffect, useMemo, useState } from 'react';
import axios from '../../utils/axiosConfig';
import { useParams, useNavigate } from 'react-router-dom';
import HeadAdminNavbar from '../../components/Navbar/HeadAdminNavbar';
import styled from 'styled-components';
import { 
  MdArrowBack, 
  MdSearch, 
  MdDownload, 
  MdHistory, 
  MdFilterList, 
  MdDateRange,
  MdChevronLeft,
  MdChevronRight,
  MdError,
  MdInfoOutline,
  MdLocationOn
} from 'react-icons/md';

/* =========================
   STYLES - LAYOUT & CONTAINERS
========================= */
const PageContainer = styled.div`
  padding: 1rem;
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

/* =========================
   STYLES - FILTERS
========================= */
const FiltersWrapper = styled.div`
  background: white;
  padding: 1.25rem;
  border-radius: 1rem;
  border: 1px solid #e2e8f0;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-end;
`;

const FilterItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
  min-width: ${(p) => p.width || '200px'};

  label {
    font-size: 0.75rem;
    font-weight: 700;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.025em;
  }

  .input-wrapper {
    position: relative;
    
    svg {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: #94a3b8;
    }

    input {
      width: 100%;
      padding: 0.625rem 0.625rem 0.625rem 2.5rem;
      border-radius: 0.75rem;
      border: 1.5px solid #e2e8f0;
      font-size: 0.875rem;
      outline: none;
      transition: all 0.2s;

      &:focus {
        border-color: #3b82f6;
        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
      }
    }
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  height: 42px;
  
  background: ${(p) => (p.variant === 'secondary' ? '#f1f5f9' : '#2563eb')};
  color: ${(p) => (p.variant === 'secondary' ? '#475569' : 'white')};

  &:hover {
    background: ${(p) => (p.variant === 'secondary' ? '#e2e8f0' : '#1d4ed8')};
    transform: translateY(-1px);
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
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: center;
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
  text-align: center;
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

const TimestampTd = styled(Td)`
  font-weight: 600;
`;

const VolumeTd = styled(Td)`
  font-weight: 700;
  color: #2563eb;
`;

const Indicator = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.625rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  
  background: ${(p) => (p.error ? '#fef2f2' : '#f0fdf4')};
  color: ${(p) => (p.error ? '#dc2626' : '#16a34a')};
`;

/* =========================
   STYLES - PAGINATION
========================= */
const PaginationWrapper = styled.div`
  margin-top: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 0.5rem;

  .meta {
    font-size: 0.875rem;
    color: #64748b;
    font-weight: 500;
    
    strong {
      color: #1e293b;
    }
  }

  .controls {
    display: flex;
    gap: 0.5rem;
  }
`;

const NavButton = styled.button`
  width: 2.25rem;
  height: 2.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    border-color: #2563eb;
    color: #2563eb;
    background: #eff6ff;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
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
    height: 3rem;
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

/* =========================
   MAIN COMPONENT
========================= */
export default function PurifierHistory() {
  const { deviceId } = useParams();
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [purifier, setPurifier] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [search, setSearch] = useState('');

  /* Pagination */
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await axios.get(
        `/api/headadmin/purifiers/${deviceId}/history`,
        { params: { from, to } }
      );

      setHistory(res.data.history || []);
      setPurifier(res.data.purifier || null);
      setCustomer(res.data.customer || null);
      setPage(1);
    } catch (err) {
      console.error('History error:', err);
      setError('Failed to load logs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line
  }, [deviceId]);

  const filteredData = useMemo(() => {
    if (!search) return history;

    const q = search.toLowerCase();

    return history.filter(h =>
      [
        h.metadata?.device_id,
        h.tds_in,
        h.tds_out,
        h.total_litres,
        h.rem_litres,
      ]
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [history, search]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page]);

  const downloadCSV = () => {
    if (!filteredData.length) return;

    const headers = [
      'Timestamp', 'Device ID', 'TDS In (ppm)', 'TDS Out (ppm)', 
      'LPS Error', 'Plan Limit (L)', 'Filter Life (%)', 
      'Total Litres (L)', 'Remaining Litres (L)', 'UV Error'
    ];

    const rows = filteredData.map(h => [
      formatIST(h.timestamp),
      h.metadata?.device_id,
      h.tds_in,
      h.tds_out,
      h.lps_error ? 'Yes' : 'No',
      h.plan_limit,
      h.filter_life,
      h.total_litres,
      h.rem_litres,
      h.uv_error ? 'Yes' : 'No',
    ]);

    const csvContent = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `history_${deviceId}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fullLocation = useMemo(() => {
    if (customer?.address) {
      const { flat_no, area, city, state, postal_code } = customer.address;
      return [flat_no, area, city, state, postal_code].filter(Boolean).join(', ');
    }
    return purifier?.installed_location || '';
  }, [customer, purifier]);

  return (
    <HeadAdminNavbar>
      <PageContainer>
        <HeaderSection>
          <TitleGroup>
            <button className="back-btn" onClick={() => navigate('/headadmin/purifiers')}>
              <MdArrowBack />
            </button>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h1>Device Logs <span>#{deviceId}</span></h1>
              {fullLocation && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                  <MdLocationOn size={16} />
                  <span>Location: <strong>{fullLocation}</strong></span>
                </div>
              )}
            </div>
          </TitleGroup>
          <ActionButton variant="secondary" onClick={downloadCSV} disabled={loading || !filteredData.length}>
            <MdDownload /> Export Logs
          </ActionButton>
        </HeaderSection>

        <FiltersWrapper>
          <FilterItem width="180px">
            <label>From Date</label>
            <div className="input-wrapper">
              <MdDateRange />
              <input type="date" value={from} onChange={e => setFrom(e.target.value)} />
            </div>
          </FilterItem>
          <FilterItem width="180px">
            <label>To Date</label>
            <div className="input-wrapper">
              <MdDateRange />
              <input type="date" value={to} onChange={e => setTo(e.target.value)} />
            </div>
          </FilterItem>
          <FilterItem width="300px">
            <label>Search Logs</label>
            <div className="input-wrapper">
              <MdSearch />
              <input
                placeholder="Search by TDS, Volume..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </FilterItem>
          <ActionButton onClick={fetchHistory} disabled={loading}>
            <MdFilterList /> Apply Filters
          </ActionButton>
        </FiltersWrapper>

        {loading ? (
          <TableContainer>
            <LoadingSkeleton>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => <div key={i} className="row" />)}
            </LoadingSkeleton>
          </TableContainer>
        ) : error ? (
          <EmptyState>
            <MdError className="icon" />
            <h3>Failed to load history</h3>
            <p>{error}</p>
            <ActionButton onClick={fetchHistory}>Try Again</ActionButton>
          </EmptyState>
        ) : filteredData.length === 0 ? (
          <EmptyState>
            <MdHistory className="icon" />
            <h3>No logs found</h3>
            <p>Try adjusting your filters or search terms.</p>
          </EmptyState>
        ) : (
          <>
            <TableContainer>
              <TableScroll>
                <StyledTable>
                  <thead>
                    <tr>
                      <Th>#</Th>
                      <Th>Timestamp</Th>
                      <Th>TDS In</Th>
                      <Th>TDS Out</Th>
                      <Th>LPS</Th>
                      <Th>UV</Th>
                      <Th>Flow Sensor</Th>
                      <Th>Plan Limit</Th>
                      <Th>Filter Life</Th>
                      <Th>Total Vol.</Th>
                      <Th>Remaining</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((h, i) => (
                      <tr key={h._id}>
                        <IndexTd>{(page - 1) * pageSize + i + 1}</IndexTd>
                        <TimestampTd>{formatIST(h.timestamp)}</TimestampTd>
                        <Td>{h.tds_in} ppm</Td>
                        <Td>{h.tds_out} ppm</Td>
<Td>
  <Indicator error={h.lps_error}>
    {h.lps_error ? 'Error' : 'Healthy'}
  </Indicator>
</Td>

<Td>
  <Indicator error={h.flow_sensor_error}>
    {h.flow_sensor_error ? 'Error' : 'Healthy'}
  </Indicator>
</Td>

<Td>
  <Indicator error={h.uv_error}>
    {h.uv_error ? 'Error' : 'Healthy'}
  </Indicator>
</Td>
                        <Td>{h.plan_limit} L</Td>
                        <Td>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                             <div style={{ width: '40px', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                               <div style={{ width: `${h.filter_life || 0}%`, height: '100%', background: h.filter_life < 20 ? '#ef4444' : '#16a34a' }} />
                             </div>
                             {h.filter_life}%
                          </div>
                        </Td>
                        <VolumeTd>{h.total_litres} L</VolumeTd>
                        <Td>{h.rem_litres} L</Td>
                      </tr>
                    ))}
                  </tbody>
                </StyledTable>
              </TableScroll>
            </TableContainer>

            <PaginationWrapper>
              <div className="meta">
                Showing <strong>{(page - 1) * pageSize + 1}</strong>–
                <strong>{Math.min(page * pageSize, filteredData.length)}</strong> of{' '}
                <strong>{filteredData.length}</strong> logs
              </div>

              <div className="controls">
                <NavButton
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  <MdChevronLeft />
                </NavButton>
                <div style={{ display: 'flex', alignItems: 'center', padding: '0 1rem', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>
                  Page {page} of {totalPages}
                </div>
                <NavButton
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  <MdChevronRight />
                </NavButton>
              </div>
            </PaginationWrapper>
          </>
        )}
      </PageContainer>
    </HeadAdminNavbar>
  );
}
