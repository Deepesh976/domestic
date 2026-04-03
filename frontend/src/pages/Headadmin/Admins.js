import React, { useEffect, useState, useMemo } from 'react';
import axios from '../../utils/axiosConfig';
import HeadAdminNavbar from '../../components/Navbar/HeadAdminNavbar';
import styled from 'styled-components';

/* =========================
   STYLES
========================= */
const Page = styled.div`
  padding: 32px;
  background: #f8fafc;
  min-height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
  gap: 28px;
`;

const HeaderSection = styled.div`
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

const Actions = styled.div`
  display: flex;
  gap: 12px;
`;

const CreateButton = styled.button`
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  color: white;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
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

const DataCard = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow-x: auto;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
`;

const CardHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
  background: #f8fafc;
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
  font-size: 0.8rem;
  text-align: left;
  color: #475569;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
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

const RoleBadge = styled.span`
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: capitalize;
  white-space: nowrap;
  background: ${(p) => (p.$role === 'headadmin' ? '#e9d5ff' : '#e0e7ff')};
  color: ${(p) => (p.$role === 'headadmin' ? '#6b21a8' : '#3730a3')};
`;

const KycLink = styled.button`
  background: none;
  border: none;
  color: #2563eb;
  cursor: pointer;
  font-weight: 600;
  padding: 0;
  text-decoration: underline;
  transition: color 0.2s ease;

  &:hover {
    color: #1d4ed8;
  }
`;

const ActionGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionBtn = styled.button`
  padding: 8px 14px;
  font-size: 0.85rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  color: white;
  font-weight: 600;
  transition: all 0.2s ease;

  &.edit {
    background: #16a34a;

    &:hover {
      background: #15803d;
      transform: translateY(-1px);
      box-shadow: 0 2px 6px rgba(22, 163, 74, 0.3);
    }
  }

  &.delete {
    background: #dc2626;

    &:hover {
      background: #b91c1c;
      transform: translateY(-1px);
      box-shadow: 0 2px 6px rgba(220, 38, 38, 0.3);
    }
  }

  &:active {
    transform: translateY(0);
  }
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

/* ================= MODAL STYLES ================= */
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.2s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const ModalContent = styled.div`
  background: white;
  padding: 0;
  border-radius: 16px;
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.25);
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
  position: relative;

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 640px) {
    border-radius: 12px;
  }
`;

const ModalHeader = styled.div`
  padding: 28px 32px;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  border-bottom: none;
  margin-bottom: 0;
  border-radius: 16px 16px 0 0;

  @media (max-width: 640px) {
    padding: 24px 20px;
  }
`;

const ModalTitle = styled.h2`
  margin: 0 0 6px 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
`;

const ModalSubtitle = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.85);
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: white;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  border-radius: 6px;
  z-index: 10;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: rotate(90deg);
  }

  &:active {
    transform: rotate(90deg) scale(0.95);
  }
