import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import HeadAdminNavbar from '../../components/Navbar/HeadAdminNavbar';
import {
  getSupport,
  createSupport,
  updateSupport,
  deleteSupport,
} from '../../services/headAdminService';

/* =========================
   PAGE LAYOUT
========================= */

const Page = styled.div`
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  min-height: 100vh;
`;

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 32px 24px 40px;
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
   STATS GRID
========================= */

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
`;

const StatCard = styled.div`
  background: white;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const StatIcon = styled.div`
  font-size: 24px;
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  font-size: 11px;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
`;

const StatValue = styled.div`
  font-size: 20px;
  font-weight: 900;
  color: #2563eb;
`;

/* =========================
   MAIN CARD
========================= */

const FormCard = styled.div`
  background: white;
  padding: 32px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const CardTitle = styled.h2`
  font-size: 20px;
  font-weight: 900;
  color: #0f172a;
  margin-bottom: 8px;
`;

const CardDescription = styled.p`
  font-size: 13px;
  color: #64748b;
  margin-bottom: 24px;
`;

/* =========================
   FORM FIELDS
========================= */

const FormSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const AddressSection = styled.div`
  grid-column: 1 / -1;
  margin-bottom: 20px;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Value = styled.div`
  font-weight: 600;
  font-size: 15px;
  color: #0f172a;
  padding: 12px 0;
`;

const Input = styled.input`
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  font-size: 14px;
  background: white;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    background: #f8fafc;
  }

  &::placeholder {
    color: #94a3b8;
  }
`;

const ErrorMessage = styled.div`
  font-size: 12px;
  color: #dc2626;
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ViewCard = styled.div`
  background: #f8fafc;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
`;

const ViewLabel = styled.div`
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
`;

const ViewValue = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  word-break: break-all;
`;

/* =========================
   ACTIONS
========================= */

const ActionsSection = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 32px;
  flex-wrap: wrap;
