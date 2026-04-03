import React, { useState } from 'react';
import axios from '../../utils/axiosConfig';
import { useNavigate } from 'react-router-dom';
import HeadAdminNavbar from '../../components/Navbar/HeadAdminNavbar';
import styled from 'styled-components';

/* =========================
   STYLES
========================= */
const Page = styled.div`
  max-width: 720px;
  margin: 0 auto;
  padding: 24px;
`;

const Title = styled.h2`
  font-weight: 700;
  margin-bottom: 20px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 6px;
`;

const Input = styled.input`
  padding: 9px;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
`;

const Select = styled.select`
  padding: 9px;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
`;

const Button = styled.button`
  margin-top: 20px;
  padding: 12px;
  width: 100%;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;

  &:hover {
    background: #1d4ed8;
  }

  &:disabled {
    background: #94a3b8;
    cursor: not-allowed;
  }
`;

const Divider = styled.hr`
  margin: 24px 0;
  border: none;
  border-top: 1px solid #e5e7eb;
`;

/* =========================
   COMPONENT
========================= */
export default function CreateAdmin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

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

  const [kycImage, setKycImage] = useState(null);

  /* =========================
     HANDLERS
  ========================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.username || !form.email || !form.password) {
      alert('Username, Email and Password are required');
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      // 🔹 BASIC + ADDRESS FIELDS
      Object.entries(form).forEach(([key, value]) => {
        if (value) {
          formData.append(key, value);
        }
      });

      // 🔹 KYC IMAGE
      if (kycImage) {
        formData.append('kyc_image', kycImage);
      }

      await axios.post('/api/headadmin/admins', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Admin created successfully');
      navigate('/headadmin/admins');
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.message ||
          'Failed to create admin'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <HeadAdminNavbar>
      <Page>
        <Title>Create Admin</Title>

        <form onSubmit={handleSubmit}>
          {/* ================= BASIC INFO ================= */}
          <Grid>
            <Field>
              <Label>Username *</Label>
              <Input
                name="username"
                value={form.username}
                onChange={handleChange}
                required
              />
            </Field>

            <Field>
              <Label>Email *</Label>
              <Input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </Field>

            <Field>
              <Label>Password *</Label>
              <Input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </Field>

            <Field>
              <Label>Phone Number</Label>
              <Input
                name="phone_number"
                value={form.phone_number}
                onChange={handleChange}
              />
            </Field>
          </Grid>

          <Divider />

          {/* ================= ADDRESS ================= */}
          <Grid>
            <Field>
              <Label>Flat No</Label>
              <Input
                name="flat_no"
                value={form.flat_no}
                onChange={handleChange}
              />
            </Field>

            <Field>
              <Label>Area</Label>
              <Input
                name="area"
                value={form.area}
                onChange={handleChange}
              />
            </Field>

            <Field>
              <Label>City</Label>
              <Input
                name="city"
                value={form.city}
                onChange={handleChange}
              />
            </Field>

            <Field>
              <Label>State</Label>
              <Input
                name="state"
                value={form.state}
                onChange={handleChange}
              />
            </Field>

            <Field>
              <Label>Country</Label>
              <Input
                name="country"
                value={form.country}
                onChange={handleChange}
              />
            </Field>

            <Field>
              <Label>Postal Code</Label>
              <Input
                name="postal_code"
                value={form.postal_code}
                onChange={handleChange}
              />
            </Field>
          </Grid>

          <Divider />

          {/* ================= KYC ================= */}
          <Grid>
            <Field>
              <Label>KYC Document Type</Label>
              <Select
                name="doc_type"
                value={form.doc_type}
                onChange={handleChange}
              >
                <option value="">Select</option>
                <option value="Aadhaar">Aadhaar</option>
                <option value="PAN">PAN</option>
                <option value="Passport">Passport</option>
              </Select>
            </Field>

            <Field>
              <Label>Document Detail</Label>
              <Input
                name="doc_detail"
                value={form.doc_detail}
                onChange={handleChange}
              />
            </Field>

            <Field>
              <Label>KYC Image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setKycImage(e.target.files[0])
                }
              />
            </Field>
          </Grid>

          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Admin'}
          </Button>
        </form>
      </Page>
    </HeadAdminNavbar>
  );
}
