import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import HeadAdminNavbar from '../../components/Navbar/HeadAdminNavbar';
import {
  getServiceRequests,
  getAvailableServiceTechnicians,
  assignServiceTechnician,
  updateServiceRequestStatus,
  removeServiceTechnician,
} from '../../services/headAdminService';

/* =========================
   PAGE LAYOUT
========================= */

const Page = styled.div`
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  min-height: 100vh;
`;

const Container = styled.div`
  max-width: 1500px;
  margin: 0 auto;
  padding: 0px 24px 24px;
`;

const HeaderSection = styled.div`
  margin-bottom: 32px;
`;

const PageTitle = styled.h1`
  font-size: 32px;
  font-weight: 900;
  color: #0f172a;
  margin-bottom: 8px;
`;

const PageDescription = styled.p`
  font-size: 14px;
  color: #64748b;
`;

/* =========================
   STATS CARDS
========================= */

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 32px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StatCard = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border-color: #cbd5e1;
  }
`;

const StatLabel = styled.div`
  font-size: 13px;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 900;
  color: ${(p) => p.color || '#0f172a'};
`;

const StatIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${(p) => p.bgColor || '#f1f5f9'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-bottom: 12px;
`;

/* =========================
   FILTERS
========================= */

const ControlsSection = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 250px;
  padding: 10px 16px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  &::placeholder {
    color: #94a3b8;
  }
`;

const FilterSelect = styled.select`
  padding: 10px 16px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
`;

/* =========================
   TABLE
========================= */

const TableWrapper = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  padding: 16px;
  background: #f8fafc;
  font-size: 12px;
  font-weight: 700;
  text-align: left;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #e2e8f0;
`;

const Td = styled.td`
  padding: 16px;
  font-size: 14px;
  const weight: 500;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
  color: #334155;
`;

const TableRow = styled.tr`
  transition: all 0.2s ease;

  &:hover {
    background: #f8fafc;
  }

  &:last-child ${Td} {
    border-bottom: none;
  }
`;

/* =========================
   USER & DEVICE INFO
========================= */

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserName = styled.div`
  font-weight: 700;
  font-size: 14px;
  color: #0f172a;
`;

const SecondaryText = styled.div`
  font-size: 12px;
  color: #94a3b8;
`;

const LocationText = styled.div`
  font-size: 13px;
  color: #64748b;
  line-height: 1.6;
`;

/* =========================
   STATUS BADGES
========================= */

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  background: ${(p) =>
    p.status === 'OPEN' ? '#fee2e2' :
    p.status === 'CLOSED' ? '#d1fae5' :
    '#f3f4f6'};
  color: ${(p) =>
    p.status === 'OPEN' ? '#b91c1c' :
    p.status === 'CLOSED' ? '#047857' :
    '#6b7280'};
`;

const StatusDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  animation: ${(p) => (p.pulse ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none')};

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;

const ServiceTypeBadge = styled.span`
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: #dbeafe;
  color: #0c4a6e;
`;

/* =========================
   INPUTS & BUTTONS
========================= */

const SelectControl = styled.select`
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  font-size: 13px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  &:disabled {
    background: #f1f5f9;
    cursor: not-allowed;
    color: #94a3b8;
  }
`;

const ActionGroup = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const TechnicianBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: #d1fae5;
  color: #047857;
`;

const Muted = styled.div`
  font-size: 12px;
  color: #94a3b8;
`;

const EmptyState = styled.div`
  padding: 60px 24px;
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const EmptyText = styled.p`
  font-size: 16px;
  color: #64748b;
  margin: 0;
`;

/* =========================
   MODAL
========================= */

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-in-out;
  padding: 16px;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @media (max-width: 768px) {
    padding: 12px;
  }
`;