`;

const Button = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${(p) => (p.danger ? '#dc2626' : '#2563eb')};
  color: white;

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

const SecondaryButton = styled(Button)`
  background: white;
  color: #2563eb;
  border: 1px solid #cbd5e1;

  &:hover:not(:disabled) {
    background: #f1f5f9;
    border-color: #94a3b8;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 24px;
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

export default function HeadAdminSupport() {
  const role = localStorage.getItem('role')?.toLowerCase();
  const [support, setSupport] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    email: '',
    phoneNo: '',
    address: '',
  });

  const [errors, setErrors] = useState({
    email: '',
    phoneNo: '',
    address: '',
  });

  useEffect(() => {
    loadSupport();
  }, []);

  const loadSupport = async () => {
    setLoading(true);
    try {
      const res = await getSupport();
      if (res.data) {
        setSupport(res.data);
        setForm(res.data);
      }
    } catch (error) {
      console.error('Failed to load support details', error);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     VALIDATION
  ========================= */

  const validateEmail = (email) => email.includes('@');
  const validatePhone = (phone) => /^[0-9]{10,}$/.test(phone);
  const validateAddress = (address) => address.trim().length > 0;

  const handleChange = (field, value) => {
    // Phone validation - only digits
    if (field === 'phoneNo' && !/^[0-9]*$/.test(value)) return;

    setForm({ ...form, [field]: value });

    // Real-time validation
    if (field === 'email') {
      setErrors({
        ...errors,
        email: validateEmail(value) ? '' : 'Invalid email format',
      });
    }

    if (field === 'phoneNo') {
      setErrors({
        ...errors,
        phoneNo: validatePhone(value) ? '' : 'Phone must be at least 10 digits',
      });
    }

    if (field === 'address') {
      setErrors({
        ...errors,
        address: validateAddress(value) ? '' : 'Address is required',
      });
    }
  };

  const isFormValid =
    validateEmail(form.email) &&
    validatePhone(form.phoneNo) &&
    validateAddress(form.address) &&
    !errors.email &&
    !errors.phoneNo &&
    !errors.address;

  /* =========================
     ACTIONS
  ========================= */

  const handleSave = async () => {
    if (!isFormValid) return;

    try {
      if (support) {
        await updateSupport(form);
        alert('Support details updated successfully ✅');
      } else {
        await createSupport(form);
        alert('Support details created successfully ✅');
      }
      setEditing(false);
      loadSupport();
    } catch (error) {
      alert('Failed to save support details');
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete support details?')) return;
    try {
      await deleteSupport();
      alert('Support details deleted successfully ✅');
      setSupport(null);
      setForm({ email: '', phoneNo: '', address: '' });
      setErrors({ email: '', phoneNo: '', address: '' });
    } catch (error) {
      alert('Failed to delete support details');
      console.error(error);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    if (support) {
      setForm(support);
    } else {
      setForm({ email: '', phoneNo: '', address: '' });
    }
    setErrors({ email: '', phoneNo: '', address: '' });
  };

  return (
    <HeadAdminNavbar>
      <Page>
        <Container>
          <HeaderSection>
            <PageTitle>Support Details</PageTitle>
            <PageDescription>
              Manage your organization's support contact information
            </PageDescription>
          </HeaderSection>

          {/* Stats Cards */}
          <StatsGrid>
            <StatCard>
              <StatIcon>✉️</StatIcon>
              <StatLabel>Email</StatLabel>
              <StatValue>{support ? '✓' : '○'}</StatValue>
            </StatCard>
            <StatCard>
              <StatIcon>📞</StatIcon>
              <StatLabel>Phone</StatLabel>
              <StatValue>{support ? '✓' : '○'}</StatValue>
            </StatCard>
            <StatCard>
              <StatIcon>📍</StatIcon>
              <StatLabel>Address</StatLabel>
              <StatValue>{support ? '✓' : '○'}</StatValue>
            </StatCard>
            <StatCard>
              <StatIcon>📋</StatIcon>
              <StatLabel>Status</StatLabel>
              <StatValue>{support ? 'Active' : 'Empty'}</StatValue>
            </StatCard>
          </StatsGrid>

          {/* Form Card */}
          <FormCard>
            {loading ? (
              <EmptyState>
                <EmptyIcon>⏳</EmptyIcon>
                <EmptyText>Loading support details...</EmptyText>
              </EmptyState>
            ) : editing || !support ? (
              <>
                <CardTitle>
                  {support ? 'Edit Support Details' : 'Create Support Details'}
                </CardTitle>
                <CardDescription>
                  {support
                    ? 'Update your organization support contact information'
                    : 'Add your organization support contact information'}
                </CardDescription>

                <FormSection>
                  <Field>
                    <Label>Email Address</Label>
                    <Input
                      type="email"
                      placeholder="support@example.com"
                      value={form.email}
                      onChange={(e) =>
                        handleChange('email', e.target.value)
                      }
                    />
                    {errors.email && (
                      <ErrorMessage>⚠️ {errors.email}</ErrorMessage>
                    )}
                  </Field>

                  <Field>
                    <Label>Phone Number</Label>
                    <Input
                      type="tel"
                      placeholder="1234567890"
                      value={form.phoneNo}
                      onChange={(e) =>
                        handleChange('phoneNo', e.target.value)
                      }
                    />
                    {errors.phoneNo && (
                      <ErrorMessage>⚠️ {errors.phoneNo}</ErrorMessage>
                    )}
                  </Field>
                </FormSection>

                <AddressSection>
                  <Field>
                    <Label>Address</Label>
                    <Input
                      placeholder="Enter your organization address..."
                      value={form.address}
                      onChange={(e) =>
                        handleChange('address', e.target.value)
                      }
                    />
                    {errors.address && (
                      <ErrorMessage>⚠️ {errors.address}</ErrorMessage>
                    )}
                  </Field>
                </AddressSection>

                {role === 'headadmin' && (
                  <ActionsSection>
                    <Button
                      onClick={handleSave}
                      disabled={!isFormValid}
                    >
                      Save Changes
                    </Button>
                    <SecondaryButton onClick={handleCancel}>
                      Cancel
                    </SecondaryButton>
                  </ActionsSection>
                )}
              </>
            ) : (
              <>
                <CardTitle>Support Details</CardTitle>
                <CardDescription>
                  Your organization support contact information
                </CardDescription>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                  <ViewCard>
                    <ViewLabel>Email Address</ViewLabel>
                    <ViewValue>{support.email}</ViewValue>
                  </ViewCard>

                  <ViewCard>
                    <ViewLabel>Phone Number</ViewLabel>
                    <ViewValue>{support.phoneNo}</ViewValue>
                  </ViewCard>
                </div>

                <ViewCard style={{ marginBottom: '24px' }}>
                  <ViewLabel>Address</ViewLabel>
                  <ViewValue>{support.address}</ViewValue>
                </ViewCard>

                {role === 'headadmin' && (
                  <ActionsSection>
                    <Button onClick={() => setEditing(true)}>
                      Edit Details
                    </Button>
                    <Button danger onClick={handleDelete}>
                      Delete Details
                    </Button>
                  </ActionsSection>
                )}
              </>
            )}
          </FormCard>
        </Container>
      </Page>
    </HeadAdminNavbar>
  );
}
