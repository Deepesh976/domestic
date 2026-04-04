import React, { useEffect, useState, useMemo } from 'react';
import styled from 'styled-components';
import { getCustomers } from '../../services/superAdminService';
import SuperAdminNavbar from '../../components/Navbar/SuperAdminNavbar';

/* =========================
   STYLES
========================= */
const Page = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px 32px;
  background: #f8fafc;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;

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
  margin-bottom: 0px;
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
  gap: 12px;
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
  width: 280px;
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

const SearchWrapper = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;

  @media (max-width: 768px) {
    width: 100%;
    flex-direction: column;
  }
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
  font-size: 0.95rem;
  color: #334155;
  border-bottom: 1px solid #e5e7eb;
  font-weight: 500;

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

const NameCell = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Avatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.85rem;
  flex-shrink: 0;
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

const LocationBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 4px;
  background: #f0fdf4;
  color: #166534;
  font-size: 0.8rem;
  font-weight: 500;
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
const Customer = () => {
  const [customers, setCustomers] = useState([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [orgSearch, setOrgSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await getCustomers();
      setCustomers(res.data || []);
    } catch {
      alert('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     FILTER
  ========================= */
const filteredCustomers = useMemo(() => {
  return [...customers]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .filter((c) => {
      const customerText = `
        ${c.name || ''}
        ${c.email || ''}
        ${c.phone || ''}
      `.toLowerCase();

      const orgText = (c.org_id || '').toLowerCase();

      return (
        customerText.includes(customerSearch.toLowerCase()) &&
        orgText.includes(orgSearch.toLowerCase())
      );
    });
  }, [customers, customerSearch, orgSearch]);

  /* =========================
     HELPERS
  ========================= */
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    return (
      (parts[0]?.charAt(0) || '') + (parts[1]?.charAt(0) || '')
    ).toUpperCase();
  };

  return (
    <SuperAdminNavbar>
      
      <Page>
                {/* STATS */}
        <StatsGrid>
          <StatCard>
            <StatLabel>Total Customers</StatLabel>
            <StatValue>{customers.length}</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Active Organizations</StatLabel>
            <StatValue>
              {new Set(customers.map((c) => c.org_id)).size}
            </StatValue>
          </StatCard>
        </StatsGrid>
<Header>
  <Title>Customers</Title>

  <SearchWrapper>
    <SearchBox
      placeholder="🔍 Search by name, email, or phone..."
      value={customerSearch}
      onChange={(e) => setCustomerSearch(e.target.value)}
    />

    <SearchBox
      placeholder="🏢 Search by organization ID..."
      value={orgSearch}
      onChange={(e) => setOrgSearch(e.target.value)}
    />
  </SearchWrapper>
</Header>

        {/* TABLE */}
        <DataCard>
          <CardHeader>
            <CardTitle>
              {loading ? '...' : `${filteredCustomers.length} Customer${filteredCustomers.length !== 1 ? 's' : ''}`}
            </CardTitle>
          </CardHeader>

          {loading ? (
            <LoadingSpinner>Loading customers…</LoadingSpinner>
          ) : filteredCustomers.length === 0 ? (
            <Empty>
              <EmptyIcon>👥</EmptyIcon>
              <EmptyText>
                {customers.length === 0
                  ? 'No customers found. They will appear here.'
                  : 'No customers match your search.'}
              </EmptyText>
            </Empty>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>#</Th>
                  <Th>Name</Th>
                  <Th>Email</Th>
                  <Th>Phone</Th>
                  <Th>Organization</Th>
                  <Th>Location</Th>
                </tr>
              </thead>

              <tbody>
                {filteredCustomers.map((c, index) => (
                  <Tr key={c._id}>
                    <Td>{index + 1}</Td>
                    <Td>
                      <NameCell>
                        <Avatar>{getInitials(c.name)}</Avatar>
                        <span>{c.name || '—'}</span>
                      </NameCell>
                    </Td>
                    <Td>
                      <code style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        {c.email || '—'}
                      </code>
                    </Td>
                    <Td>{c.phone || '—'}</Td>
                    <Td>
                      <OrgBadge>{c.org_id || '—'}</OrgBadge>
                    </Td>
                    <Td>
                      {c.city || c.state ? (
                        <LocationBadge>
                          📍 {c.city}
                          {c.city && c.state ? ', ' : ''}
                          {c.state}
                        </LocationBadge>
                      ) : (
                        '—'
                      )}
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

export default Customer;
