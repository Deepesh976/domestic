import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from '../../utils/axiosConfig';
import HeadAdminNavbar from '../../components/Navbar/HeadAdminNavbar';
import { useNavigate, useParams } from 'react-router-dom';

/* =========================
   LAYOUT CONSTANTS
========================= */
const NAVBAR_HEIGHT = 64;
const SIDEBAR_WIDTH = 260;

/* =========================
   STYLES
========================= */
const PageWrapper = styled.div`
  position: fixed;
  top: ${NAVBAR_HEIGHT}px;
  left: ${SIDEBAR_WIDTH}px;
  right: 0;
  bottom: 0;
  background: #f8fafc;
  overflow-y: auto;
`;

const Content = styled.div`
  max-width: 700px;
  margin: 0 auto;
  padding: 32px;
`;

const Card = styled.div`
  background: white;
  border-radius: 14px;
  padding: 28px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
`;

const Title = styled.h2`
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 24px;
`;

const Field = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
  color: #334155;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  font-size: 14px;
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  font-size: 14px;
`;

const Actions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
`;

const Button = styled.button`
  padding: 10px 18px;
  border-radius: 10px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  background: ${({ variant }) =>
    variant === 'cancel' ? '#e5e7eb' : '#2563eb'};
  color: ${({ variant }) => (variant === 'cancel' ? '#111' : '#fff')};

  &:hover {
    opacity: 0.9;
  }
`;

const Loading = styled.div`
  padding: 80px;
  text-align: center;
  color: #64748b;
`;

/* =========================
   COMPONENT
========================= */
export default function EditPlan() {
  const { planId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [limit, setLimit] = useState('');
  const [validity, setValidity] = useState('');
  const [type, setType] = useState('Standard');

  /* =========================
     LOAD PLAN
  ========================= */
  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const res = await axios.get('/api/headadmin/plans/active');
        const plan = res.data.find((p) => p._id === planId);

        if (!plan) {
          alert('Plan not found');
          navigate('/head-admin/plans');
          return;
        }

        setName(plan.name);
        setPrice(plan.price);
        setLimit(plan.limit);
        setValidity(plan.validity || '');
        setType(plan.type);
      } catch (err) {
        console.error(err);
        alert('Failed to load plan');
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [planId, navigate]);

  /* =========================
     UPDATE PLAN
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    await axios.put(`/api/headadmin/plans/${planId}`, {
      name,
      price,
      limit,
      validity,
      type,
    });

    navigate('/head-admin/plans');
  };

  if (loading) {
    return (
      <>
        <HeadAdminNavbar />
        <PageWrapper>
          <Loading>Loading plan details…</Loading>
        </PageWrapper>
      </>
    );
  }

  return (
    <>
      <HeadAdminNavbar />

      <PageWrapper>
        <Content>
          <Card>
            <Title>Edit Plan</Title>

            <form onSubmit={handleSubmit}>
              <Field>
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </Field>

              <Field>
                <Label>Price</Label>
                <Input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </Field>

              <Field>
                <Label>Limit</Label>
                <Input
                  type="number"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                />
              </Field>

              <Field>
                <Label>Validity</Label>
                <Input
                  placeholder="Unlimited / 12 months"
                  value={validity}
                  onChange={(e) => setValidity(e.target.value)}
                />
              </Field>

              <Field>
                <Label>Type</Label>
                <Select value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="Standard">Standard</option>
                  <option value="Premium">Premium</option>
                </Select>
              </Field>

              <Actions>
                <Button type="submit">Update Plan</Button>
                <Button
                  type="button"
                  variant="cancel"
                  onClick={() => navigate('/head-admin/plans')}
                >
                  Cancel
                </Button>
              </Actions>
            </form>
          </Card>
        </Content>
      </PageWrapper>
    </>
  );
}
