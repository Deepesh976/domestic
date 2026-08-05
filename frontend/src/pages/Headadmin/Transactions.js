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
  MdTrendingUp,
  MdAdd
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
  gap: 0.5rem;
  margin-bottom: 0.5rem;

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


const DownloadBtn = styled.button`
  padding: 10px 16px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3);
  }
`;

const CreateTxnBtn = styled.button`
  padding: 10px 16px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(37, 99, 235, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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
  font-weight: 500;
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
  max-width: 700px;
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

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ModalBody = styled.div`
  padding: 24px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 18px;

  &.full-width {
    grid-column: 1 / -1;
  }
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

  &:disabled {
    background: #f8fafc;
    color: #64748b;
    cursor: not-allowed;
  }
`;

const FormSelect = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  box-sizing: border-box;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  &:disabled {
    background: #f8fafc;
    color: #64748b;
    cursor: not-allowed;
  }
`;

const ReadOnlyField = styled.div`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.9rem;
  background: #f8fafc;
  color: #64748b;
  font-family: 'JetBrains Mono', monospace;
  word-break: break-all;
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

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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
  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const [formData, setFormData] = useState({
    user_id: '',
    org_id: '',
    order_id: '',
    txn_id: '',
    payment_purpose: '',
    payment_mode: '',
    payment_status: '',
    amount: '',
  });

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const deviceId = params.get('device_id');

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/headadmin/customers');
      setUsers(res.data.customers || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setFormError('Failed to load customer list');
    }
  };

  const generateULID = () => {
    return `${Date.now()}${Math.random().toString(36).substring(2, 8)}`.toUpperCase();
  };

  const openCreateModal = () => {
    setFormData({
      user_id: '',
      org_id: '',
      order_id: generateULID(),
      txn_id: generateULID(),
      payment_purpose: '',
      payment_mode: '',
      payment_status: '',
      amount: '',
    });
    setFormError('');
    fetchUsers();
    setShowModal(true);
  };

  const closeModal = () => {
    if (!formLoading) {
      setShowModal(false);
    }
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

const handleSubmitTransaction = async (e) => {
  e.preventDefault();

  if (
    !formData.user_id ||
    !formData.payment_purpose ||
    !formData.payment_mode ||
    !formData.payment_status ||
    !formData.amount
  ) {
    setFormError('Please fill in all required fields');
    return;
  }

  if (parseFloat(formData.amount) <= 0) {
    setFormError('Amount must be greater than 0');
    return;
  }

  try {
    setFormLoading(true);
    setFormError('');

    // ✅ FIX: DEFINE FIRST
    const selectedUser = users.find(
      (u) => u._id === formData.user_id
    );

    if (!selectedUser) {
      setFormError('Invalid user selected');
      return;
    }

    const payload = {
      user_id: selectedUser.user_id, // ✅ UUID
      org_id: formData.org_id,
      order_id: formData.order_id,
      txn_id: formData.txn_id,
      payment_purpose: formData.payment_purpose,
      payment_mode: formData.payment_mode,
      payment_status: formData.payment_status,
      amount: parseFloat(formData.amount),
    };

    const res = await axios.post('/api/headadmin/transactions', payload);

    const newTxn = {
      ...res.data.transaction,
      user_name: `${selectedUser.user_name.first_name} ${selectedUser.user_name.last_name}`,
      plan_name: '-',
    };

    setData((prev) => [newTxn, ...prev]);

    alert('Transaction created successfully');

    setShowModal(false);
    setFormData({
      user_id: '',
      org_id: '',
      order_id: '',
      txn_id: '',
      payment_purpose: '',
      payment_mode: '',
      payment_status: '',
      amount: '',
    });

  } catch (err) {
    console.error('Failed to create transaction:', err);
    setFormError(
      err.response?.data?.message || 'Failed to create transaction'
    );
  } finally {
    setFormLoading(false);
  }
};

  useEffect(() => {
    setLoading(true);
    axios
      .get('/api/headadmin/transactions', {
        params: deviceId ? { device_id: deviceId } : {},
      })
      .then((res) => {
        setData(res.data.transactions || []);
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
  const safeData = Array.isArray(data) ? data : [];

  return safeData.filter((t) => {
    const q = debouncedSearch.toLowerCase();

    return (
      t.user_name?.toLowerCase().includes(q) ||
      t.txn_id?.toLowerCase().includes(q) ||
      t.plan_name?.toLowerCase().includes(q)
    );
  });
}, [data, debouncedSearch]);

  const downloadCSV = () => {
  const rows = [
    ['User', 'Txn ID', 'Plan', 'Amount', 'Mode', 'Status', 'Date'],
    ...filtered.map(t => [
      t.user_name,
      t.txn_id,
      t.plan_name,
      t.amount,
      t.payment_mode,
      t.payment_status,
      formatDate(t.createdAt || t.created_at)
    ])
  ];

  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'transactions.csv';
  a.click();
};

  const stats = useMemo(() => {
const successful = (Array.isArray(data) ? data : []).filter(
  t => t.payment_status?.toLowerCase() === 'success'
)

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
    <Title>
      All Transactions
      {deviceId && <span> — {deviceId}</span>}
    </Title>
  </TitleGroup>

  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
    <CreateTxnBtn onClick={openCreateModal}>
      <MdAdd size={20} />
      Create Transaction
    </CreateTxnBtn>
    <DownloadBtn onClick={downloadCSV}>
      📥 Export CSV
    </DownloadBtn>
  </div>
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
  <TxnId
    style={{
      background: '#eff6ff',
      color: '#2563eb',
      border: 'none',
      fontWeight: 700,
    }}
  >
    {t.user_name && t.user_name.trim() !== '' ? t.user_name : '-'}
  </TxnId>
</Td>
                      <Td>
                        <TxnId>{t.txn_id}</TxnId>
                      </Td>
                      <Td style={{ fontWeight: 600 }}>
  {t.plan_name || '—'}
</Td>
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
                      <Td style={{ whiteSpace: 'nowrap', fontWeight: 500 }}>
  {formatDate(t.createdAt || t.created_at)}
</Td>
                    </tr>
                  ))}
                </tbody>
              </StyledTable>
            </TableScroll>
          </TableContainer>
        )}

        {/* CREATE TRANSACTION MODAL */}
        {showModal && (
          <ModalOverlay onClick={closeModal}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <ModalTitle>Create New Transaction</ModalTitle>
                <CloseBtn
                  onClick={closeModal}
                  disabled={formLoading}
                >
                  ×
                </CloseBtn>
              </ModalHeader>

              <ModalBody>
                <form onSubmit={handleSubmitTransaction}>
                  {formError && (
                    <FormGroup className="full-width">
                      <div style={{
                        padding: '12px',
                        background: '#fee2e2',
                        border: '1px solid #fecaca',
                        borderRadius: '8px',
                        color: '#991b1b',
                        fontSize: '0.9rem',
                        marginBottom: '12px'
                      }}>
                        {formError}
                      </div>
                    </FormGroup>
                  )}

                  <FormGrid>
                    <FormGroup>
                      <FormLabel>Select User *</FormLabel>
                      <FormSelect
                        required
                        value={formData.user_id}
                        onChange={(e) => handleFormChange('user_id', e.target.value)}
                      >
                        <option value="">-- Choose a customer --</option>
                        {users.map((user) => (
                          <option key={user._id} value={user._id}>
                            {user.user_name?.first_name} {user.user_name?.last_name}
                          </option>
                        ))}
                      </FormSelect>
                    </FormGroup>

                    {/* <FormGroup>
                      <FormLabel>Organization ID</FormLabel>
                      <ReadOnlyField>
                        Auto-filled
                      </ReadOnlyField>
                    </FormGroup> */}

                    <FormGroup>
                      <FormLabel>Order ID</FormLabel>
                      <ReadOnlyField>
                        {formData.order_id}
                      </ReadOnlyField>
                    </FormGroup>

                    <FormGroup>
                      <FormLabel>Transaction ID</FormLabel>
                      <ReadOnlyField>
                        {formData.txn_id}
                      </ReadOnlyField>
                    </FormGroup>

                    <FormGroup>
                      <FormLabel>Payment Purpose *</FormLabel>
                      <FormSelect
                        required
                        value={formData.payment_purpose}
                        onChange={(e) => handleFormChange('payment_purpose', e.target.value)}
                      >
                        <option value="">-- Select purpose --</option>
                        <option value="Order">Order</option>
                        <option value="Recharge">Recharge</option>
                      </FormSelect>
                    </FormGroup>

                    <FormGroup>
                      <FormLabel>Payment Mode *</FormLabel>
                      <FormSelect
                        required
                        value={formData.payment_mode}
                        onChange={(e) => handleFormChange('payment_mode', e.target.value)}
                      >
                        <option value="">-- Select mode --</option>
                        <option value="UPI">UPI</option>
                        <option value="Offline">Offline</option>
                      </FormSelect>
                    </FormGroup>

                    <FormGroup>
                      <FormLabel>Payment Status *</FormLabel>
                      <FormSelect
                        required
                        value={formData.payment_status}
                        onChange={(e) => handleFormChange('payment_status', e.target.value)}
                      >
                        <option value="">-- Select status --</option>
                        <option value="Success">Success</option>
                        <option value="Pending">Pending</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Expired">Expired</option>
                      </FormSelect>
                    </FormGroup>

                    <FormGroup>
                      <FormLabel>Amount (₹) *</FormLabel>
                      <FormInput
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={formData.amount}
                        onChange={(e) => handleFormChange('amount', e.target.value)}
                        placeholder="Enter amount"
                        disabled={formLoading}
                      />
                    </FormGroup>
                  </FormGrid>
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
                  onClick={handleSubmitTransaction}
                  disabled={formLoading}
                >
                  {formLoading ? 'Creating...' : 'Create Transaction'}
                </SubmitBtn>
              </ModalFooter>
            </ModalContent>
          </ModalOverlay>
        )}
      </PageContainer>
    </HeadAdminNavbar>
  );
}
