import React, { useEffect, useMemo, useState } from 'react';
  import styled from 'styled-components';
  import HeadAdminNavbar from '../../components/Navbar/HeadAdminNavbar';
  import {
    getInstallationOrders,
    getTechnicians,
    assignInstallationTechnician,
  } from '../../services/headAdminService';
  import normalAxios from 'axios';
  import axios from '../../utils/axiosConfig';
  import { useNavigate } from 'react-router-dom';
  import { ulid } from 'ulid';

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
    border-bottom: 1px solid #f1f5f9;
    vertical-align: middle;
    color: #334155;
    text-align: center;
  `;

  const TdLeft = styled(Td)`
    text-align: left;
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
    CUSTOMER CELL
  ========================= */

  const CustomerWrapper = styled.div`
    display: flex;
    flex-direction: column;
  `;

  const CustomerName = styled.div`
    font-weight: 700;
    font-size: 14px;
    color: #0f172a;
  `;

  const OrderId = styled.div`
    font-size: 12px;
    color: #94a3b8;
  `;

  const PlanName = styled.div`
    font-weight: 600;
    font-size: 14px;
    color: #0f172a;
  `;

  const AddressText = styled.div`
    font-size: 13px;
    color: #64748b;
    line-height: 1.6;
  `;

  const Muted = styled.div`
    font-size: 12px;
    color: #94a3b8;
  `;

  /* =========================
    STATUS BADGES
  ========================= */

  const StageIndicator = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    background: ${(p) => (p.completed ? '#d1fae5' : '#fef3c7')};
    color: ${(p) => (p.completed ? '#047857' : '#b45309')};
  `;

  const StageDot = styled.span`
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: currentColor;
  `;

  const StatusBadge = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 700;

    background: ${(p) => {
      switch (p.type) {
        case 'CLOSED':
          return '#d1fae5';
        // case 'EXPIRED':
        //   return '#fee2e2';
        case 'CANCELLED':
          return '#f3f4f6';
        case 'PENDING':
          return '#fef3c7';
        default:
          return '#e0f2fe'; // OPEN
      }
    }};

    color: ${(p) => {
      switch (p.type) {
        case 'CLOSED':
          return '#047857';
        // case 'EXPIRED':
        //   return '#b91c1c';
        case 'CANCELLED':
          return '#374151';
        case 'PENDING':
          return '#b45309';
        default:
          return '#0369a1'; // OPEN
      }
    }};
  `;

  const CreateButton = styled.button`
  padding: 10px 18px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;

  &:hover {
    background: #1d4ed8;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
  }
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
    width: 100%;
    max-width: 160px;

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

  const TechnicianCell = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    width: 100%;
    height: 100%;
  `;

  const TechnicianInfo = styled.div`
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 4px;
  `;

  const TechnicianName = styled.strong`
    font-weight: 700;
    font-size: 14px;
    color: #0f172a;
  `;

  const TechnicianStatus = styled(Muted)`
    font-size: 12px;
    color: ${(p) => p.statusColor || '#94a3b8'};
    font-weight: ${(p) => (p.highlight ? 600 : 400)};
  `;

  const ActionGroup = styled.div`
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  `;

  const ActionButton = styled.button`
    padding: 8px 16px;
    background: ${(p) => (p.danger ? '#dc2626' : '#2563eb')};
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    white-space: nowrap;

    &:hover:not(:disabled) {
      background: ${(p) => (p.danger ? '#b91c1c' : '#1d4ed8')};
      box-shadow: ${(p) =>
        p.danger
          ? '0 4px 12px rgba(220, 38, 38, 0.4)'
          : '0 4px 12px rgba(37, 99, 235, 0.4)'};
    }

    &:disabled {
      background: #cbd5e1;
      cursor: not-allowed;
      opacity: 0.6;
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
    COMPONENT
  ========================= */

  export default function HeadAdminInstallationOrder() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [assignments, setAssignments] = useState({});
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [loading, setLoading] = useState(false);
    const [kycModal, setKycModal] = useState(null);
    const [createOrderModal, setCreateOrderModal] = useState(false);
    const [users, setUsers] = useState([]);
const [transactions, setTransactions] = useState([]);
const [orderType, setOrderType] = useState("LIFETIME");
const [formData, setFormData] = useState({
  user_id: '',
  org_id: '',
  order_id: '',
  txn_id: '',
  amount: '',
  order_type: 'LIFETIME',
});
    useEffect(() => {
      loadData();
      loadUsers();
    }, []);

    const loadData = async () => {
      setLoading(true);
      try {
        const [orderRes, techRes] = await Promise.all([
          getInstallationOrders(),
          getTechnicians(),
        ]);

        setOrders(orderRes.data || []);

  const availableTechs = (techRes.data || []).filter(
    (t) => t.is_active
  );

        setTechnicians(availableTechs);
      } catch {
        alert('Failed to load installation orders');
      } finally {
        setLoading(false);
      }
    };

    const loadUsers = async () => {
      try {
        const response = await axios.get('/api/headadmin/installations/users');
        setUsers(response.data || []);
      } catch {
        console.log('Failed to load users');
      }
    };

    const loadTransactions = async (userId) => {
  try {
    const response = await axios.get(
      `/api/headadmin/transactions/user/${userId}`
    );

    const txns = response.data.transactions || [];

setTransactions(txns);

if (txns.length > 0) {
  setFormData(prev => ({
    ...prev,
    txn_id: txns[0].txn_id, // latest ULID
  }));
}
  } catch (err) {
    console.log('Failed to load transactions', err);
    setTransactions([]);
  }
};

    const generateOrderId = () => {
  return ulid(); // ✅ ULID
};

// const generateTxnId = () => {
//   return Math.random().toString(36).substring(2, 22);
// };

const handleFormChange = (e) => {
  const { name, value } = e.target;

  if (name === "order_type") {
    setOrderType(value);

    setFormData((prev) => ({
      ...prev,
      order_type: value,
      txn_id: "",
      amount: "",
    }));

    return;
  }

  if (name === "user_id") {
    const parsed = JSON.parse(value);

    if (orderType === "LIFETIME") {
      setFormData((prev) => ({
        ...prev,
        user_id: parsed.user_id,
        org_id: parsed.org_id,
        txn_id: ulid(),      // Generate new transaction ID
        amount: "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        user_id: parsed.user_id,
        org_id: parsed.org_id,
        txn_id: "",
        amount: "",
      }));

      loadTransactions(parsed.user_id);
    }

    return;
  }

  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));
};


const handleCreateOrder = async (e) => {
  e.preventDefault();

  const requiredFields = ['user_id'];
  if (requiredFields.some(field => !formData[field])) {
    alert('Please fill all required fields');
    return;
  }

  try {
    const token = localStorage.getItem('token');
    // 1️⃣ External API FIRST
await normalAxios.post(
  'http://api.smartroplus.in/api/v1/orders/lifetime',
{
  user_id: formData.user_id,
  org_id: 'org_001', // ✅ Hardcoded for now
  order_id: formData.order_id,
  txn_id: formData.txn_id,
  amount: Number(formData.amount),
  order_type: formData.order_type,

  payment_purpose: "ORDER",
  payment_mode: "OFFLINE",
  payment_status: "SUCCESS",
},
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

console.log("FINAL PAYLOAD:", {
  user_id: formData.user_id,
  org_id: formData.org_id,
  order_id: formData.order_id,
  txn_id: formData.txn_id,
  amount: formData.amount,
  order_type: formData.order_type,
});

    // ✅ SUCCESS FLOW
    alert('Installation order created successfully ✓');

    setCreateOrderModal(false);

setTransactions([]);

setFormData({
  user_id: '',
  org_id: '',
  order_id: generateOrderId(),
  txn_id: '',
  amount: '',
  order_type: 'LIFETIME',
});

    loadData();

} catch (err) {
  console.log("FULL ERROR:", err);
  console.log("RESPONSE:", err.response);

  alert(err.response?.data?.message || 'Failed to create order');
}
};

const openCreateModal = () => {
  setTransactions([]);

setFormData({
  user_id: '',
  org_id: '',
  order_id: generateOrderId(),
  txn_id: '',
  amount: '',
  order_type: 'LIFETIME',
});

  setCreateOrderModal(true);
};

    const closeCreateModal = () => {
      setCreateOrderModal(false);
    };

    const filteredOrders = useMemo(() => {
      return orders.filter((o) => {
        const searchLower = search.toLowerCase();
        const matchesSearch =
          `${o.customer_name} ${o.order_id} ${o.plan_name}`
            .toLowerCase()
            .includes(searchLower);

  const matchesStatus =
    statusFilter === 'all' ||
    o.status === statusFilter;

        return matchesSearch && matchesStatus;
      });
    }, [orders, search, statusFilter]);

    const handleAssign = async (order) => {
      const technician_id = assignments[order._id];
      if (!technician_id) return alert('Select a technician');

      if (!window.confirm(`Assign technician to ${order.customer_name}?`))
        return;

      await assignInstallationTechnician(order._id, technician_id);
      alert('Technician assigned successfully ✅');
      loadData();
    };

    const handleComplete = async (order) => {
      if (!window.confirm('Mark installation as completed?')) return;

      await axios.put(
        `/api/headadmin/installations/${order._id}/complete`
      );

      alert('Installation completed ✅');
      loadData();
    };

    const handleRemoveAssignment = async (order) => {
    if (
      !window.confirm(
        `Remove assignment for ${order.customer_name}?`
      )
    )
      return;

    try {
      await axios.patch(
        `/api/headadmin/installations/${order._id}/remove-assignment`
      );

      alert('Assignment removed successfully ✅');
      loadData();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          'Failed to remove assignment'
      );
    }
  };

    const openKycModal = (order) => {
    setKycModal(order);
  };

  const closeKycModal = () => {
    setKycModal(null);
  };

  const updateKycStatus = async (status) => {
    if (!kycModal) return;

    await axios.patch(
      `/api/headadmin/installations/${kycModal._id}/kyc`,
      { kyc_approval_status: status }
    );

    alert(`KYC ${status} successfully`);
    closeKycModal();
    loadData();
  };

    // Calculate stats
  const stats = {
    total: orders.length,
    open: orders.filter((o) => o.status === 'OPEN').length,
    pending: orders.filter((o) => o.status === 'PENDING').length,
    closed: orders.filter((o) => o.status === 'CLOSED').length,
    // expired: orders.filter((o) => o.status === 'EXPIRED').length,
    cancelled: orders.filter((o) => o.status === 'CANCELLED').length,
  };

    return (
      <HeadAdminNavbar>
        <Page>
          <Container>
            <HeaderSection>
              <PageTitle>Installation Orders</PageTitle>
            </HeaderSection>

            {/* Stats Cards */}
  <StatsGrid>
    <StatCard>
      <StatIcon bgColor="#dbeafe">📦</StatIcon>
      <StatLabel>Total Orders</StatLabel>
      <StatValue color="#2563eb">{stats.total}</StatValue>
    </StatCard>

    <StatCard>
      <StatIcon bgColor="#e0f2fe">🟦</StatIcon>
      <StatLabel>Open</StatLabel>
      <StatValue color="#0369a1">{stats.open}</StatValue>
    </StatCard>

    <StatCard>
      <StatIcon bgColor="#fef3c7">⏳</StatIcon>
      <StatLabel>Pending</StatLabel>
      <StatValue color="#b45309">{stats.pending}</StatValue>
    </StatCard>

    <StatCard>
      <StatIcon bgColor="#d1fae5">✓</StatIcon>
      <StatLabel>Closed</StatLabel>
      <StatValue color="#047857">{stats.closed}</StatValue>
    </StatCard>

    <StatCard>
      <StatIcon bgColor="#f3f4f6">✖</StatIcon>
      <StatLabel>Cancelled</StatLabel>
      <StatValue color="#374151">{stats.cancelled}</StatValue>
    </StatCard>
  </StatsGrid>

            {/* Search & Filters */}
            <ControlsSection>

              <SearchInput
  type="text"
  placeholder="Search by customer name, order ID, or plan..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
/>

              <CreateButton onClick={openCreateModal}>
    + Create Order
  </CreateButton>

<FilterSelect
  value={statusFilter}
  onChange={(e) => setStatusFilter(e.target.value)}
>
  <option value="all">All Status</option>
  <option value="OPEN">OPEN</option>
  <option value="PENDING">PENDING</option>
  <option value="CLOSED">CLOSED</option>
  <option value="EXPIRED">EXPIRED</option>
  <option value="CANCELLED">CANCELLED</option>
              </FilterSelect>
            </ControlsSection>

  {/* Table */}
  <TableWrapper>
    {!loading && filteredOrders.length === 0 && orders.length > 0 ? (
      <EmptyState>
        <EmptyIcon>🔍</EmptyIcon>
        <EmptyText>No orders match your filters</EmptyText>
      </EmptyState>
    ) : !loading && orders.length === 0 ? (
      <EmptyState>
        <EmptyIcon>📋</EmptyIcon>
        <EmptyText>No installation orders available</EmptyText>
      </EmptyState>
    ) : loading ? (
      <EmptyState>
        <EmptyIcon>⏳</EmptyIcon>
        <EmptyText>Loading orders...</EmptyText>
      </EmptyState>
    ) : (
      <Table>
        <thead>
          <tr>
            <Th>Customer & Order</Th>
            <Th>Plan</Th>
            <Th>KYC</Th>
            <Th>Stages</Th>
            <Th>Address</Th>
            <Th>Status</Th>
            <Th>Technician</Th>
            <Th>Actions</Th>
          </tr>
        </thead>

        <tbody>
          {filteredOrders.map((o) => {
            const status = o.status || 'OPEN';
            const isCompleted = status === 'CLOSED';
            const isAccepted =
              o.technician_approval_status === 'ACCEPTED';
            const isPending =
              o.technician_approval_status === 'PENDING';
            const isRejected =
              o.technician_approval_status === 'REJECTED';

            const kycStatus =
              o.kyc_approval_status || 'PENDING';

            return (
              <TableRow key={o._id}>
                {/* Customer */}
                <TdLeft>
                  <CustomerWrapper>
                    <CustomerName>
                      {o.customer_name}
                    </CustomerName>
                    <OrderId>
                      Order: {o.order_id}
                    </OrderId>
                  </CustomerWrapper>
                </TdLeft>

                {/* Plan */}
                <Td>
                  <PlanName>{o.plan_name}</PlanName>
                </Td>

                {/* KYC */}
  <Td style={{ textAlign: 'center' }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
      <button
        onClick={() => openKycModal(o)}
        style={{
          padding: '8px 16px',
          borderRadius: '20px',
          fontWeight: 600,
          border: 'none',
          cursor: 'pointer',
          fontSize: '13px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          transition: 'all 0.3s ease',
          background:
            kycStatus === 'APPROVED'
              ? '#d1fae5'
              : kycStatus === 'REJECTED'
              ? '#fee2e2'
              : '#fef3c7',
          color:
            kycStatus === 'APPROVED'
              ? '#047857'
              : kycStatus === 'REJECTED'
              ? '#b91c1c'
              : '#b45309',
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.05)';
          e.target.style.boxShadow =
            kycStatus === 'APPROVED'
              ? '0 4px 12px rgba(4, 120, 87, 0.3)'
              : kycStatus === 'REJECTED'
              ? '0 4px 12px rgba(185, 28, 28, 0.3)'
              : '0 4px 12px rgba(180, 83, 9, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)';
          e.target.style.boxShadow = 'none';
        }}
      >
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: 'currentColor',
            display: 'inline-block',
          }}
        />
        {kycStatus}
      </button>
      <span
        onClick={() => openKycModal(o)}
        style={{
          fontSize: '11px',
          color: '#2563eb',
          cursor: 'pointer',
          fontWeight: '500',
          textDecoration: 'underline',
        }}
      >
        click me
      </span>
    </div>
  </Td>

                {/* Stages */}
                <Td>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <StageIndicator
                      completed={o.stages?.payment_received}
                    >
                      <StageDot />
                      {o.stages?.payment_received
                        ? 'Payment'
                        : 'Awaiting Payment'}
                    </StageIndicator>

                    <StageIndicator
                      completed={o.stages?.kyc_verified}
                    >
                      <StageDot />
                      {o.stages?.kyc_verified
                        ? 'KYC Verified'
                        : 'KYC Pending'}
                    </StageIndicator>
                  </div>
                </Td>

                {/* Address */}
                <TdLeft>
                  <AddressText>
                    {o.delivery_address?.house_flat_no}
                    <br />
                    {o.delivery_address?.area}
                    <br />
                    {o.delivery_address?.district},{' '}
                    {o.delivery_address?.state}{' '}
                    {o.delivery_address?.postal_code}
                  </AddressText>
                </TdLeft>

                {/* Status */}
  <Td>
    <StatusBadge
      type={status}
    >
      <StatusDot
        pulse={status === 'OPEN' || status === 'PENDING'}
      />
      {status}
    </StatusBadge>
  </Td>

  <Td>
    <TechnicianCell>

      {/* Always show name if assigned */}
      {o.assigned_to && (
        <TechnicianInfo>
          <TechnicianName>
            {o.technician_name || 'Technician'}
          </TechnicianName>

          {isPending && (
            <TechnicianStatus>
              Awaiting Approval...
            </TechnicianStatus>
          )}

          {isAccepted && (
            <TechnicianStatus
              statusColor="#059669"
              highlight
            >
              Accepted ✓
            </TechnicianStatus>
          )}

          {isRejected && (
            <TechnicianStatus
              statusColor="#dc2626"
              highlight
            >
              Rejected ❌
            </TechnicianStatus>
          )}
        </TechnicianInfo>
      )}

      {/* Show dropdown if rejected OR not assigned */}
      {(isRejected || !o.assigned_to) && (
        <Select
          onChange={(e) =>
            setAssignments({
              ...assignments,
              [o._id]: e.target.value,
            })
          }
        >
          <option value="">Select Technician</option>
          {technicians.map((t) => (
            <option key={t._id} value={t._id}>
              {t.user_name.first_name} {t.user_name.last_name}
            </option>
          ))}
        </Select>
      )}

    </TechnicianCell>
  </Td>

                {/* Actions */}
                <Td>
                  <ActionGroup>
                    {/* Assign */}
                    {!o.assigned_to && status === 'OPEN' && (
                      <ActionButton
                        disabled={
                          kycStatus !==
                            'APPROVED' ||
                          !o.stages
                            ?.payment_received
                        }
                        onClick={() =>
                          handleAssign(o)
                        }
                      >
                        Assign
                      </ActionButton>
                    )}

                    {/* Remove (only when pending) */}
                    {isPending && (
                      <ActionButton
                        danger
                        onClick={() =>
                          handleRemoveAssignment(o)
                        }
                      >
                        Remove
                      </ActionButton>
                    )}

                    {/* Reassign if rejected */}
                    {isRejected && (
                      <ActionButton
                        onClick={() =>
                          handleAssign(o)
                        }
                      >
                        Reassign
                      </ActionButton>
                    )}

                    {/* Complete only if accepted */}
  {isAccepted && status === 'OPEN' && (
                        <ActionButton
                          danger
                          onClick={() =>
                            handleComplete(o)
                          }
                        >
                          Complete
                        </ActionButton>
                      )}

                    {isCompleted && (
                      <Muted>Done ✓</Muted>
                    )}
                  </ActionGroup>
                </Td>
              </TableRow>
            );
          })}
        </tbody>
      </Table>
    )}
  </TableWrapper>


  {/* 🔥 KYC MODAL */}
  {kycModal && (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2000,
        padding: '20px',
        backdropFilter: 'blur(4px)',
      }}
      onClick={closeKycModal}
    >
      <div
        style={{
          background: 'white',
          padding: '40px 32px',
          borderRadius: '16px',
          width: '800px',
          maxWidth: '95%',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          animation: 'slideIn 0.3s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title - Top Center */}
        <h2 style={{
          margin: '0 0 32px 0',
          fontSize: '24px',
          fontWeight: '700',
          color: '#0f172a',
          textAlign: 'center',
          paddingBottom: '16px',
          borderBottom: '2px solid #e2e8f0'
        }}>
          KYC Verification
        </h2>

        {/* Main Content: Left side (info) and Right side (image) */}
        <div className="kyc-modal-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '32px',
          marginBottom: '32px'
        }}>

          {/* LEFT SIDE: Customer Info */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

            {/* Customer Name */}
            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Customer Name
              </p>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#0f172a',
                margin: 0,
                wordBreak: 'break-word'
              }}>
                {kycModal.customer_name}
              </h3>
            </div>

            {/* Order ID */}
            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Order ID
              </p>
              <p style={{ fontSize: '14px', color: '#0f172a', margin: 0, fontWeight: '500' }}>
                {kycModal.order_id}
              </p>
            </div>

            {/* Current Status */}
            <div>
              <p style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Current Status
              </p>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: '600',
                background:
                  kycModal.kyc_approval_status === 'APPROVED'
                    ? '#d1fae5'
                    : kycModal.kyc_approval_status === 'REJECTED'
                    ? '#fee2e2'
                    : '#fef3c7',
                color:
                  kycModal.kyc_approval_status === 'APPROVED'
                    ? '#047857'
                    : kycModal.kyc_approval_status === 'REJECTED'
                    ? '#b91c1c'
                    : '#b45309',
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor' }} />
                {kycModal.kyc_approval_status || 'PENDING'}
              </span>
            </div>
          </div>

          {/* RIGHT SIDE: KYC Document Image */}
          <div>
            <p style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {kycModal.kyc_details?.type || 'KYC Document'}
            </p>
            <div style={{
              borderRadius: '12px',
              overflow: 'hidden',
              border: '2px solid #e2e8f0',
              minHeight: '250px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#f8fafc',
            }}>
              {kycModal?.kyc_details?.document ? (
                <img
                  src={`data:image/jpeg;base64,${kycModal.kyc_details.document
                    .replace(/_/g, '/')
                    .replace(/-/g, '+')}`}
                  alt="KYC Document"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />
              ) : (
                <span style={{ color: '#94a3b8', fontSize: '14px' }}>No document available</span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons - Bottom (3 buttons grid) */}
        <div className="kyc-modal-buttons" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '12px',
        }}>
          <button
            onClick={() => updateKycStatus('APPROVED')}
            style={{
              padding: '12px 20px',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#059669';
              e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#10b981';
              e.target.style.boxShadow = 'none';
            }}
          >
            ✓ Approve
          </button>

          <button
            onClick={() => updateKycStatus('REJECTED')}
            style={{
              padding: '12px 20px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#dc2626';
              e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#ef4444';
              e.target.style.boxShadow = 'none';
            }}
          >
            ✕ Reject
          </button>

          <button
            onClick={closeKycModal}
            style={{
              padding: '12px 20px',
              background: '#f1f5f9',
              color: '#475569',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#e2e8f0';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#f1f5f9';
            }}
          >
            Cancel
          </button>
        </div>

        {/* CSS Animation & Responsive Styles */}
        <style>{`
          @keyframes slideIn {
            from {
              transform: scale(0.95) translateY(-20px);
              opacity: 0;
            }
            to {
              transform: scale(1) translateY(0);
              opacity: 1;
            }
          }

          @media (max-width: 768px) {
            .kyc-modal-grid {
              grid-template-columns: 1fr !important;
              gap: 24px !important;
            }

            .kyc-modal-buttons {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </div>
    </div>
  )}

  {/* CREATE ORDER MODAL */}
  {createOrderModal && (
    <div
      className="create-order-overlay"
      onClick={closeCreateModal}
    >
      <div
        className="create-order-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fixed */}
        <div className="modal-header">
          <h2>Create Installation Order</h2>
          <button
            className="close-btn"
            onClick={closeCreateModal}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <form onSubmit={handleCreateOrder} className="order-form">
          <div className="form-content">
            {/* User ID */}
            <div className="form-group">
              <label htmlFor="user_id">User ID *</label>
<select
  id="user_id"
  name="user_id"
  value={
    formData.user_id
      ? JSON.stringify({
          user_id: formData.user_id,
          org_id: formData.org_id,
        })
      : ''
  }
  onChange={handleFormChange}
  required
>
                <option value="">Select User</option>
                {users.map(u => (
<option
  key={u.user_id}
  value={JSON.stringify({
    user_id: u.user_id,
    org_id: u.org_id
  })}
>
  {u.user_name?.first_name} {u.user_name?.last_name} - {u.phone_number}
</option>
                ))}
              </select>
              </div>
            </div>

            <div className="form-group">
  <label htmlFor="order_id">Order ID</label>
  <input
    id="order_id"
    type="text"
    name="order_id"
    value={formData.order_id}
    readOnly
    disabled
    className="readonly-input"
  />
  <span className="helper-text">Auto-generated</span>
</div>

{/* Transaction ID */}
<div className="form-group">
  <label htmlFor="txn_id">Transaction ID</label>

  <input
    id="txn_id"
    type="text"
    name="txn_id"
    value={formData.txn_id}
    readOnly
    disabled
    className="readonly-input"
  />

  <span className="helper-text">
    Auto-filled from latest successful transaction
  </span>
</div>

{/* Amount */}
<div className="form-group">
  <label htmlFor="amount">Amount *</label>

  <input
    id="amount"
    type="number"
    name="amount"
    value={formData.amount}
    onChange={handleFormChange}
    placeholder="Enter amount"
    required
    min="1"
  />

  <span className="helper-text">
    Enter the transaction amount
  </span>
</div>

          {/* Sticky Action Buttons */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={closeCreateModal}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={!formData.user_id}
            >
              Create Order
            </button>
          </div>
        </form>

        {/* Styles */}
        <style>{`
          .create-order-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(4px);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
            padding: 20px;
            animation: fadeIn 0.3s ease;
            overflow-y: auto;
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          .create-order-modal {
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
            width: 100%;
            max-width: 550px;
            max-height: 90vh;
            display: flex;
            flex-direction: column;
            animation: slideScale 0.3s ease;
            margin: auto;
          }

          @keyframes slideScale {
            from {
              opacity: 0;
              transform: scale(0.95) translateY(-20px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }

          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 32px 32px 16px 32px;
            border-bottom: 1px solid #e2e8f0;
            flex-shrink: 0;
          }

          .modal-header h2 {
            margin: 0;
            font-size: 22px;
            font-weight: 700;
            color: #0f172a;
          }

          .close-btn {
            background: none;
            border: none;
            font-size: 20px;
            color: #94a3b8;
            cursor: pointer;
            padding: 0;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
            transition: all 0.2s ease;
            flex-shrink: 0;
          }

          .close-btn:hover {
            background: #f1f5f9;
            color: #475569;
          }

          .order-form {
            display: flex;
            flex-direction: column;
            height: 100%;
            min-height: 0;
          }

          .form-content {
            flex: 1;
            overflow-y: auto;
            padding: 32px;
            display: flex;
            flex-direction: column;
            gap: 20px;
          }

          .form-content::-webkit-scrollbar {
            width: 6px;
          }

          .form-content::-webkit-scrollbar-track {
            background: transparent;
          }

          .form-content::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 3px;
          }

          .form-content::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }

          .form-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .form-group label {
            font-size: 13px;
            font-weight: 600;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .form-group input,
          .form-group select {
            padding: 12px 16px;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            font-size: 14px;
            background: white;
            color: #0f172a;
            transition: all 0.3s ease;
            font-family: inherit;
          }

          .form-group input:focus,
          .form-group select:focus {
            outline: none;
            border-color: #2563eb;
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
          }

          .form-group select {
            cursor: pointer;
            appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%23475569' d='M1 1l5 5 5-5'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 12px center;
            padding-right: 36px;
          }

          .readonly-input {
            background: #f1f5f9 !important;
            color: #94a3b8 !important;
            cursor: not-allowed !important;
          }

          .readonly-input:focus {
            border-color: #cbd5e1 !important;
            box-shadow: none !important;
          }

          .helper-text {
            font-size: 12px;
            color: #94a3b8;
            margin-top: 4px;
          }

          .modal-footer {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            padding: 24px 32px 32px 32px;
            border-top: 1px solid #e2e8f0;
            background: white;
            flex-shrink: 0;
          }

          .btn-secondary,
          .btn-primary {
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            border: none;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .btn-secondary {
            background: white;
            color: #475569;
            border: 1px solid #cbd5e1;
          }

          .btn-secondary:hover {
            background: #f8fafc;
            border-color: #94a3b8;
          }

          .btn-primary {
            background: #2563eb;
            color: white;
          }

          .btn-primary:hover:not(:disabled) {
            background: #1d4ed8;
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
          }

          .btn-primary:disabled {
            background: #cbd5e1;
            cursor: not-allowed;
            opacity: 0.6;
          }

          @media (max-width: 600px) {
            .create-order-modal {
              max-width: 95%;
              max-height: 95vh;
            }

            .modal-header {
              padding: 24px 24px 12px 24px;
            }

            .modal-header h2 {
              font-size: 18px;
            }

            .form-content {
              padding: 24px;
              gap: 16px;
            }

            .modal-footer {
              padding: 16px 24px 24px 24px;
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </div>
    </div>
  )}
          </Container>
        </Page>
      </HeadAdminNavbar>
    );
  }
