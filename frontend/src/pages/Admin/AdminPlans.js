import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Navbar from '../../components/Navbar/Headadmin-Navbar';
import AdminNavbar from '../../components/Navbar/Admin-Navbar';
import {
  getAllPlans,
  createPlan,
  updatePlan,
  deletePlan,
} from '../../services/planService';
import { useSelector } from 'react-redux';

// ==================== STYLED COMPONENTS ====================

const PageWrapper = styled.div`
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(to bottom, #f0f4f8 0%, #f8fafc 100%);
  padding-top: 7rem;
  padding-bottom: 3rem;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
`;

const PageHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.5px;
`;

const PageSubtitle = styled.p`
  color: #64748b;
  font-size: 1rem;
  margin: 0.75rem 0 0 0;
  font-weight: 400;
`;

const ControlSection = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 3rem;
  flex-wrap: wrap;
  gap: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1.5rem;
  }
`;

const PlanTypeButtons = styled.div`
  display: flex;
  gap: 1rem;
  background: white;
  padding: 0.75rem;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const TabButton = styled.button`
  padding: 0.85rem 2rem;
  border: 2px solid transparent;
  background: ${props => props.active ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'transparent'};
  color: ${props => props.active ? 'white' : '#64748b'};
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${props => props.active ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none'};

  &:hover {
    background: ${props => props.active ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' : '#f1f5f9'};
  }

  @media (max-width: 768px) {
    flex: 1;
    padding: 0.75rem 1.5rem;
    font-size: 0.85rem;
  }
`;

const AddPlanBtn = styled.button`
  padding: 0.85rem 2rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  display: flex;
  align-items: center;
  gap: 0.6rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
    background: linear-gradient(135deg, #059669 0%, #047857 100%);
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const PlansContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
`;

const SectionTitle = styled.h2`
  font-size: 1.4rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 2rem 0;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e2e8f0;
`;

const PlansGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const PlanCard = styled.div`
  background: linear-gradient(135deg, #f8fafc 0%, #f0f4f8 100%);
  border-radius: 12px;
  padding: 1.75rem;
  transition: all 0.4s ease;
  border: 2px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #3b82f6, #2563eb);
  }

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
    border-color: #dbeafe;
  }
`;

const PlanNameContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const PlanBadge = styled.div`
  width: 45px;
  height: 45px;
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  color: #1e40af;
  font-size: 1.2rem;
  flex-shrink: 0;
`;

const PlanName = styled.h3`
  font-size: 1.3rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
`;

const PlanDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  flex: 1;
  padding: 1.25rem 0;
  border-top: 1px solid #cbd5e1;
  border-bottom: 1px solid #cbd5e1;
`;

const DetailItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
`;

const DetailLabel = styled.span`
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 600;
`;

const DetailValue = styled.span`
  color: #0f172a;
  font-weight: 700;
  font-size: 1rem;
`;

const PriceValue = styled.span`
  color: #3b82f6;
  font-weight: 800;
  font-size: 1.2rem;
`;

const PlanActions = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: auto;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
`;

const EditButton = styled(ActionButton)`
  background: #fef3c7;
  color: #92400e;

  &:hover {
    background: #fcd34d;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(253, 211, 77, 0.3);
  }
`;

const DeleteButton = styled(ActionButton)`
  background: #fee2e2;
  color: #991b1b;

  &:hover {
    background: #fecaca;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(254, 202, 202, 0.3);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #64748b;

  p {
    font-size: 1.1rem;
    margin: 0;
    font-weight: 500;
  }
`;

const ErrorMessage = styled.div`
  padding: 1.25rem;
  margin-bottom: 2rem;
  background: #fee2e2;
  border-left: 4px solid #ef4444;
  border-radius: 8px;
  color: #991b1b;
  font-weight: 600;
  font-size: 0.9rem;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #64748b;
  font-size: 1rem;
  font-weight: 500;
`;

// ==================== MODAL COMPONENTS ====================

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  max-width: 520px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  padding: 2rem;
  border-bottom: 2px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #f0f4f8, #f8fafc);

  h2 {
    margin: 0;
    font-size: 1.5rem;
    color: #0f172a;
    font-weight: 800;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.8rem;
  color: #94a3b8;
  cursor: pointer;
  padding: 0;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    background: #e2e8f0;
    color: #0f172a;
  }
`;

const ModalBody = styled.div`
  padding: 2rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;

  &:last-of-type {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.7rem;
  font-weight: 700;
  color: #0f172a;
  font-size: 0.95rem;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 0.85rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: inherit;
  transition: all 0.3s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const FormSelect = styled.select`
  width: 100%;
  padding: 0.85rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: inherit;
  transition: all 0.3s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const PlanTypeFormButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  background: #f1f5f9;
  padding: 0.6rem;
  border-radius: 10px;
`;

const PlanTypeBtn = styled.button`
  flex: 1;
  padding: 0.8rem;
  border: 2px solid transparent;
  background: ${props => props.active ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'transparent'};
  color: ${props => props.active ? 'white' : '#64748b'};
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${props => props.active ? '0 2px 8px rgba(59, 130, 246, 0.2)' : 'none'};

  &:hover {
    background: ${props => props.active ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' : '#e2e8f0'};
  }
`;

const ModalFooter = styled.div`
  display: flex;
  gap: 1rem;
  padding: 2rem;
  border-top: 2px solid #f1f5f9;
  justify-content: flex-end;

  @media (max-width: 480px) {
    flex-direction: column-reverse;
  }
`;

const CancelBtn = styled.button`
  padding: 0.85rem 1.5rem;
  background: #f1f5f9;
  color: #334155;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #e2e8f0;
  }

  @media (max-width: 480px) {
    width: 100%;
  }
`;

const SubmitBtn = styled.button`
  padding: 0.85rem 1.5rem;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.35);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 480px) {
    width: 100%;
  }
`;

// ==================== MAIN COMPONENT ====================

const AdminPlans = () => {
  const [topupPlans, setTopupPlans] = useState([]);
  const [fixedPlans, setFixedPlans] = useState([]);
  const [form, setForm] = useState({
    _id: '',
    name: '',
    pricePerLiter: '',
    totalLiters: '',
    price: '',
    liters: '',
    validityDays: '',
  });
  const [editing, setEditing] = useState(false);
  const [selectedPlanType, setSelectedPlanType] = useState('Topup');
  const [selectedValidity, setSelectedValidity] = useState('30');
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useSelector((state) => state.auth);
  const role = localStorage.getItem('role');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const plans = await getAllPlans(token);
      const topup = plans.filter((plan) => plan.tag === 'topupPlan');
      const fixed = plans
        .filter((plan) => plan.tag === 'fixedPlan')
        .map((plan) => ({
          ...plan,
          expiryDate: calculateExpiryDate(plan.validityDays),
        }));
      
      setTopupPlans(topup);
      setFixedPlans(fixed);
    } catch (error) {
      console.error('Error fetching plans:', error);
      setError('Failed to fetch plans. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const calculateExpiryDate = (validity) => {
    if (!validity) return 'N/A';
    const startDate = new Date();
    const expiryDate = new Date(startDate);
    expiryDate.setDate(startDate.getDate() + parseInt(validity));
    return expiryDate.toISOString().split('T')[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const planData = {
        planName: form.name,
        price: selectedPlanType === 'Topup' ? Number(form.pricePerLiter) : Number(form.price),
        tag: selectedPlanType === 'Topup' ? 'topupPlan' : 'fixedPlan',
      };

      if (selectedPlanType === 'Topup') {
        planData.totalLiters = Number(form.totalLiters);
      } else {
        planData.validityDays = Number(selectedValidity);
        if (form.liters) {
          planData.liters = Number(form.liters);
        }
      }

      if (editing) {
        if (!form._id) {
          throw new Error('Plan ID is missing for update operation');
        }
        await updatePlan(token, form._id, planData);
        alert('Plan updated successfully!');
      } else {
        await createPlan(token, planData);
        alert('Plan added successfully!');
      }
      
      fetchPlans();
      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving plan:', error);
      setError(error.message || 'Failed to save plan. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (plan, type) => {
    if (!plan || !plan._id) {
      setError('Invalid plan data');
      return;
    }
    
    const planType = type === 'Topup' ? 'Topup' : 'Fixed';
    setSelectedPlanType(planType);
    
    setForm({
      _id: plan._id,
      name: plan.planName || '',
      pricePerLiter: planType === 'Topup' ? plan.price : '',
      totalLiters: plan.totalLiters || '',
      price: planType === 'Fixed' ? plan.price : '',
      liters: plan.liters || '',
      validityDays: plan.validityDays || '',
    });
    
    if (planType === 'Fixed') {
      setSelectedValidity(plan.validityDays ? plan.validityDays.toString() : '30');
    }
    
    setEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (planId) => {
    if (!planId) {
      alert('Invalid plan ID');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this plan?')) {
      setIsLoading(true);
      setError(null);
      
      try {
        await deletePlan(token, planId);
        alert('Plan deleted successfully!');
        fetchPlans();
      } catch (error) {
        console.error('Error deleting plan:', error);
        setError('Failed to delete plan. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const resetForm = () => {
    setForm({
      _id: '',
      name: '',
      pricePerLiter: '',
      totalLiters: '',
      price: '',
      liters: '',
      validityDays: '',
    });
    setEditing(false);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setSelectedPlanType('Topup');
    setShowModal(true);
  };

  const displayPlans = selectedPlanType === 'Topup' ? topupPlans : fixedPlans;

  return (
    <PageWrapper>
      {role === 'headadmin' ? <Navbar /> : <AdminNavbar />}
      
      <Container>
        {/* Header */}
        <PageHeader>
          <PageTitle>Recharge Plans</PageTitle>
          <PageSubtitle>Create and manage your water subscription plans</PageSubtitle>
        </PageHeader>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        {/* Control Section */}
        <ControlSection>
          <PlanTypeButtons>
            <TabButton
              active={selectedPlanType === 'Topup'}
              onClick={() => setSelectedPlanType('Topup')}
            >
              Topup Plans
            </TabButton>
            <TabButton
              active={selectedPlanType === 'Fixed'}
              onClick={() => setSelectedPlanType('Fixed')}
            >
              Fixed Plans
            </TabButton>
          </PlanTypeButtons>

          <AddPlanBtn onClick={handleOpenAddModal}>
            + Add New Plan
          </AddPlanBtn>
        </ControlSection>

        {/* Plans Container */}
        <PlansContainer>
          <SectionTitle>
            {selectedPlanType === 'Topup' ? 'Topup Plans' : 'Fixed Plans'}
          </SectionTitle>

          {isLoading ? (
            <LoadingMessage>Loading plans...</LoadingMessage>
          ) : displayPlans.length === 0 ? (
            <EmptyState>
              <p>No {selectedPlanType.toLowerCase()} plans available yet</p>
            </EmptyState>
          ) : (
            <PlansGrid>
              {displayPlans.map((plan, index) => (
                <PlanCard key={plan._id}>
                  <PlanNameContainer>
                    <PlanBadge>{index + 1}</PlanBadge>
                    <PlanName>{plan.planName}</PlanName>
                  </PlanNameContainer>
                  
                  <PlanDetails>
                    {selectedPlanType === 'Topup' ? (
                      <>
                        <DetailItem>
                          <DetailLabel>Price per Liter</DetailLabel>
                          <PriceValue>₹{plan.price}</PriceValue>
                        </DetailItem>
                        <DetailItem>
                          <DetailLabel>Total Liters</DetailLabel>
                          <DetailValue>{plan.totalLiters} L</DetailValue>
                        </DetailItem>
                        <DetailItem>
                          <DetailLabel>Total Cost</DetailLabel>
                          <DetailValue>₹{(plan.price * plan.totalLiters).toFixed(2)}</DetailValue>
                        </DetailItem>
                      </>
                    ) : (
                      <>
                        <DetailItem>
                          <DetailLabel>Price</DetailLabel>
                          <PriceValue>₹{plan.price}</PriceValue>
                        </DetailItem>
                        <DetailItem>
                          <DetailLabel>Liters</DetailLabel>
                          <DetailValue>{plan.liters ? `${plan.liters} L` : 'N/A'}</DetailValue>
                        </DetailItem>
                        <DetailItem>
                          <DetailLabel>Validity</DetailLabel>
                          <DetailValue>{plan.validityDays} days</DetailValue>
                        </DetailItem>
                        <DetailItem>
                          <DetailLabel>Expiry Date</DetailLabel>
                          <DetailValue>{plan.expiryDate}</DetailValue>
                        </DetailItem>
                      </>
                    )}
                  </PlanDetails>

                  <PlanActions>
                    <EditButton onClick={() => handleEdit(plan, selectedPlanType)}>
                      Edit
                    </EditButton>
                    <DeleteButton onClick={() => handleDelete(plan._id)}>
                      Delete
                    </DeleteButton>
                  </PlanActions>
                </PlanCard>
              ))}
            </PlansGrid>
          )}
        </PlansContainer>
      </Container>

      {/* Modal for adding/editing plans */}
      {showModal && (
        <ModalOverlay onClick={() => setShowModal(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <h2>{editing ? 'Edit Plan' : 'Add New Plan'}</h2>
              <CloseButton onClick={() => setShowModal(false)}>×</CloseButton>
            </ModalHeader>

            <ModalBody>
              {error && <ErrorMessage>{error}</ErrorMessage>}

              <form onSubmit={handleSubmit}>
                <PlanTypeFormButtons>
                  <PlanTypeBtn
                    type="button"
                    active={selectedPlanType === 'Topup'}
                    onClick={() => setSelectedPlanType('Topup')}
                  >
                    Topup Plan
                  </PlanTypeBtn>
                  <PlanTypeBtn
                    type="button"
                    active={selectedPlanType === 'Fixed'}
                    onClick={() => setSelectedPlanType('Fixed')}
                  >
                    Fixed Plan
                  </PlanTypeBtn>
                </PlanTypeFormButtons>

                <FormGroup>
                  <Label>Plan Name</Label>
                  <FormInput
                    type="text"
                    name="name"
                    placeholder="e.g., Diamond, Platinum"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </FormGroup>

                {selectedPlanType === 'Topup' ? (
                  <>
                    <FormRow>
                      <FormGroup>
                        <Label>Price per Liter (₹)</Label>
                        <FormInput
                          type="number"
                          name="pricePerLiter"
                          placeholder="e.g., 100"
                          value={form.pricePerLiter}
                          onChange={handleChange}
                          required
                          min="0"
                          step="0.01"
                        />
                      </FormGroup>

                      <FormGroup>
                        <Label>Total Liters</Label>
                        <FormInput
                          type="number"
                          name="totalLiters"
                          placeholder="e.g., 25"
                          value={form.totalLiters}
                          onChange={handleChange}
                          required
                          min="0"
                          step="0.01"
                        />
                      </FormGroup>
                    </FormRow>
                  </>
                ) : (
                  <>
                    <FormRow>
                      <FormGroup>
                        <Label>Price (₹)</Label>
                        <FormInput
                          type="number"
                          name="price"
                          placeholder="e.g., 2500"
                          value={form.price}
                          onChange={handleChange}
                          required
                          min="0"
                          step="0.01"
                        />
                      </FormGroup>

                      <FormGroup>
                        <Label>Total Liters</Label>
                        <FormInput
                          type="number"
                          name="liters"
                          placeholder="e.g., 100 (optional)"
                          value={form.liters}
                          onChange={handleChange}
                          min="0"
                          step="0.01"
                        />
                      </FormGroup>
                    </FormRow>

                    <FormGroup>
                      <Label>Validity Period</Label>
                      <FormSelect
                        value={selectedValidity}
                        onChange={(e) => setSelectedValidity(e.target.value)}
                      >
                        <option value="30">30 days</option>
                        <option value="60">60 days</option>
                        <option value="90">90 days</option>
                        <option value="365">1 year</option>
                      </FormSelect>
                    </FormGroup>
                  </>
                )}

                <ModalFooter>
                  <CancelBtn
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </CancelBtn>
                  <SubmitBtn type="submit" disabled={isLoading}>
                    {isLoading ? 'Processing...' : editing ? 'Update Plan' : 'Add Plan'}
                  </SubmitBtn>
                </ModalFooter>
              </form>
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}
    </PageWrapper>
  );
};

export default AdminPlans;
