import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import {
  getOrganizations,
  createAdmin,
} from '../../services/superAdminService';
import SuperAdminNavbar from '../../components/Navbar/SuperAdminNavbar';

/* =========================
   STYLES
========================= */
const Page = styled.div`
  max-width: 1000px;
  margin: auto;
  padding: 24px;
`;

const Card = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
`;

const Title = styled.h2`
  margin-bottom: 20px;
  font-weight: 700;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 6px;
`;

const Input = styled.input`
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  background: ${(p) => (p.disabled ? '#f8fafc' : 'white')};
`;

const Select = styled.select`
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
`;

const ButtonBar = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 24px;
`;

const Button = styled.button`
  padding: 10px 18px;
  border-radius: 6px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  color: white;
  background: ${(p) => (p.$cancel ? '#64748b' : '#059669')};
`;

/* =========================
   COMPONENT
========================= */
const CreateAdmin = () => {
  const navigate = useNavigate();

  const [organizations, setOrganizations] = useState([]);

  const [form, setForm] = useState({
    organization: '',
    org_id: '',
    role: 'admin',

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
     LOAD ORGANIZATIONS
  ========================= */
  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      const res = await getOrganizations();
      setOrganizations(res.data || []);
    } catch {
      alert('Failed to load organizations');
    }
  };

  /* =========================
     HANDLERS
  ========================= */
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'organization') {
      const selectedOrg = organizations.find(
        (org) => org._id === value
      );

      setForm((prev) => ({
        ...prev,
        organization: value,
        org_id: selectedOrg?.org_id || '',
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.organization || !form.email || !form.password) {
      alert('Please fill required fields');
      return;
    }

    try {
      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });

      if (kycImage) {
        formData.append('kyc_image', kycImage);
      }

      await createAdmin(formData);

      alert('Admin created successfully');
      navigate('/superadmin/admins');
    } catch (err) {
      alert(
        err?.response?.data?.message || 'Failed to create admin'
      );
    }
  };

  return (
    <SuperAdminNavbar>
      <Page>
        <Card>
          <Title>Create Admin / Head Admin</Title>

          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <Grid>
              {/* ORGANIZATION */}
              <Field>
                <Label>Organization</Label>
                <Select
                  name="organization"
                  value={form.organization}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Organization</option>
                  {organizations.map((org) => (
                    <option key={org._id} value={org._id}>
                      {org.org_name}
                    </option>
                  ))}
                </Select>
              </Field>

              {/* ORG ID */}
              <Field>
                <Label>Organization ID</Label>
                <Input value={form.org_id} disabled />
              </Field>

              {/* ROLE */}
              <Field>
                <Label>Role</Label>
                <Select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                >
                  <option value="admin">Admin</option>
                  <option value="headadmin">Head Admin</option>
                </Select>
              </Field>

              {/* USERNAME */}
              <Field>
                <Label>Username</Label>
                <Input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  required
                />
              </Field>

              {/* EMAIL */}
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

              {/* PASSWORD */}
              <Field>
                <Label>Password</Label>
                <Input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </Field>

              {/* PHONE */}
              <Field>
                <Label>Phone Number</Label>
                <Input
                  name="phone_number"
                  value={form.phone_number}
                  onChange={handleChange}
                />
              </Field>

              {/* ADDRESS */}
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

              {/* KYC */}
              <Field>
                <Label>KYC Document Type</Label>
                <Input
                  name="doc_type"
                  value={form.doc_type}
                  onChange={handleChange}
                  placeholder="Aadhar / PAN / Passport"
                />
              </Field>

              <Field>
                <Label>KYC Document Detail</Label>
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

            <ButtonBar>
              <Button
                type="button"
                $cancel
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button type="submit">Create</Button>
            </ButtonBar>
          </form>
        </Card>
      </Page>
    </SuperAdminNavbar>
  );
};

export default CreateAdmin;
