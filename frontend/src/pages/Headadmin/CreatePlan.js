import React, { useState } from 'react';
import styled from 'styled-components';
import axios from '../../utils/axiosConfig';
import HeadAdminNavbar from '../../components/Navbar/HeadAdminNavbar';
import { useNavigate } from 'react-router-dom';

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
  padding: 28px;
  max-width: 900px;
`;

const Card = styled.div`
  background: white;
  border-radius: 14px;
  padding: 28px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h2`
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
`;

const BackButton = styled.button`
  background: transparent;
  border: none;
  font-size: 14px;
  color: #2563eb;
  cursor: pointer;
  font-weight: 600;
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 6px;
`;

const Input = styled.input`
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #2563eb;
  }
`;

const Select = styled.select`
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  font-size: 14px;
`;

const Actions = styled.div`
  grid-column: span 2;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
`;

const Button = styled.button`
  padding: 10px 18px;
  border-radius: 10px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
`;

const CancelButton = styled(Button)`
  background: #e5e7eb;
  color: #111827;
`;

const SaveButton = styled(Button)`
  background: #2563eb;
  color: white;

  &:hover {
    background: #1d4ed8;
  }
`;

/* =========================
   COMPONENT
========================= */
export default function CreatePlan() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    price: '',
    limit: '',
    validity: '',
    type: 'Standard',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await axios.post('/api/headadmin/plans', {
      name: form.name,
      price: Number(form.price),
      limit: Number(form.limit),
      validity: form.validity || null,
      type: form.type,
    });

    navigate('/head-admin/plans');
  };

  return (
    <>
      <HeadAdminNavbar />

      <PageWrapper>
        <Content>
          <Card>
            <Header>
              <Title>Create Plan</Title>
              <BackButton onClick={() => navigate('/head-admin/plans')}>
                ← Back to Plans
              </BackButton>
            </Header>

            <Form onSubmit={handleSubmit}>
              <Field>
                <Label>Plan Name</Label>
                <Input
                  name="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                />
              </Field>

              <Field>
                <Label>Price (₹)</Label>
                <Input
                  name="price"
                  type="number"
                  required
                  value={form.price}
                  onChange={handleChange}
                />
              </Field>

              <Field>
                <Label>Limit</Label>
                <Input
                  name="limit"
                  type="number"
                  required
                  value={form.limit}
                  onChange={handleChange}
                />
              </Field>

              <Field>
                <Label>Validity</Label>
                <Input
                  name="validity"
                  placeholder="Unlimited / 12 months"
                  value={form.validity}
                  onChange={handleChange}
                />
              </Field>

              <Field>
                <Label>Plan Type</Label>
                <Select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                >
                  <option value="Standard">Standard</option>
                  <option value="Premium">Premium</option>
                </Select>
              </Field>

              <Actions>
                <CancelButton
                  type="button"
                  onClick={() => navigate('/head-admin/plans')}
                >
                  Cancel
                </CancelButton>
                <SaveButton type="submit">Create Plan</SaveButton>
              </Actions>
            </Form>
          </Card>
        </Content>
      </PageWrapper>
    </>
  );
}