`;

const FormBody = styled.div`
  padding: 32px;

  @media (max-width: 640px) {
    padding: 24px 20px;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 20px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FormLabel = styled.label`
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
`;

const FormInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const FormInput = styled.input`
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  background: white;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  width: 100%;

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  &:disabled {
    background: #f1f5f9;
    cursor: not-allowed;
  }
`;

const PasswordToggleBtn = styled.button`
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  cursor: pointer;
  color: #64748b;
  font-size: 1.1rem;
  padding: 6px 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;

  &:hover {
    color: #1e293b;
  }

  &:active {
    transform: scale(0.95);
  }
`;

const FormSelect = styled.select`
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  background: white;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  &:disabled {
    background: #f1f5f9;
    cursor: not-allowed;
  }
`;

const Divider = styled.hr`
  margin: 20px 0;
  border: none;
  border-top: 1px solid #e5e7eb;
`;

const SectionTitle = styled.h4`
  margin: 0 0 16px 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
  text-transform: uppercase;
  letter-spacing: 0.3px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
  justify-content: flex-end;
`;

const Button = styled.button`
  padding: 10px 18px;
  border-radius: 6px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;

  ${(p) =>
    p.$primary
      ? `
    background: #2563eb;
    color: white;

    &:hover:not(:disabled) {
      background: #1d4ed8;
      box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
    }
  `
      : `
    background: #e2e8f0;
    color: #334155;

    &:hover:not(:disabled) {
      background: #cbd5e1;
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.span`
  color: #dc2626;
  font-size: 0.85rem;
  margin-top: 4px;
`;

/* =========================
   COMPONENT
========================= */
export default function Admins() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedAdminId, setSelectedAdminId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [kycImage, setKycImage] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    phone_number: '',
    flat_no: '',
    area: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
    doc_type: '',
    doc_detail: '',
  });

  /* =========================
     FETCH ADMINS
  ========================= */
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/headadmin/admins');
      setAdmins(res.data.admins || []);
    } catch (error) {
      console.error(error);
      alert('Failed to load admins');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  /* =========================
     MODAL HANDLERS
  ========================= */
  const openCreateModal = () => {
    setModalMode('create');
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (admin) => {
    setModalMode('edit');
    setSelectedAdminId(admin._id);
    setForm({
      username: admin.username || '',
      email: admin.email || '',
      password: '',
      phone_number: admin.phone_number || '',
      flat_no: admin.flat_no || '',
      area: admin.area || '',
      city: admin.city || '',
      state: admin.state || '',
      country: admin.country || '',
      postal_code: admin.postal_code || '',
      doc_type: admin.kyc_details?.doc_type || '',
      doc_detail: admin.kyc_details?.doc_detail || '',
    });
    setKycImage(null);
    setFormErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setForm({
      username: '',
      email: '',
      password: '',
      phone_number: '',
      flat_no: '',
      area: '',
      city: '',
      state: '',
      country: '',
      postal_code: '',
      doc_type: '',
      doc_detail: '',
    });
    setKycImage(null);
    setFormErrors({});
    setSelectedAdminId(null);
    setShowPassword(false);
  };

  /* =========================
     FORM HANDLERS
  ========================= */
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = {};
    if (!form.username) errors.username = 'Username is required';
    if (!form.email) errors.email = 'Email is required';
    if (modalMode === 'create' && !form.password) {
      errors.password = 'Password is required';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setFormLoading(true);

      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });

      if (kycImage) {
        formData.append('kyc_image', kycImage);
      }

      if (modalMode === 'create') {
        await axios.post('/api/headadmin/admins', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        alert('Admin created successfully');
      } else {
        await axios.put(`/api/headadmin/admins/${selectedAdminId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        alert('Admin updated successfully');
      }

      fetchAdmins();
      closeModal();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Operation failed');
    } finally {
      setFormLoading(false);
    }
  };

  /* =========================
     DELETE ADMIN
  ========================= */
  const deleteAdmin = async (admin) => {
    if (!window.confirm('Delete this admin?')) return;

    try {
      await axios.delete(`/api/headadmin/admins/${admin._id}`);
      fetchAdmins();
    } catch (error) {
      console.error(error);
      alert('Failed to delete admin');
    }
  };

  /* =========================
     HELPERS
  ========================= */
  const formatAddress = (a) =>
    [
      a.flat_no,
      a.area,
      a.city,
      a.state,
      a.country,
      a.postal_code && `- ${a.postal_code}`,
    ]
      .filter(Boolean)
      .join(', ') || '—';

  const getInitials = (username = '') => {
    return (username.charAt(0) || 'A').toUpperCase();
  };

  const stats = useMemo(() => {
    const totalAdmins = admins.length;
    const headAdminCount = admins.filter((a) => a.role === 'headadmin').length;
    const adminCount = admins.filter((a) => a.role === 'admin').length;
    return { totalAdmins, headAdminCount, adminCount };
  }, [admins]);

  return (
    <HeadAdminNavbar>
      <Page>
        <HeaderSection>
          <HeaderContent>
            <Title>Organization Admins</Title>
            <Subtitle>Create and manage admin accounts</Subtitle>
          </HeaderContent>
          <Actions>
            <CreateButton onClick={openCreateModal}>
              + Create Admin
            </CreateButton>
          </Actions>
        </HeaderSection>

        {/* STATS */}
        <StatsGrid>
          <StatCard>
            <StatLabel>Total Admins</StatLabel>
            <StatValue>{stats.totalAdmins}</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Head Admins</StatLabel>
            <StatValue>{stats.headAdminCount}</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Regular Admins</StatLabel>
            <StatValue>{stats.adminCount}</StatValue>
          </StatCard>
        </StatsGrid>

        {/* TABLE */}
        {loading ? (
          <LoadingSpinner>Loading admins…</LoadingSpinner>
        ) : admins.length === 0 ? (
          <Empty>
            <EmptyIcon>👤</EmptyIcon>
            <EmptyText>No admins found. Create one to get started.</EmptyText>
          </Empty>
        ) : (
          <DataCard>
            <CardHeader>
              <CardTitle>{admins.length} Admin{admins.length !== 1 ? 's' : ''}</CardTitle>
            </CardHeader>

            <Table>
              <thead>
                <tr>
                  <Th>#</Th>
                  <Th>Name</Th>
                  <Th>Email</Th>
                  <Th>Phone</Th>
                  <Th>Role</Th>
                  <Th>Address</Th>
                  <Th>KYC</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>

              <tbody>
                {admins.map((a, index) => (
                  <Tr key={a._id}>
                    <Td>{index + 1}</Td>
                    <Td>
                      <NameCell>
                        <Avatar>{getInitials(a.username)}</Avatar>
                        <span>{a.username || '—'}</span>
                      </NameCell>
                    </Td>
                    <Td>
                      <code style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        {a.email || '—'}
                      </code>
                    </Td>
                    <Td>{a.phone_number || '—'}</Td>
                    <Td>
                      <RoleBadge $role={a.role}>{a.role}</RoleBadge>
                    </Td>
                    <Td title={formatAddress(a)}>
                      {formatAddress(a)}
                    </Td>
                    <Td>
                      {a.kyc_details?.kyc_image ? (
                        <KycLink
                          onClick={() =>
                            window.location.href = `/headadmin/admins/${a._id}/kyc`
                          }
                        >
                          View
                        </KycLink>
                      ) : (
                        '—'
                      )}
                    </Td>
                    <Td>
                      <ActionGroup>
                        <ActionBtn
                          className="edit"
                          onClick={() => openEditModal(a)}
                        >
                          Edit
                        </ActionBtn>
                        <ActionBtn
                          className="delete"
                          onClick={() => deleteAdmin(a)}
                        >
                          Delete
                        </ActionBtn>
                      </ActionGroup>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </DataCard>
        )}

        {/* ================= MODAL ================= */}
        {showModal && (
          <ModalOverlay onClick={closeModal}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <CloseBtn onClick={closeModal}>×</CloseBtn>

              <ModalHeader>
                <ModalTitle>
                  {modalMode === 'create' ? 'Create Admin' : 'Edit Admin'}
                </ModalTitle>
                <ModalSubtitle>
                  {modalMode === 'create'
                    ? 'Add a new admin to your organization'
                    : 'Update admin details'}
                </ModalSubtitle>
              </ModalHeader>

              <form onSubmit={handleSubmit}>
                <FormBody>
                  {/* ================= BASIC INFO ================= */}
                  <SectionTitle>Basic Information</SectionTitle>
                <FormGrid>
                  <FormField>
                    <FormLabel>Username *</FormLabel>
                    <FormInput
                      name="username"
                      value={form.username}
                      onChange={handleFormChange}
                      disabled={formLoading}
                    />
                    {formErrors.username && (
                      <ErrorMessage>{formErrors.username}</ErrorMessage>
                    )}
                  </FormField>

                  <FormField>
                    <FormLabel>Email *</FormLabel>
                    <FormInput
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleFormChange}
                      disabled={formLoading}
                    />
                    {formErrors.email && (
                      <ErrorMessage>{formErrors.email}</ErrorMessage>
                    )}
                  </FormField>

                  <FormField>
                    <FormLabel>
                      {modalMode === 'create' ? 'Password *' : 'New Password (optional)'}
                    </FormLabel>
                    <FormInputWrapper>
                      <FormInput
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={form.password}
                        onChange={handleFormChange}
                        disabled={formLoading}
                      />
                      <PasswordToggleBtn
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setShowPassword(!showPassword);
                        }}
                        disabled={formLoading}
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? '👁️' : '👁️‍🗨️'}
                      </PasswordToggleBtn>
                    </FormInputWrapper>
                    {formErrors.password && (
                      <ErrorMessage>{formErrors.password}</ErrorMessage>
                    )}
                  </FormField>

                  <FormField>
                    <FormLabel>Phone Number</FormLabel>
                    <FormInput
                      name="phone_number"
                      value={form.phone_number}
                      onChange={handleFormChange}
                      disabled={formLoading}
                    />
                  </FormField>
                </FormGrid>

                <Divider />

                {/* ================= ADDRESS ================= */}
                <SectionTitle>Address</SectionTitle>
                <FormGrid>
                  <FormField>
                    <FormLabel>Flat No</FormLabel>
                    <FormInput
                      name="flat_no"
                      value={form.flat_no}
                      onChange={handleFormChange}
                      disabled={formLoading}
                    />
                  </FormField>

                  <FormField>
                    <FormLabel>Area</FormLabel>
                    <FormInput
                      name="area"
                      value={form.area}
                      onChange={handleFormChange}
                      disabled={formLoading}
                    />
                  </FormField>

                  <FormField>
                    <FormLabel>City</FormLabel>
                    <FormInput
                      name="city"
                      value={form.city}
                      onChange={handleFormChange}
                      disabled={formLoading}
                    />
                  </FormField>

                  <FormField>
                    <FormLabel>State</FormLabel>
                    <FormInput
                      name="state"
                      value={form.state}
                      onChange={handleFormChange}
                      disabled={formLoading}
                    />
                  </FormField>

                  <FormField>
                    <FormLabel>Country</FormLabel>
                    <FormInput
                      name="country"
                      value={form.country}
                      onChange={handleFormChange}
                      disabled={formLoading}
                    />
                  </FormField>

                  <FormField>
                    <FormLabel>Postal Code</FormLabel>
                    <FormInput
                      name="postal_code"
                      value={form.postal_code}
                      onChange={handleFormChange}
                      disabled={formLoading}
                    />
                  </FormField>
                </FormGrid>

                <Divider />

                {/* ================= KYC ================= */}
                <SectionTitle>KYC Details</SectionTitle>
                <FormGrid>
                  <FormField>
                    <FormLabel>Document Type</FormLabel>
                    <FormSelect
                      name="doc_type"
                      value={form.doc_type}
                      onChange={handleFormChange}
                      disabled={formLoading}
                    >
                      <option value="">Select</option>
                      <option value="Aadhaar">Aadhaar</option>
                      <option value="PAN">PAN</option>
                      <option value="Passport">Passport</option>
                    </FormSelect>
                  </FormField>

                  <FormField>
                    <FormLabel>Document Detail</FormLabel>
                    <FormInput
                      name="doc_detail"
                      value={form.doc_detail}
                      onChange={handleFormChange}
                      disabled={formLoading}
                    />
                  </FormField>

                  <FormField>
                    <FormLabel>
                      {modalMode === 'create' ? 'KYC Image' : 'Re-upload KYC Image'}
                    </FormLabel>
                    <FormInput
                      type="file"
                      accept="image/*"
                      onChange={(e) => setKycImage(e.target.files[0])}
                      disabled={formLoading}
                    />
                  </FormField>
                </FormGrid>

                <ButtonGroup>
                  <Button onClick={closeModal} disabled={formLoading}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    $primary
                    disabled={formLoading}
                  >
                    {formLoading
                      ? modalMode === 'create'
                        ? 'Creating...'
                        : 'Updating...'
                      : modalMode === 'create'
                      ? 'Create Admin'
                      : 'Update Admin'}
                  </Button>
                </ButtonGroup>
                </FormBody>
              </form>
            </ModalContent>
          </ModalOverlay>
        )}
      </Page>
    </HeadAdminNavbar>
  );
}
