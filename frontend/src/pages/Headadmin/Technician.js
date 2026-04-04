import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import HeadAdminNavbar from '../../components/Navbar/HeadAdminNavbar';
import {
  getTechnicians,
  updateTechnician,
} from '../../services/headAdminService';

/* =========================
   PAGE LAYOUT
========================= */

const Page = styled.div`
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  min-height: 100vh;
`;

const Container = styled.div`
  max-width: 1400px;
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
   SEARCH & FILTER
========================= */

const ControlsSection = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 200px;
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
   NAME CELL
========================= */

const NameWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: white;
  font-weight: 700;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
`;

const NameBlock = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const FullName = styled.div`
  font-weight: 700;
  font-size: 14px;
  color: #0f172a;
`;

const Email = styled.div`
  font-size: 12px;
  color: #94a3b8;
`;

const AddressText = styled.div`
  font-size: 12px;
  color: #64748b;
  line-height: 1.5;
`;

/* =========================
   STATUS BADGE
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
    p.status === 'AVAILABLE'
      ? '#d1fae5'
      : p.status === 'ON DUTY'
      ? '#fef3c7'
      : '#fee2e2'};

  color: ${(p) =>
    p.status === 'AVAILABLE'
      ? '#047857'
      : p.status === 'ON DUTY'
      ? '#b45309'
      : '#b91c1c'};
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

const KycStatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;

  background: ${(p) =>
    p.status === 'approved'
      ? '#d1fae5'
      : p.status === 'rejected'
      ? '#fee2e2'
      : '#f3f4f6'};

  color: ${(p) =>
    p.status === 'approved'
      ? '#047857'
      : p.status === 'rejected'
      ? '#b91c1c'
      : '#6b7280'};
`;

/* =========================
   INPUTS & BUTTONS
========================= */

const Select = styled.select`
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
  align-items: center;
`;

const UpdateButton = styled.button`
  padding: 8px 16px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background: #1d4ed8;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
  }

  &:disabled {
    background: #cbd5e1;
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const ImagePreview = styled.button`
  padding: 6px 12px;
  background: #f3f4f6;
  color: #2563eb;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #e5e7eb;
    border-color: #9ca3af;
  }
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

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.15);
`;

const ModalTitle = styled.h3`
  font-size: 20px;
  font-weight: 900;
  color: #0f172a;
  margin-bottom: 16px;
`;

const ModalImage = styled.img`
  width: 100%;
  max-height: 400px;
  border-radius: 8px;
  object-fit: cover;
  margin-bottom: 16px;
`;

const CloseButton = styled.button`
  background: #f1f5f9;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #e2e8f0;
  }
