import React, { useEffect, useState, useMemo } from 'react';
import styled from 'styled-components';
import { getTransactions } from '../../services/superAdminService';
import SuperAdminNavbar from '../../components/Navbar/SuperAdminNavbar';

/* =========================
   STYLES
========================= */
const Page = styled.div`
  display: flex;
  flex-direction: column;
  gap: 28px;
  padding: 32px;
  background: #f8fafc;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const HeaderContent = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
`;

const Subtitle = styled.p`
  color: #64748b;
  margin: 0;
  font-size: 0.95rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 4px;
`;

const StatCard = styled.div`
  background: white;
  padding: 16px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);

  @media (max-width: 768px) {
    padding: 12px;
  }
`;

const StatLabel = styled.p`
  font-size: 0.8rem;
  color: #64748b;
  margin: 0 0 4px 0;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  font-weight: 500;
`;

const StatValue = styled.p`
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
`;

const SearchSection = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  align-items: center;

  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const SearchBox = styled.input`
  padding: 11px 14px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background: white;
  width: 300px;
  font-size: 0.95rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  @media (max-width: 640px) {
    width: 100%;
  }
`;

const DataCard = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const CardHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
  background: #f8fafc;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  padding: 14px 16px;
  background: #f8fafc;
  text-align: left;
  font-size: 0.8rem;
  font-weight: 600;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  border-bottom: 1px solid #e5e7eb;
`;

const Td = styled.td`
  padding: 14px 16px;
  font-size: 0.9rem;
  color: #334155;
  border-bottom: 1px solid #e5e7eb;

  &:first-child {
    font-weight: 500;
    color: #1e293b;
  }
`;

const Tr = styled.tr`
  &:hover {
    background: #f8fafc;
  }

  &:last-child ${Td} {
    border-bottom: none;
  }
`;

const OrgBadge = styled.span`
  display: inline-block;
  padding: 5px 12px;
  border-radius: 6px;
  background: #e0e7ff;
  color: #3730a3;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
`;

const GatewayBadge = styled.span`
  display: inline-block;
  padding: 5px 12px;
  border-radius: 6px;
  background: #f0e7fe;
  color: #7c3aed;
  font-size: 0.8rem;
  font-weight: 600;
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: capitalize;
  white-space: nowrap;

  background: ${(p) => {
    switch (p.$status?.toLowerCase()) {
      case 'success':
        return '#dcfce7';
      case 'completed':
        return '#dcfce7';
      case 'failed':
        return '#fee2e2';
      case 'pending':
        return '#fef3c7';
      default:
        return '#f1f5f9';
    }
  }};

  color: ${(p) => {
    switch (p.$status?.toLowerCase()) {
      case 'success':
        return '#166534';
      case 'completed':
        return '#166534';
      case 'failed':
        return '#991b1b';
      case 'pending':
        return '#92400e';
      default:
        return '#475569';
    }
  }};
`;

const AmountCell = styled.span`
  font-weight: 600;
  color: #1e293b;
  font-size: 0.95rem;
`;

const Empty = styled.div`
  padding: 48px 24px;
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 12px;
`;

const EmptyText = styled.p`
  color: #64748b;
  margin: 0;
  font-size: 0.95rem;
`;

const LoadingSpinner = styled.div`
  padding: 24px;
  text-align: center;
  color: #64748b;
  font-size: 0.95rem;
`;

/* =========================
   COMPONENT
========================= */
const Transaction = () => {
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState('');
  const [orgSearch, setOrgSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await getTransactions();
      setTransactions(res.data || []);
    } catch {
      alert('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     FILTER
  ========================= */
  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const text = `
        ${t.txn_id || ''}
        ${t.device_id || ''}
        ${t.payment_gateway || ''}
        ${t.status || ''}
      `.toLowerCase();

      const orgText = (t.org_id || '').toLowerCase();

      return (
        text.includes(search.toLowerCase()) &&
        orgText.includes(orgSearch.toLowerCase())
      );
    });
  }, [transactions, search, orgSearch]);

  /* =========================
     STATS CALCULATION
  ========================= */
  const stats = useMemo(() => {
    const totalTransactions = transactions.length;
    const totalRevenue = transactions.reduce((sum, t) => sum + (t.price || 0), 0);
    const successCount = transactions.filter(
      (t) => t.status?.toLowerCase() === 'success' || t.status?.toLowerCase() === 'completed'
    ).length;

    return {
      totalTransactions,
      totalRevenue,
      successCount,
    };
  }, [transactions]);

  return (
    <SuperAdminNavbar>
      <Page>
        <Header>
          <HeaderContent>
            <Title>Transactions</Title>
            <Subtitle>
              Monitor and manage all payment transactions across your organizations
            </Subtitle>
          </HeaderContent>
        </Header>

        {/* STATS */}
        <StatsGrid>
          <StatCard>
            <StatLabel>Total Transactions</StatLabel>
            <StatValue>{stats.totalTransactions}</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Total Revenue</StatLabel>
            <StatValue>
              ₹{stats.totalRevenue.toLocaleString('en-IN')}
            </StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Successful Transactions</StatLabel>
            <StatValue>{stats.successCount}</StatValue>
          </StatCard>
        </StatsGrid>

        {/* SEARCH */}
        <SearchSection>
          <SearchBox
            placeholder="🔍 Search by transaction ID, device, or gateway..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <SearchBox
            placeholder="🏢 Search by organization ID..."
            value={orgSearch}
            onChange={(e) => setOrgSearch(e.target.value)}
          />
        </SearchSection>

        {/* TABLE */}
        <DataCard>
          <CardHeader>
            <CardTitle>
              {loading ? '...' : `${filtered.length} Transaction${filtered.length !== 1 ? 's' : ''}`}
            </CardTitle>
          </CardHeader>

          {loading ? (
            <LoadingSpinner>Loading transactions…</LoadingSpinner>
          ) : filtered.length === 0 ? (
            <Empty>
              <EmptyIcon>💳</EmptyIcon>
              <EmptyText>
                {transactions.length === 0
                  ? 'No transactions found. They will appear here.'
                  : 'No transactions match your search.'}
              </EmptyText>
            </Empty>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>#</Th>
                  <Th>Organization</Th>
                  <Th>Txn ID</Th>
                  <Th>Amount</Th>
                  <Th>Gateway</Th>
                  <Th>Status</Th>
                  <Th>Date</Th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((t, index) => (
                  <Tr key={t._id}>
                    <Td>{index + 1}</Td>
                    <Td>
                      <OrgBadge>{t.org_id || '—'}</OrgBadge>
                    </Td>
                    <Td>
                      <code style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        {t.txn_id || '—'}
                      </code>
                    </Td>
                    <Td>
                      <AmountCell>
                        ₹{t.price ? t.price.toLocaleString('en-IN') : '0'} {t.currency}
                      </AmountCell>
                    </Td>
                    <Td>
                      <GatewayBadge>{t.payment_gateway || '—'}</GatewayBadge>
                    </Td>
                    <Td>
                      <StatusBadge $status={t.status}>
                        {t.status || '—'}
                      </StatusBadge>
                    </Td>
                    <Td>
                      {t.date
                        ? new Date(t.date).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : '—'}
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          )}
        </DataCard>
      </Page>
    </SuperAdminNavbar>
  );
};

export default Transaction;
