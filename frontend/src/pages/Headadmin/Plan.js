import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import axios from '../../utils/axiosConfig';
import HeadAdminNavbar from '../../components/Navbar/HeadAdminNavbar';
import { 
  MdAdd, 
  MdEdit, 
  MdDelete, 
  MdHistory, 
  MdSearch, 
  MdLayers, 
  MdCheckCircle, 
  MdArchive,
  MdClose,
  MdInfoOutline
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
   STYLES - TABS
========================= */
const TabsWrapper = styled.div`
  display: flex;
  gap: 0.5rem;
  background: #f1f5f9;
  padding: 0.25rem;
  border-radius: 0.75rem;
  width: fit-content;
  margin-bottom: 1.5rem;
`;

const TabButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: none;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: ${(p) => (p.active ? 'white' : 'transparent')};
  color: ${(p) => (p.active ? '#2563eb' : '#64748b')};
  box-shadow: ${(p) => (p.active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none')};

  &:hover {
    color: ${(p) => (p.active ? '#2563eb' : '#1e293b')};
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
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
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
  }
`;

const PrimaryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  background: #2563eb;
  color: white;

  &:hover {
    background: #1d4ed8;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
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
  padding: 1rem;
  background: #f8fafc;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 2px solid #e2e8f0;
`;

const Td = styled.td`
  padding: 1rem;
  font-size: 0.875rem;
  color: #334155;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
`;

const PlanName = styled.div`
  font-weight: 700;
  color: #1e293b;
`;

const PlanIdCode = styled.code`
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  color: #64748b;
  background: #f1f5f9;
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
`;

const PriceText = styled.span`
  font-weight: 800;
  color: #1e293b;
  font-size: 1rem;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${(p) => p.bg || '#eff6ff'};
  color: ${(p) => p.color || '#2563eb'};
`;

const ActionButton = styled.button`
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.15s;
  background: ${(p) => p.bg || '#f1f5f9'};
  color: ${(p) => p.color || '#475569'};

  &:hover {
    transform: translateY(-2px);
    background: ${(p) => p.hoverBg || '#e2e8f0'};
    color: white;
  }
`;

/* =========================
   STYLES - MODAL
========================= */
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 1.5rem;
  animation: fadeIn 0.2s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ModalContent = styled.div`
  background: white;
  width: 100%;
  max-width: 550px;
  border-radius: 1.25rem;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);

  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
`;

const ModalHeader = styled.div`
  padding: 1.5rem;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 700;
    color: #1e293b;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    
    svg {
      color: #2563eb;
    }
  }

  button {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #94a3b8;
    cursor: pointer;
    transition: color 0.15s;
    display: flex;
    align-items: center;

    &:hover {
      color: #ef4444;
    }
  }
`;

const ModalBody = styled.form`
  padding: 1.5rem;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
`;

const ModalFooter = styled.div`
  padding: 1.25rem 1.5rem;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  grid-column: ${(p) => p.full ? 'span 2' : 'span 1'};

  label {
    font-size: 0.75rem;
    font-weight: 700;
    color: #64748b;
    text-transform: uppercase;
  }

  input, select {
    padding: 0.625rem 0.75rem;
    border-radius: 0.5rem;
    border: 1.5px solid ${(p) => p.error ? '#ef4444' : '#e2e8f0'};
    font-size: 0.9375rem;
    outline: none;
    transition: all 0.2s;

    &:focus {
      border-color: ${(p) => p.error ? '#ef4444' : '#3b82f6'};
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
  }

  span {
    font-size: 0.75rem;
    color: #ef4444;
  }
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
const formatDateTime = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

/* =========================
   MAIN COMPONENT
========================= */
export default function Plan() {
  const [plans, setPlans] = useState([]);
  const [archivedPlans, setArchivedPlans] = useState([]);
  const [tab, setTab] = useState('active');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [currentPlan, setCurrentPlan] = useState(null);
  const [errors, setErrors] = useState({});

const [form, setForm] = useState({
  name: '',
  price: '',
  limit: '',
  validityType: 'Unlimited', // Unlimited | Days
  validityDays: '',
  type: 'Standard',
});
  const isHeadAdmin = localStorage.getItem('role') === 'headadmin';

  useEffect(() => {
    loadAllPlans();
  }, []);

  const loadAllPlans = async () => {
    try {
      setLoading(true);
      const [activeRes, archivedRes] = await Promise.all([
        axios.get('/api/headadmin/plans/active'),
        axios.get('/api/headadmin/plans/archived')
      ]);
      setPlans(activeRes.data || []);
      setArchivedPlans(archivedRes.data || []);
    } catch (err) {
      console.error('Failed to load plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mode, plan = null) => {
    setModalMode(mode);
    if (mode === 'edit' && plan) {
      setCurrentPlan(plan);
setForm({
  name: plan.name,
  price: plan.price,
  limit: plan.limit,
  validityType: plan.validity ? 'Days' : 'Unlimited',
  validityDays: plan.validity
    ? plan.validity.replace(' Days', '')
    : '',
  type: plan.type,
});
    } else {
      setCurrentPlan(null);
setForm({
  name: '',
  price: '',
  limit: '',
  validityType: 'Unlimited',
  validityDays: '',
  type: 'Standard',
});
    }
    setModalOpen(true);
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  const newErrors = {};

  if (!form.name.trim()) newErrors.name = 'Plan name is required';
  if (!form.price) newErrors.price = 'Price is required';
  if (!form.limit) newErrors.limit = 'Limit is required';
  if (!form.type) newErrors.type = 'Plan type is required';

  if (form.validityType === 'Days' && !form.validityDays) {
    newErrors.validityDays = 'Number of days is required';
  }

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

  setErrors({});

  const finalValidity =
    form.validityType === 'Unlimited'
      ? null
      : `${form.validityDays} Days`;

  try {
    if (modalMode === 'create') {
      await axios.post('/api/headadmin/plans', {
        name: form.name,
        price: Number(form.price),
        limit: Number(form.limit),
        validity: finalValidity,
        type: form.type,
      });
    } else {
      await axios.put(`/api/headadmin/plans/${currentPlan._id}`, {
        name: form.name,
        price: Number(form.price),
        limit: Number(form.limit),
        validity: finalValidity,
        type: form.type,
      });
    }

    setModalOpen(false);
    loadAllPlans();
  } catch (err) {
    console.error(err);
  }
};


  const deletePlan = async (id) => {
    if (!window.confirm('Are you sure you want to archive/delete this plan?')) return;
    try {
      await axios.delete(`/api/headadmin/plans/${id}`);
      loadAllPlans();
    } catch (err) {
      console.error('Failed to delete plan:', err);
    }
  };

  const filtered = useMemo(() => {
    const list = tab === 'active' ? plans : archivedPlans;
    return list.filter((p) =>
      `${p.name} ${p.plan_id} ${p.type}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [plans, archivedPlans, tab, search]);

  const stats = useMemo(() => {
    return {
      active: plans.length,
      archived: archivedPlans.length,
      standard: plans.filter(p => p.type === 'Standard').length,
      premium: plans.filter(p => p.type === 'Premium').length,
    };
  }, [plans, archivedPlans]);

  return (
    <HeadAdminNavbar>
      <PageContainer>
        <HeaderSection>
          <TitleGroup>
            <MdLayers />
            <Title>Recharge Plans</Title>
          </TitleGroup>
          {isHeadAdmin && (
            <PrimaryButton onClick={() => handleOpenModal('create')}>
              <MdAdd size={20} /> Create New Plan
            </PrimaryButton>
          )}
        </HeaderSection>

        <StatsGrid>
          <StatCard bg="#eff6ff" color="#2563eb">
            <div className="icon-box">
              <MdCheckCircle />
            </div>
            <div className="info">
              <span className="label">Active Plans</span>
              <span className="value">{loading ? '...' : stats.active}</span>
            </div>
          </StatCard>
          <StatCard bg="#fef3c7" color="#d97706">
            <div className="icon-box">
              <MdArchive />
            </div>
            <div className="info">
              <span className="label">Archived Plans</span>
              <span className="value">{loading ? '...' : stats.archived}</span>
            </div>
          </StatCard>
          <StatCard bg="#f0fdf4" color="#16a34a">
            <div className="icon-box">
              <MdLayers />
            </div>
            <div className="info">
              <span className="label">Standard / Premium</span>
              <span className="value">{loading ? '...' : `${stats.standard} / ${stats.premium}`}</span>
            </div>
          </StatCard>
        </StatsGrid>

        <TabsWrapper>
          <TabButton active={tab === 'active'} onClick={() => setTab('active')}>
            <MdCheckCircle size={18} /> Active Plans
          </TabButton>
          <TabButton active={tab === 'archived'} onClick={() => setTab('archived')}>
            <MdHistory size={18} /> Archived History
          </TabButton>
        </TabsWrapper>

        <ControlsWrapper>
          <SearchBox>
            <MdSearch />
            <input
              placeholder="Search by plan name, type or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </SearchBox>
        </ControlsWrapper>

        {loading ? (
          <TableContainer>
            <LoadingSkeleton>
              {[1, 2, 3, 4, 5].map(i => <div key={i} className="row" />)}
            </LoadingSkeleton>
          </TableContainer>
        ) : filtered.length === 0 ? (
          <EmptyState>
            <MdLayers className="icon" />
            <h3>No plans found</h3>
            <p>Try searching for something else or create a new plan.</p>
          </EmptyState>
        ) : (
          <TableContainer>
            <TableScroll>
              <StyledTable>
                <thead>
                  <tr>
                    <Th style={{ width: '60px' }}>#</Th>
                    <Th>Plan Details</Th>
                    <Th>Pricing</Th>
                    <Th>Volume Limit</Th>
                    <Th>Validity</Th>
                    <Th>Type</Th>
                    <Th>{tab === 'active' ? 'Created' : 'Archived'}</Th>
                    <Th>Actions</Th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => (
                    <tr key={p._id}>
                      <Td style={{ color: '#94a3b8', fontWeight: 600 }}>{i + 1}</Td>
                      <Td>
                        <div style={{ textAlign: 'left' }}>
                          <PlanName>{p.name}</PlanName>
                          <PlanIdCode>{p.plan_id}</PlanIdCode>
                        </div>
                      </Td>
                      <Td>
                        <PriceText>₹ {p.price.toLocaleString()}</PriceText>
                      </Td>
                      <Td>
                        <Badge bg="#f0fdf4" color="#16a34a">
                          {p.limit} Litres
                        </Badge>
                      </Td>
                      <Td>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#64748b' }}>
                          <MdHistory /> {p.validity || 'Unlimited'}
                        </div>
                      </Td>
                      <Td>
                        <Badge bg={p.type === 'Premium' ? '#f5f3ff' : '#eff6ff'} color={p.type === 'Premium' ? '#7c3aed' : '#2563eb'}>
                          {p.type}
                        </Badge>
                      </Td>
                      <Td style={{ whiteSpace: 'nowrap', fontSize: '0.75rem', color: '#64748b' }}>
                        {formatDateTime(tab === 'active' ? p.created_at : p.modified_at)}
                      </Td>
                      <Td>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          {tab === 'active' && isHeadAdmin ? (
                            <>
                              <ActionButton 
                                title="Edit Plan"
                                bg="#eff6ff" 
                                color="#2563eb"
                                hoverBg="#2563eb"
                                onClick={() => handleOpenModal('edit', p)}
                              >
                                <MdEdit />
                              </ActionButton>
                              <ActionButton 
                                title="Archive Plan"
                                bg="#fef2f2" 
                                color="#dc2626"
                                hoverBg="#dc2626"
                                onClick={() => deletePlan(p._id)}
                              >
                                <MdDelete />
                              </ActionButton>
                            </>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.75rem' }}>
                              <MdInfoOutline /> {tab === 'active' ? 'View Only' : p.action || 'Archived'}
                            </div>
                          )}
                        </div>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </StyledTable>
            </TableScroll>
          </TableContainer>
        )}
      </PageContainer>

      {/* ================= PLAN MODAL ================= */}
      {modalOpen && (
        <ModalOverlay onClick={() => setModalOpen(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h3>{modalMode === 'create' ? <MdAdd /> : <MdEdit />} {modalMode === 'create' ? 'Create New Plan' : 'Edit Plan Details'}</h3>
              <button onClick={() => setModalOpen(false)}><MdClose /></button>
            </ModalHeader>
<ModalBody onSubmit={handleSubmit}>

  {/* PLAN NAME */}
  <FormField full error={errors.name}>
    <label>Plan Name *</label>
    <input
      placeholder="e.g. Standard Monthly Recharge"
      value={form.name}
      onChange={(e) =>
        setForm({ ...form, name: e.target.value })
      }
    />
    {errors.name && <span>{errors.name}</span>}
  </FormField>

  {/* PRICE */}
  <FormField error={errors.price}>
    <label>Price (₹) *</label>
    <input
      type="number"
      placeholder="0.00"
      value={form.price}
      onChange={(e) =>
        setForm({ ...form, price: e.target.value })
      }
    />
    {errors.price && <span>{errors.price}</span>}
  </FormField>

  {/* LIMIT */}
  <FormField error={errors.limit}>
    <label>Limit (Litres) *</label>
    <input
      type="number"
      placeholder="e.g. 1000"
      value={form.limit}
      onChange={(e) =>
        setForm({ ...form, limit: e.target.value })
      }
    />
    {errors.limit && <span>{errors.limit}</span>}
  </FormField>

  {/* VALIDITY TYPE */}
  <FormField>
    <label>Validity *</label>
    <select
      value={form.validityType}
      onChange={(e) =>
        setForm({ ...form, validityType: e.target.value })
      }
    >
      <option value="Unlimited">Unlimited</option>
      <option value="Days">Days</option>
    </select>
  </FormField>

  {/* VALIDITY DAYS (CONDITIONAL) */}
  {form.validityType === 'Days' && (
    <FormField error={errors.validityDays}>
      <label>Number of Days *</label>
      <input
        type="number"
        min="1"
        placeholder="Enter total days"
        value={form.validityDays}
        onChange={(e) =>
          setForm({ ...form, validityDays: e.target.value })
        }
      />
      {errors.validityDays && (
        <span>{errors.validityDays}</span>
      )}
    </FormField>
  )}

  {/* PLAN TYPE */}
  <FormField error={errors.type}>
    <label>Plan Type *</label>
    <select
      value={form.type}
      onChange={(e) =>
        setForm({ ...form, type: e.target.value })
      }
    >
      <option value="">Select Plan Type</option>
      <option value="Standard">Standard</option>
      <option value="Premium">Premium</option>
    </select>
    {errors.type && <span>{errors.type}</span>}
  </FormField>

</ModalBody>
            <ModalFooter>
              <PrimaryButton 
                style={{ background: '#f1f5f9', color: '#475569' }} 
                type="button"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </PrimaryButton>
              <PrimaryButton onClick={handleSubmit}>
                {modalMode === 'create' ? 'Create Plan' : 'Update Plan'}
              </PrimaryButton>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}
    </HeadAdminNavbar>
  );
}
