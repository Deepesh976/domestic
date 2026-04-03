import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getAdminById,
  updateAdmin,
  getOrganizations,
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
  background: ${(p) => (p.$cancel ? '#64748b' : '#2563eb')};
`;

/* =========================
   COMPONENT
========================= */
const EditAdmin = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [organizations, setOrganizations] = useState([]);
  const [kycImage, setKycImage] = useState(null);

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
    kyc_approval_status: 'pending',
  });

  /* =========================
     LOAD DATA
  ========================= */
  useEffect(() => {
    if (!id) {
      alert('Invalid admin ID');
      navigate('/superadmin/admins');
      return;
    }

    loadData();
    // eslint-disable-next-line
  }, [id]);

  const loadData = async () => {
    try {
      const [adminRes, orgRes] = await Promise.all([
        getAdminById(id),
        getOrganizations(),
      ]);

      const admin = adminRes.data;
      const orgs = orgRes.data || [];

      setOrganizations(orgs);

      setForm({
        organization:
          admin.organization?._id || admin.organization || '',
        org_id: admin.org_id || '',
        role: admin.role || 'admin',

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
        kyc_approval_status:
          admin.kyc_details?.kyc_approval_status || 'pending',
      });

      setLoading(false);
    } catch (error) {
      console.error(error);
      alert('Failed to load admin');
      navigate('/superadmin/admins');
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

    try {
      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (value !== '') formData.append(key, value);
      });

      if (kycImage) {
        formData.append('kyc_image', kycImage);
      }

      await updateAdmin(id, formData);

      alert('Admin updated successfully');
      navigate('/superadmin/admins');
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          'Failed to update admin'
      );
    }
  };

  if (loading) {
    return (
      <SuperAdminNavbar>
        <Page>
          <Card>Loading admin details…</Card>
        </Page>
      </SuperAdminNavbar>
    );
  }

  return (
    <SuperAdminNavbar>
      <Page>
        <Card>
          <Title>Edit Admin / Head Admin</Title>

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

              {/* PASSWORD (OPTIONAL) */}
              <Field>
                <Label>New Password (optional)</Label>
                <Input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Leave blank to keep unchanged"
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
                <Label>KYC Approval Status</Label>
                <Select
                  name="kyc_approval_status"
                  value={form.kyc_approval_status}
                  onChange={handleChange}
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </Select>
              </Field>

              <Field>
                <Label>Replace KYC Image</Label>
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
              <Button type="submit">Update</Button>
            </ButtonBar>
          </form>
        </Card>
      </Page>
    </SuperAdminNavbar>
  );
};

export default EditAdmin;