`;

/* =========================
   HELPERS
========================= */

const getTechStatusLabel = (tech) => {
  if (!tech.is_active) return 'OFFLINE';
  if (tech.work_status === 'busy') return 'ON DUTY';
  return 'AVAILABLE';
};

/* =========================
   COMPONENT
========================= */

export default function Technicians() {
  const [technicians, setTechnicians] = useState([]);
  const [changes, setChanges] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [kycFilter, setKycFilter] = useState('all');
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    loadTechnicians();
  }, []);

  const loadTechnicians = async () => {
    setLoading(true);
    try {
      const res = await getTechnicians();
      setTechnicians(res.data || []);
    } catch {
      alert('Failed to load technicians');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (id, field, value) => {
    setChanges((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (tech) => {
    const status = getTechStatusLabel(tech);

    if (status === 'ON DUTY') {
      alert('ON DUTY technician cannot be modified');
      return;
    }

    if (!changes[tech._id]) {
      alert('No changes made');
      return;
    }

    const confirmed = window.confirm(
      `Update technician ${tech.user_name?.first_name} ${tech.user_name?.last_name}?`
    );

    if (!confirmed) return;

    try {
await updateTechnician(tech._id, {
  kyc_approval_status:
    changes[tech._id]?.kyc_approval_status ??
    tech.kyc_details?.kyc_approval_status,

  is_active:
    (changes[tech._id]?.kyc_approval_status ??
      tech.kyc_details?.kyc_approval_status) === 'approved',
});

      alert('Technician updated successfully ✅');
      setChanges({});
      loadTechnicians();
    } catch {
      alert('Failed to update technician');
    }
  };

  // Filter technicians
  const filteredTechnicians = technicians.filter((tech) => {
    const fullName = `${tech.user_name?.first_name || ''} ${
      tech.user_name?.last_name || ''
    }`.toLowerCase();
    const email = (tech.email_address || '').toLowerCase();
    const phone = (tech.phone_number || '').toLowerCase();
    const searchLower = searchTerm.toLowerCase();

    const matchesSearch =
      fullName.includes(searchLower) ||
      email.includes(searchLower) ||
      phone.includes(searchLower);

    const status = getTechStatusLabel(tech);
    const matchesStatus =
      statusFilter === 'all' || status === statusFilter;

    const kycStatus = tech.kyc_details?.kyc_approval_status || 'pending';
    const matchesKyc =
      kycFilter === 'all' || kycStatus === kycFilter;

    return matchesSearch && matchesStatus && matchesKyc;
  });

  // Calculate stats
  const stats = {
    total: technicians.length,
    available: technicians.filter((t) => getTechStatusLabel(t) === 'AVAILABLE')
      .length,
    onDuty: technicians.filter((t) => getTechStatusLabel(t) === 'ON DUTY')
      .length,
    offline: technicians.filter((t) => getTechStatusLabel(t) === 'OFFLINE')
      .length,
  };

  return (
    <HeadAdminNavbar>
      <Page>
        <Container>
          <HeaderSection>
            <PageTitle>All Technicians</PageTitle>
          </HeaderSection>

          {/* Stats Cards */}
          <StatsGrid>
            <StatCard>
              <StatIcon bgColor="#dbeafe">📊</StatIcon>
              <StatLabel>Total Technicians</StatLabel>
              <StatValue color="#2563eb">{stats.total}</StatValue>
            </StatCard>

            <StatCard>
              <StatIcon bgColor="#d1fae5">✓</StatIcon>
              <StatLabel>Available</StatLabel>
              <StatValue color="#059669">{stats.available}</StatValue>
            </StatCard>

            <StatCard>
              <StatIcon bgColor="#fef3c7">⚡</StatIcon>
              <StatLabel>On Duty</StatLabel>
              <StatValue color="#d97706">{stats.onDuty}</StatValue>
            </StatCard>

            <StatCard>
              <StatIcon bgColor="#fee2e2">⊘</StatIcon>
              <StatLabel>Offline</StatLabel>
              <StatValue color="#dc2626">{stats.offline}</StatValue>
            </StatCard>
          </StatsGrid>

          {/* Search & Filters */}
          <ControlsSection>
            <SearchInput
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <FilterSelect
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="AVAILABLE">Available</option>
              <option value="ON DUTY">On Duty</option>
              <option value="OFFLINE">Offline</option>
            </FilterSelect>

            <FilterSelect
              value={kycFilter}
              onChange={(e) => setKycFilter(e.target.value)}
            >
              <option value="all">All KYC Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </FilterSelect>
          </ControlsSection>

          {/* Table */}
          <TableWrapper>
            {!loading && filteredTechnicians.length === 0 && technicians.length > 0 ? (
              <EmptyState>
                <EmptyIcon>🔍</EmptyIcon>
                <EmptyText>No technicians match your filters</EmptyText>
              </EmptyState>
            ) : !loading && technicians.length === 0 ? (
              <EmptyState>
                <EmptyIcon>👥</EmptyIcon>
                <EmptyText>No technicians found</EmptyText>
              </EmptyState>
            ) : loading ? (
              <EmptyState>
                <EmptyIcon>⏳</EmptyIcon>
                <EmptyText>Loading technicians...</EmptyText>
              </EmptyState>
            ) : (
              <Table>
                <thead>
                  <tr>
                    <Th>Name & Contact</Th>
                    <Th>Address</Th>
                    <Th>KYC Document</Th>
                    <Th>KYC Status</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTechnicians.map((tech) => {
                    const status = getTechStatusLabel(tech);
                    const hasKycImage = Boolean(
                      tech.kyc_details?.doc_image
                    );
                    const kycStatus =
                      tech.kyc_details?.kyc_approval_status || 'pending';

                    return (
                      <TableRow key={tech._id}>
                        <Td>
                          <NameWrapper>
                            <Avatar>
                              {tech.user_name?.first_name?.[0]}
                              {tech.user_name?.last_name?.[0]}
                            </Avatar>

                            <NameBlock>
                              <FullName>
                                {tech.user_name?.first_name}{' '}
                                {tech.user_name?.last_name}
                              </FullName>
                              {tech.email_address && (
                                <Email>{tech.email_address}</Email>
                              )}
                              {tech.phone_number && (
                                <Email>{tech.phone_number}</Email>
                              )}
                            </NameBlock>
                          </NameWrapper>
                        </Td>

                        <Td>
                          <AddressText>
                            {tech.address?.flat_no && (
                              <>{tech.address?.flat_no}</>
                            )}
                            {tech.address?.area && (
                              <>
                                <br />
                                {tech.address?.area}
                              </>
                            )}
                            {tech.address?.city && (
                              <>
                                , {tech.address?.city}
                              </>
                            )}
                            {tech.address?.state && (
                              <>
                                , {tech.address?.state}
                              </>
                            )}
                          </AddressText>
                        </Td>

                        <Td>
                          {hasKycImage ? (
                            <ImagePreview
                              onClick={() =>
                                setSelectedImage({
                                  name: `${tech.user_name?.first_name} ${tech.user_name?.last_name}`,
                                  url: `/uploads/kyctechnicians/${tech.kyc_details?.doc_image}`,
                                })
                              }
                            >
                              View Document
                            </ImagePreview>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '13px' }}>
                              Not uploaded
                            </span>
                          )}
                        </Td>

                        <Td>
                          <KycStatusBadge status={kycStatus}>
                            {kycStatus === 'approved' && '✓ '}
                            {kycStatus === 'rejected' && '✗ '}
                            {kycStatus.charAt(0).toUpperCase() +
                              kycStatus.slice(1)}
                          </KycStatusBadge>
                        </Td>

                        <Td>
                          <StatusBadge status={status}>
                            <StatusDot
                              pulse={status === 'AVAILABLE'}
                            />
                            {status}
                          </StatusBadge>
                        </Td>

                        <Td>
                          <ActionGroup>
                            <Select
                              disabled={status === 'ON DUTY'}
                              value={
                                changes[tech._id]?.kyc_approval_status ??
                                kycStatus
                              }
                              onChange={(e) =>
                                handleChange(
                                  tech._id,
                                  'kyc_approval_status',
                                  e.target.value
                                )
                              }
                            >
                              <option value="approved">Approved</option>
                              <option value="pending">Pending</option>
                              <option value="rejected">Rejected</option>
                            </Select>

                            <UpdateButton
                              disabled={status === 'ON DUTY'}
                              onClick={() => handleSubmit(tech)}
                            >
                              Update
                            </UpdateButton>
                          </ActionGroup>
                        </Td>
                      </TableRow>
                    );
                  })}
                </tbody>
              </Table>
            )}
          </TableWrapper>
        </Container>

        {/* Image Preview Modal */}
        {selectedImage && (
          <Modal onClick={() => setSelectedImage(null)}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalTitle>{selectedImage.name}</ModalTitle>
              <ModalImage src={selectedImage.url} alt="KYC Document" />
              <CloseButton onClick={() => setSelectedImage(null)}>
                Close
              </CloseButton>
            </ModalContent>
          </Modal>
        )}
      </Page>
    </HeadAdminNavbar>
  );
}