const ModalBox = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 20px;
  padding: 0;
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05);
  animation: scaleUp 0.3s ease-in-out;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 250px;
    height: 250px;
    background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
  }

  @keyframes scaleUp {
    from {
      transform: scale(0.92);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  @media (max-width: 768px) {
    max-width: 95%;
  }
`;

const ModalHeader = styled.div`
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  padding: 32px;
  position: relative;
  z-index: 1;
  color: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
`;

const ModalTitle = styled.h3`
  font-size: 28px;
  font-weight: 900;
  color: white;
  margin: 0 0 8px 0;
`;

const ModalSubtitle = styled.p`
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
  font-weight: 500;
`;

const SectionHeading = styled.h4`
  font-size: 14px;
  font-weight: 800;
  color: #2563eb;
  margin: 0 0 14px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: '';
    width: 4px;
    height: 16px;
    background: linear-gradient(180deg, #2563eb, #60a5fa);
    border-radius: 2px;
  }
`;

const DetailsSection = styled.div`
  position: relative;
  z-index: 1;
  overflow-y: auto;
  padding: 32px;
  flex: 1;
`;

const DetailGroup = styled.div`
  margin-bottom: 28px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e2e8f0;

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  font-size: 14px;
  margin-bottom: 14px;
  color: #334155;

  &:last-child {
    margin-bottom: 0;
  }

  @media (max-width: 600px) {
    flex-direction: column;
    gap: 6px;
  }
`;

const DetailLabel = styled.span`
  font-weight: 700;
  color: #64748b;
  min-width: 150px;
  flex-shrink: 0;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
`;

const DetailValue = styled.span`
  color: #0f172a;
  font-weight: 600;
  text-align: right;
  flex: 1;
  word-break: break-word;

  @media (max-width: 600px) {
    text-align: left;
  }
`;

const DetailDate = styled.div`
  font-size: 13px;
  color: #94a3b8;
  font-weight: 500;
`;

const ModalActions = styled.div`
  display: flex;
  gap: 12px;
  padding: 24px 32px;
  position: relative;
  z-index: 1;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  flex-shrink: 0;
`;

const CloseButton = styled.button`
  flex: 1;
  padding: 11px 24px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background: white;
  color: #475569;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;

  &:hover {
    background: #f1f5f9;
    border-color: #94a3b8;
    transform: translateY(-1px);
  }

  &:active {
    transform: scale(0.98);
  }
`;

const PrimaryButton = styled.button`
  flex: 1;
  padding: 11px 24px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: white;
  font-weight: 700;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 8px 16px rgba(37, 99, 235, 0.4);
    transform: translateY(-2px);
  }

  &:active {
    transform: scale(0.98);
  }
`;

const ViewMoreButton = styled.button`
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  border: none;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  transition: all 0.3s ease;
  color: white;

  &:hover {
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    transform: translateY(-2px);
  }

  &:active {
    transform: scale(0.98);
  }
`;

/* =========================
   HELPERS
========================= */

const formatLocation = (loc) =>
  loc
    ? [
        loc.street,
        loc.area,
        loc.city,
        loc.state,
        loc.country,
        loc.postal_code,
      ]
        .filter(Boolean)
        .join(', ') || '—'
    : '—';

/* =========================
   COMPONENT
========================= */

export default function ServiceRequest() {
  const [requests, setRequests] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [allRequests, setAllRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);

  /* =========================
     LOAD DATA
  ========================= */

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await getServiceRequests({ search, status });
      setRequests(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  const loadAllRequests = async () => {
    try {
      const res = await getServiceRequests({});
      setAllRequests(res.data || []);
    } catch (error) {
      console.error('Failed to load all requests for stats', error);
    }
  };

  const loadTechnicians = async () => {
    const res = await getAvailableServiceTechnicians();
    setTechnicians(res.data || []);
  };

  useEffect(() => {
    loadRequests();
    loadAllRequests();
    loadTechnicians();
  }, [status]);

  /* =========================
     ACTIONS
  ========================= */

  const handleAssign = async (requestId, techId) => {
    if (!techId) return;
    if (!window.confirm('Assign this technician?')) return;

    await assignServiceTechnician(requestId, techId);
    loadRequests();
    loadAllRequests();
    loadTechnicians();
  };

  const handleStatusChange = async (id, newStatus) => {
    if (!window.confirm(`Change status to "${newStatus}"?`)) return;

    await updateServiceRequestStatus(id, newStatus);
    loadRequests();
    loadAllRequests();
    loadTechnicians();
  };

  // Calculate stats
const stats = {
  total: allRequests.length,
open: allRequests.filter(
  (r) => r.status === 'OPEN'
).length,

closed: allRequests.filter(
  (r) => r.status === 'CLOSED'
).length,
};

const handleRemove = async (id) => {
  if (!window.confirm('Remove this technician?')) return;

  try {
    await removeServiceTechnician(id);

    // refresh data
    loadRequests();
    loadAllRequests();
    loadTechnicians();

  } catch (error) {
    console.error('Failed to remove technician', error);
    alert('Failed to remove technician');
  }
};

  /* =========================
     RENDER
  ========================= */

  return (
    <HeadAdminNavbar>
      <Page>
        <Container>
          <HeaderSection>
            <PageTitle>Service Requests</PageTitle>
          </HeaderSection>

          {/* Stats Cards */}
          <StatsGrid>
            <StatCard>
              <StatIcon bgColor="#dbeafe">🔧</StatIcon>
              <StatLabel>Total Requests</StatLabel>
              <StatValue color="#2563eb">{stats.total}</StatValue>
            </StatCard>

            <StatCard>
              <StatIcon bgColor="#fee2e2">📋</StatIcon>
              <StatLabel>Open</StatLabel>
              <StatValue color="#dc2626">{stats.open}</StatValue>
            </StatCard>

            <StatCard>
              <StatIcon bgColor="#d1fae5">✓</StatIcon>
              <StatLabel>Closed</StatLabel>
              <StatValue color="#059669">{stats.closed}</StatValue>
            </StatCard>
          </StatsGrid>

          {/* Search & Filters */}
          <ControlsSection>
            <SearchInput
              placeholder="Search by device ID or user name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadRequests()}
            />

            <FilterSelect value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All Status</option>
<option value="OPEN">Open</option>
<option value="CLOSED">Closed</option>
            </FilterSelect>
          </ControlsSection>

          {/* Table */}
          <TableWrapper>
            {!loading && requests.length === 0 && allRequests.length > 0 ? (
              <EmptyState>
                <EmptyIcon>🔍</EmptyIcon>
                <EmptyText>No service requests match your filters</EmptyText>
              </EmptyState>
            ) : !loading && requests.length === 0 ? (
              <EmptyState>
                <EmptyIcon>🔧</EmptyIcon>
                <EmptyText>No service requests available</EmptyText>
              </EmptyState>
            ) : loading ? (
              <EmptyState>
                <EmptyIcon>⏳</EmptyIcon>
                <EmptyText>Loading service requests...</EmptyText>
              </EmptyState>
            ) : (
              <Table>
                <thead>
                  <tr>
                    <Th>User & Device</Th>
                    <Th>Service Type</Th>
                    <Th>Location</Th>
                    <Th>Status</Th>
                    <Th>Technician Assignment</Th>
                    <Th>More Data</Th>
                  </tr>
                </thead>

                <tbody>
                  {requests.map((r) => (
                    <TableRow key={r._id}>
                      <Td>
                        <UserInfo>
                          <UserName>{r.user_name || '—'}</UserName>
                          <SecondaryText>Device: {r.device_id}</SecondaryText>
                        </UserInfo>
                      </Td>

                      <Td>
                        <ServiceTypeBadge>{r.service_type}</ServiceTypeBadge>
                      </Td>

                      <Td>
                        <LocationText>{formatLocation(r.location)}</LocationText>
                      </Td>

                      <Td>
                        <ActionGroup>
<SelectControl
  value={r.status?.toUpperCase()}
onChange={(e) =>
  handleStatusChange(r._id, e.target.value)
}
>
  <option value="OPEN">OPEN</option>
  <option
    value="CLOSED"
    disabled={r.technician_approval_status !== 'ACCEPTED'}
  >
    CLOSED
  </option>
</SelectControl>
                        </ActionGroup>
                      </Td>

<Td>
  {!r.assigned_to ? (
    <SelectControl
      onChange={(e) => handleAssign(r._id, e.target.value)}
    >
      <option value="">Assign Technician</option>
      {technicians.map((t) => (
        <option key={t.user_id} value={t.user_id}>
          {t.user_name?.first_name} {t.user_name?.last_name}
        </option>
      ))}
    </SelectControl>
  ) : (
    <div>
      <TechnicianBadge>
        {r.assigned_technician_name || 'Technician'}
      </TechnicianBadge>

      <Muted>
        {r.technician_approval_status === 'PENDING' && 'Awaiting Approval...'}
        {r.technician_approval_status === 'ACCEPTED' && 'Approved ✓'}
        {r.technician_approval_status === 'REJECTED' && 'Rejected ✕'}
      </Muted>

      {/* REMOVE BUTTON ONLY IF PENDING */}
      {r.technician_approval_status === 'PENDING' && (
        <div style={{ marginTop: '8px' }}>
          <button
            style={{
              background: '#ef4444',
              color: 'white',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600'
            }}
            onClick={() => handleRemove(r._id)}
          >
            Remove
          </button>
        </div>
      )}
    </div>
  )}
</Td>
                      <Td>
  <ViewMoreButton
    onClick={() => setSelectedRequest(r)}
    title="View details"
  >
    View More
  </ViewMoreButton>
</Td>
                    </TableRow>
                  ))}
                </tbody>
              </Table>
            )}
          </TableWrapper>
        </Container>

        {/* Detail Modal */}
        {selectedRequest && (
          <ModalOverlay onClick={() => setSelectedRequest(null)}>
            <ModalBox onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <ModalTitle>Service Request Details</ModalTitle>
                <ModalSubtitle>
                  Request ID: {selectedRequest._id?.substring(0, 8)}...
                </ModalSubtitle>
              </ModalHeader>

              <DetailsSection>
                {/* Request Information Section */}
                <DetailGroup>
                  <SectionHeading>Request Information</SectionHeading>
                  <DetailRow>
                    <DetailLabel>User Name</DetailLabel>
                    <DetailValue>{selectedRequest.user_name || '—'}</DetailValue>
                  </DetailRow>
                  <DetailRow>
                    <DetailLabel>Device ID</DetailLabel>
                    <DetailValue>{selectedRequest.device_id || '—'}</DetailValue>
                  </DetailRow>
                </DetailGroup>

                {/* Service Details Section */}
                <DetailGroup>
                  <SectionHeading>Service Details</SectionHeading>
                  <DetailRow>
                    <DetailLabel>Service Type</DetailLabel>
                    <DetailValue>
                      {selectedRequest.service_type || selectedRequest.request_type || '—'}
                    </DetailValue>
                  </DetailRow>
                  <DetailRow>
                    <DetailLabel>Current Status</DetailLabel>
                    <DetailValue>
                      <StatusBadge status={selectedRequest.status?.toLowerCase()}>
                        <StatusDot pulse={selectedRequest.status?.toLowerCase() === 'OPEN'} />
                        {selectedRequest.status?.toUpperCase() || '—'}
                      </StatusBadge>
                    </DetailValue>
                  </DetailRow>
                </DetailGroup>

                {/* Timeline Section */}
                <DetailGroup>
                  <SectionHeading>Timeline</SectionHeading>
                  <DetailRow>
                    <DetailLabel>Scheduled At</DetailLabel>
                    <DetailValue>
                      {selectedRequest.scheduled_at
                        ? new Date(selectedRequest.scheduled_at).toLocaleString()
                        : '—'}
                    </DetailValue>
                  </DetailRow>
                  <DetailRow>
                    <DetailLabel>Arrived At</DetailLabel>
                    <DetailValue>
                      {selectedRequest.arrived_at
                        ? new Date(selectedRequest.arrived_at).toLocaleString()
                        : '—'}
                    </DetailValue>
                  </DetailRow>
                  <DetailRow>
                    <DetailLabel>Completed At</DetailLabel>
                    <DetailValue>
                      {selectedRequest.completed_at
                        ? new Date(selectedRequest.completed_at).toLocaleString()
                        : '—'}
                    </DetailValue>
                  </DetailRow>
                </DetailGroup>

                {/* Additional Information Section */}
                {selectedRequest.replaced_parts && selectedRequest.replaced_parts.length > 0 && (
                  <DetailGroup>
                    <SectionHeading>Replaced Parts</SectionHeading>
                    <DetailRow>
                      <DetailValue style={{ width: '100%' }}>
                        {selectedRequest.replaced_parts.join(', ')}
                      </DetailValue>
                    </DetailRow>
                  </DetailGroup>
                )}

                {/* Observations Section */}
                {selectedRequest.observations && (
                  <DetailGroup>
                    <SectionHeading>Observations</SectionHeading>
                    <DetailRow>
                      <DetailLabel>Severity</DetailLabel>
                      <DetailValue>
                        {selectedRequest.observations.severity || '—'}
                      </DetailValue>
                    </DetailRow>
                    <DetailRow>
                      <DetailLabel>Notes</DetailLabel>
                      <DetailValue>
                        {selectedRequest.observations.notes || '—'}
                      </DetailValue>
                    </DetailRow>
                  </DetailGroup>
                )}

                {/* Metadata Section */}
                <DetailGroup>
                  <SectionHeading>Metadata</SectionHeading>
<DetailRow>
  <DetailLabel>Created At</DetailLabel>
  <DetailValue>
    {selectedRequest.createdAt || selectedRequest.created_at
      ? new Date(
          selectedRequest.createdAt || selectedRequest.created_at
        ).toLocaleString()
      : '—'}
  </DetailValue>
</DetailRow>
                </DetailGroup>
              </DetailsSection>

              <ModalActions>
                <CloseButton onClick={() => setSelectedRequest(null)}>
                  Close
                </CloseButton>
                <PrimaryButton onClick={() => setSelectedRequest(null)}>
                  Done
                </PrimaryButton>
              </ModalActions>
            </ModalBox>
          </ModalOverlay>
        )}
      </Page>
    </HeadAdminNavbar>
  );
}
