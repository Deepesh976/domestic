import React, { useEffect, useState } from 'react';
import axios from '../../utils/axiosConfig';
import { useNavigate, useParams } from 'react-router-dom';
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
  background: #16a34a;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;

  &:hover {
    background: #15803d;
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
export default function EditAdmin() {
  const { adminId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

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
     FETCH ADMIN
  ========================= */
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await axios.get('/api/headadmin/admins');
        const admin = res.data.admins.find(
          (a) => a._id === adminId
        );

        if (!admin) {
          alert('Admin not found');
          navigate('/headadmin/admins');
          return;
        }

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
      } catch (error) {
        console.error(error);
        alert('Failed to load admin');
        navigate('/headadmin/admins');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchAdmin();
  }, [adminId, navigate]);

  /* =========================
     HANDLERS
  ========================= */
  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const fd = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (value) fd.append(key, value);
      });

      if (kycImage) {
        fd.append('kyc_image', kycImage);
      }

      await axios.put(
        `/api/headadmin/admins/${adminId}`,
        fd,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      alert('Admin updated successfully');
      navigate('/headadmin/admins');
    } catch (err) {
      alert(
        err.response?.data?.message ||
          'Failed to update admin'
      );
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <HeadAdminNavbar>
        <Page>Loading admin details...</Page>
      </HeadAdminNavbar>
    );
  }

  return (
    <HeadAdminNavbar>
      <Page>
        <Title>Edit Admin</Title>

        <form onSubmit={handleSubmit}>
          {/* ================= BASIC ================= */}
          <Grid>
            <Field>
              <Label>Username</Label>
              <Input
                name="username"
                value={form.username}
                onChange={handleChange}
                required
              />
            </Field>

            <Field>
              <Label>Email</Label>
              <Input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </Field>

            <Field>
              <Label>New Password (optional)</Label>
              <Input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
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
                <option value="aadhaar">Aadhaar</option>
                <option value="pan">PAN</option>
                <option value="passport">Passport</option>
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
              <Label>Re-upload KYC Image</Label>
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
            {loading ? 'Updating...' : 'Update Admin'}
          </Button>
        </form>
      </Page>
    </HeadAdminNavbar>
  );
}
