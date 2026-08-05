import React, { useEffect, useMemo, useState } from 'react';
import axios from '../../utils/axiosConfig';
import HeadAdminNavbar from '../../components/Navbar/HeadAdminNavbar';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

/* =========================
   STYLES
========================= */

const Page = styled.div`
  padding: 0px 32px;
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

const Toolbar = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;

  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const Search = styled.input`
  padding: 11px 14px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background: white;
  font-size: 0.95rem;
  width: 300px;
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

const DownloadBtn = styled.button`
  padding: 10px 18px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  color: white;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  text-transform: uppercase;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(5, 150, 105, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(5, 150, 105, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

const CreateBtn = styled.button`
  padding: 10px 18px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
  color: white;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  text-transform: uppercase;
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

const TableWrap = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow-x: auto;
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
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #475569;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
  text-align: left;
  white-space: nowrap;
`;

const Td = styled.td`
  padding: 14px 16px;
  font-size: 0.9rem;
  color: #334155;
  border-bottom: 1px solid #e5e7eb;
  vertical-align: middle;

  &:first-child {
    font-weight: 500;
    color: #1e293b;
  }
`;

const Tr = styled.tr`
  transition: all 0.2s ease;

  &:nth-child(even) {
    background: #f9fafb; /* light stripe */
  }

  &:hover {
    background: #eef2ff; /* 👈 highlight */
    transform: scale(1.002);
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

const Select = styled.select`
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  font-size: 0.85rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
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
      case 'approved':
        return '#dcfce7';
      case 'pending':
        return '#fef3c7';
      case 'rejected':
        return '#fee2e2';
      default:
        return '#f1f5f9';
    }
  }};

  color: ${(p) => {
    switch (p.$status?.toLowerCase()) {
      case 'approved':
        return '#166534';
      case 'pending':
        return '#92400e';
      case 'rejected':
        return '#991b1b';
      default:
        return '#475569';
    }
  }};
`;

const DeviceStatusBadge = styled.span`
  display: inline-block;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: capitalize;
  white-space: nowrap;

  background: ${(p) => {
    switch (p.$status?.toLowerCase()) {
      case 'linked':
        return '#d1fae5';
      case 'unlinked':
        return '#fecaca';
      case 'declined':
        return '#fee2e2';
      default:
        return '#f1f5f9';
    }
  }};

  color: ${(p) => {
    switch (p.$status?.toLowerCase()) {
      case 'linked':
        return '#065f46';
      case 'unlinked':
        return '#7f1d1d';
      case 'declined':
        return '#991b1b';
      default:
        return '#475569';
    }
  }};
`;

const ActionBtn = styled.button`
  padding: 8px 14px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.2s ease;

  &:hover {
    background: #1d4ed8;
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(37, 99, 235, 0.3);
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

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  border-top: 1px solid #e5e7eb;
`;

const PageBtn = styled.button`
  padding: 8px 12px;
  border-radius: 6px;
  border: 2px solid #e5e7eb;
  background: ${(p) => (p.active ? '#2563eb' : '#ffffff')};
  color: ${(p) => (p.active ? '#ffffff' : '#0f172a')};
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #2563eb;
  }

  &:active {
    transform: scale(0.98);
  }
`;

/* =========================
   MODAL STYLES
========================= */

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
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
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;

  @keyframes slideUp {
    from {
      transform: translateY(30px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const ModalHeader = styled.div`
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #64748b;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;

  &:hover {
    color: #1e293b;
  }
`;

const ModalBody = styled.div`
  padding: 24px;
`;

const FormGroup = styled.div`
  margin-bottom: 18px;
`;

const FormLabel = styled.label`
  display: block;
  margin-bottom: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #334155;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const AddressSection = styled.div`
  background: #f8fafc;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 18px;
`;

const AddressTitle = styled.h3`
  margin: 0 0 14px 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #1e293b;
`;

const ModalFooter = styled.div`
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const CancelBtn = styled.button`
  padding: 10px 18px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background: white;
  color: #334155;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f1f5f9;
    border-color: #94a3b8;
  }
`;

const SubmitBtn = styled.button`
  padding: 10px 18px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
  color: white;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ActionCell = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const EditActionBtn = styled.button`
  background: none;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 4px 8px;
  transition: transform 0.2s ease, color 0.2s ease;
  color: #3b82f6;

  &:hover {
    transform: scale(1.2);
    color: #1d4ed8;
  }

  &:active {
    transform: scale(0.95);
  }
`;

const DeleteActionBtn = styled.button`
  background: none;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 4px 8px;
  transition: transform 0.2s ease, color 0.2s ease;
  color: #ef4444;

  &:hover {
    transform: scale(1.2);
    color: #dc2626;
  }

  &:active {
    transform: scale(0.95);
  }
`;

/* =========================
   COMPONENT
========================= */

export default function Customers() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    email_address: '',
    user_id: '',
address: {
  line: '',
  street: '',
  area: '',
  city: '',
  state: '',
  code: '',
  country: '',
}
  });

  const PAGE_SIZE = 8;

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/headadmin/customers');
      setCustomers(res.data.customers || []);
    } catch {
      alert('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     ADDRESS FORMATTER
  ========================= */

const formatAddress = (address = {}) =>
  [
    address.line,
    address.street,
    address.area,
    address.city,
    address.state,
    address.country &&
      `${address.country}${address.code ? ' - ' + address.code : ''}`,
  ]
    .filter(Boolean)
    .join(', ') || '—';

  /* =========================
     SEARCH + PAGINATION
  ========================= */

const filtered = useMemo(() => {
  return [...customers]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // ✅ newest first
    .filter((c) =>
      `
        ${c.user_name?.first_name || ''}
        ${c.user_name?.last_name || ''}
        ${c.email_address || ''}
        ${c.phone_number || ''}
      `
        .toLowerCase()
        .includes(search.toLowerCase())
    );
}, [customers, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const paginated = filtered.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  /* =========================
     STATS CALCULATION
  ========================= */

  const stats = useMemo(() => {
    const totalCustomers = filtered.length;
    const kycVerified = filtered.filter(
      (c) => c.kyc_details?.kyc_approval_status === 'approved'
    ).length;
    const devicesLinked = filtered.filter(
      (c) => c.user_device_status === 'linked'
    ).length;

    return { totalCustomers, kycVerified, devicesLinked };
  }, [filtered]);

  /* =========================
     GET INITIALS
  ========================= */

  const getInitials = (firstName = '', lastName = '') => {
    return (
      (firstName.charAt(0) || '') + (lastName.charAt(0) || '')
    ).toUpperCase() || 'U';
  };

  /* =========================
     CSV DOWNLOAD
  ========================= */

  const downloadCSV = () => {
    const rows = [
      [
        'First Name',
        'Last Name',
        'Email',
        'Phone',
        'Address',
        'KYC Status',
        'Device Status',
      ],
      ...filtered.map((c) => [
        c.user_name?.first_name || '',
        c.user_name?.last_name || '',
        c.email_address || '',
        c.phone_number || '',
        formatAddress(c.address),
        c.kyc_details?.kyc_approval_status || '',
        c.user_device_status || '',
      ]),
    ];

    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'customers.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  /* =========================
     FORM HANDLERS
  ========================= */

  const handleFormChange = (field, value) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);

const payload = {
  name: `${formData.first_name} ${formData.last_name}`,

  email: formData.email_address,
  phone: formData.phone_number,

  address: {
    line: formData.address.line,
    street: formData.address.street,
    area: formData.address.area,
    city: formData.address.city,
    state: formData.address.state,
    code: formData.address.code,
    country: formData.address.country,
  },
};

      if (editingUserId) {
        await axios.put(`/api/headadmin/customers/${editingUserId}`, payload);
        alert('User updated successfully');
      } else {
        await axios.post('/api/headadmin/customers', payload);
        alert('User created successfully');
      }

      resetForm();
      setShowModal(false);
      fetchCustomers();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save user');
    } finally {
      setFormLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      phone_number: '',
      email_address: '',
      user_id: '',
      address: {
  line: '',
  street: '',
  area: '',
  city: '',
  state: '',
  code: '',
  country: '',
},
    });
    setEditingUserId(null);
  };

  const handleEditUser = (user) => {
    setFormData({
      first_name: user.user_name?.first_name || '',
      last_name: user.user_name?.last_name || '',
      phone_number: user.phone_number || '',
      email_address: user.email_address || '',
      user_id: user.user_id || '',
address: {
  line: user.address?.line || '',
  street: user.address?.street || '',
  area: user.address?.area || '',
  city: user.address?.city || '',
  state: user.address?.state || '',
  code: user.address?.code || '',
  country: user.address?.country || '',
},
    });
    setEditingUserId(user._id);
    setShowModal(true);
  };

  const handleDeleteUser = async (userId, userName) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${userName}? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await axios.delete(`/api/headadmin/customers/${userId}`);
      alert('User deleted successfully');
      fetchCustomers();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    if (!formLoading) {
      resetForm();
      setShowModal(false);
    }
  };

  /* =========================
     RENDER
  ========================= */

  return (
    <HeadAdminNavbar>
      <Page>
        <HeaderSection>
          <HeaderContent>
            <Title>Customers</Title>
          </HeaderContent>
        </HeaderSection>

        {/* STATS */}
        <StatsGrid>
          <StatCard>
            <StatLabel>Total Customers</StatLabel>
            <StatValue>{stats.totalCustomers}</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>KYC Verified</StatLabel>
            <StatValue>{stats.kycVerified}</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Devices Linked</StatLabel>
            <StatValue>{stats.devicesLinked}</StatValue>
          </StatCard>
        </StatsGrid>

        {/* TABLE */}
        {loading ? (
          <LoadingSpinner>Loading customers…</LoadingSpinner>
        ) : filtered.length === 0 ? (
          <Empty>
            <EmptyIcon>👥</EmptyIcon>
            <EmptyText>
              {customers.length === 0
                ? 'No customers found. They will appear here.'
                : 'No customers match your search.'}
            </EmptyText>
          </Empty>
        ) : (
          <>
            <TableWrap>
<CardHeader style={{ 
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'center',
  gap: '12px',
  flexWrap: 'wrap'
}}>
  <CardTitle>
    {filtered.length} Customer{filtered.length !== 1 ? 's' : ''}
  </CardTitle>

  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
    <Search
      placeholder="🔍 Search..."
      value={search}
      onChange={(e) => {
        setSearch(e.target.value);
        setPage(1);
      }}
      style={{ width: '220px' }}
    />

      <CreateBtn onClick={openCreateModal}>
    + Create User
  </CreateBtn>
    <DownloadBtn onClick={downloadCSV}>
      📥 CSV
    </DownloadBtn>
  </div>
</CardHeader>

              <Table>
                <thead>
                  <tr>
                    <Th>#</Th>
                    <Th>Name</Th>
                    <Th>Email</Th>
                    <Th>Phone</Th>
                    <Th>Address</Th>
                    <Th>Actions</Th>
                  </tr>
                </thead>

                <tbody>
                  {paginated.map((c, index) => (
                    <Tr key={c._id}>
                      <Td>{(page - 1) * PAGE_SIZE + index + 1}</Td>
                      <Td>
                        <NameCell>
                          <Avatar>
                            {getInitials(c.user_name?.first_name, c.user_name?.last_name)}
                          </Avatar>
                          <span>
                            {`${c.user_name?.first_name || ''} ${c.user_name?.last_name || ''}`.trim() || '—'}
                          </span>
                        </NameCell>
                      </Td>
                      <Td>
                        <span style={{ color: '#2563eb', fontWeight: 500 }}>
                          {c.email_address || '—'}
                        </span>
                      </Td>
                      <Td>{c.phone_number || '—'}</Td>
                      <Td title={formatAddress(c.address)}>
                        {formatAddress(c.address)}
                      </Td>
                      <Td>
                        <ActionCell>
                          <EditActionBtn
                            onClick={() => handleEditUser(c)}
                            title="Edit user"
                          >
                            ✏️
                          </EditActionBtn>
                          <DeleteActionBtn
                            onClick={() =>
                              handleDeleteUser(
                                c._id,
                                `${c.user_name?.first_name || ''} ${c.user_name?.last_name || ''}`.trim()
                              )
                            }
                            title="Delete user"
                          >
                            🗑️
                          </DeleteActionBtn>
                        </ActionCell>
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </TableWrap>

            {totalPages > 1 && (
              <Pagination>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <PageBtn
                    key={i}
                    active={page === i + 1}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </PageBtn>
                ))}
              </Pagination>
            )}
          </>
        )}

        {/* USER MODAL (CREATE/EDIT) */}
        {showModal && (
          <ModalOverlay onClick={closeModal}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <ModalTitle>
                  {editingUserId ? 'Edit User' : 'Create New User'}
                </ModalTitle>
                <CloseBtn
                  onClick={closeModal}
                  disabled={formLoading}
                >
                  ×
                </CloseBtn>
              </ModalHeader>

              <ModalBody>
                <form onSubmit={handleSaveUser}>
                  {/* NAME ROW */}
                  <FormRow>
                    <FormGroup>
                      <FormLabel>First Name *</FormLabel>
                      <FormInput
                        type="text"
                        required
                        value={formData.first_name}
                        onChange={(e) =>
                          handleFormChange('first_name', e.target.value)
                        }
                        placeholder="John"
                      />
                    </FormGroup>
                    <FormGroup>
                      <FormLabel>Last Name *</FormLabel>
                      <FormInput
                        type="text"
                        required
                        value={formData.last_name}
                        onChange={(e) =>
                          handleFormChange('last_name', e.target.value)
                        }
                        placeholder="Doe"
                      />
                    </FormGroup>
                  </FormRow>

                  {/* CONTACT INFO */}
                  <FormGroup>
                    <FormLabel>Email Address *</FormLabel>
                    <FormInput
                      type="email"
                      required
                      value={formData.email_address}
                      onChange={(e) =>
                        handleFormChange('email_address', e.target.value)
                      }
                      placeholder="john@example.com"
                    />
                  </FormGroup>

                  <FormGroup>
                    <FormLabel>Phone Number *</FormLabel>
                    <FormInput
                      type="tel"
                      required
                      value={formData.phone_number}
                      onChange={(e) =>
                        handleFormChange('phone_number', e.target.value)
                      }
                      placeholder="+91 9876543210"
                    />
                  </FormGroup>

                  {/* ADDRESS SECTION */}
                  <AddressSection>
                    <AddressTitle>Address</AddressTitle>

<FormLabel>Line</FormLabel>
<FormInput
  type="text"
  value={formData.address.line}
  onChange={(e) =>
    handleFormChange('address.line', e.target.value)
  }
  placeholder="House / Building"
/>

<FormLabel>Street</FormLabel>
<FormInput
  type="text"
  value={formData.address.street}
  onChange={(e) =>
    handleFormChange('address.street', e.target.value)
  }
  placeholder="Street Name"
/>

                    <FormGroup>
                      <FormLabel>Area</FormLabel>
                      <FormInput
                        type="text"
                        value={formData.address.area}
                        onChange={(e) =>
                          handleFormChange('address.area', e.target.value)
                        }
                        placeholder="Market Street Area"
                      />
                    </FormGroup>

                    <FormRow>
                      <FormGroup>
                        <FormLabel>City</FormLabel>
                        <FormInput
                          type="text"
                          value={formData.address.city}
                          onChange={(e) =>
                            handleFormChange('address.city', e.target.value)
                          }
                          placeholder="New York"
                        />
                      </FormGroup>
                      <FormGroup>
                        <FormLabel>State</FormLabel>
                        <FormInput
                          type="text"
                          value={formData.address.state}
                          onChange={(e) =>
                            handleFormChange('address.state', e.target.value)
                          }
                          placeholder="NY"
                        />
                      </FormGroup>
                    </FormRow>

                    <FormRow>
                      <FormGroup>
                        <FormLabel>Country</FormLabel>
                        <FormInput
                          type="text"
                          value={formData.address.country}
                          onChange={(e) =>
                            handleFormChange('address.country', e.target.value)
                          }
                          placeholder="United States"
                        />
                      </FormGroup>
<FormLabel>Pincode</FormLabel>
<FormInput
  type="text"
  value={formData.address.code}
  onChange={(e) =>
    handleFormChange('address.code', e.target.value)
  }
  placeholder="500029"
/>
                    </FormRow>
                  </AddressSection>
                </form>
              </ModalBody>

              <ModalFooter>
                <CancelBtn
                  onClick={closeModal}
                  disabled={formLoading}
                >
                  Cancel
                </CancelBtn>
                <SubmitBtn
                  onClick={handleSaveUser}
                  disabled={formLoading}
                >
                  {formLoading
                    ? editingUserId
                      ? 'Updating...'
                      : 'Creating...'
                    : editingUserId
                    ? 'Update User'
                    : 'Create User'}
                </SubmitBtn>
              </ModalFooter>
            </ModalContent>
          </ModalOverlay>
        )}
      </Page>
    </HeadAdminNavbar>
  );
}
