import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getOrganizationById,
  updateOrganization,
} from '../../services/superAdminService';
import SuperAdminNavbar from '../../components/Navbar/SuperAdminNavbar';

/* =========================
   PAGE LAYOUT
========================= */

const Page = styled.div`
  background: #f8fafc;
  min-height: calc(100vh - 64px);
  padding: 40px 24px;
`;

const Card = styled.div`
  max-width: 980px;
  margin: auto;
  background: #ffffff;
  border-radius: 16px;
  padding: 40px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.06);

  @media (max-width: 768px) {
    padding: 24px;
  }
`;

/* =========================
   HEADER
========================= */

const Header = styled.div`
  margin-bottom: 36px;
`;

const Title = styled.h1`
  font-size: 30px;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
`;

const Subtitle = styled.p`
  margin-top: 6px;
  color: #64748b;
  font-size: 14px;
`;

/* =========================
   SECTION
========================= */

const Section = styled.div`
  margin-bottom: 36px;
`;

const SectionTitle = styled.h3`
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
`;

/* =========================
   FORM GRID
========================= */

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Full = styled(Field)`
  grid-column: 1 / -1;
`;

const Label = styled.label`
  font-size: 12px;
  font-weight: 700;
  color: ${(p) => (p.$muted ? '#64748b' : '#0f172a')};
  text-transform: uppercase;

  ${(p) =>
    p.$required &&
    `
    &::after {
      content: ' *';
      color: #ef4444;
    }
  `}
`;

const Input = styled.input`
  padding: 12px 14px;
  border-radius: 10px;
  border: 2px solid #e5e7eb;
  font-size: 14px;
  transition: 0.25s ease;
  background: ${(p) => (p.disabled ? '#f8fafc' : '#ffffff')};
  color: ${(p) => (p.disabled ? '#64748b' : '#0f172a')};

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12);
  }
`;

/* =========================
   LOGO
========================= */

const LogoWrap = styled.div`
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 14px;
`;

const LogoImage = styled.img`
  height: 72px;
  width: 72px;
  object-fit: contain;
  border-radius: 10px;
  border: 2px solid #e5e7eb;
  padding: 6px;
  background: #f8fafc;
`;

/* =========================
   FOOTER
========================= */

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 28px;
  border-top: 1px solid #e5e7eb;

  @media (max-width: 768px) {
    flex-direction: column-reverse;
  }
`;

const Button = styled.button`
  padding: 12px 22px;
  border-radius: 10px;
  border: none;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.25s ease;
  text-transform: uppercase;

  background: ${(p) =>
    p.$cancel
      ? '#f1f5f9'
      : 'linear-gradient(135deg, #2563eb, #3b82f6)'};

  color: ${(p) => (p.$cancel ? '#475569' : '#ffffff')};

  box-shadow: ${(p) =>
    p.$cancel ? 'none' : '0 12px 24px rgba(37, 99, 235, 0.35)'};

  &:hover:not(:disabled) {
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Loading = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #64748b;
`;

/* =========================
   COMPONENT
========================= */

const EditOrganization = () => {
  const navigate = useNavigate();
  const { organizationId } = useParams();
  const API_BASE = process.env.REACT_APP_API_URL || '';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    org_id: '',
    org_name: '',
    type: '',
    gst_number: '',
    email_id: '',
    phone_number: '',
    state: '',
    pincode: '',
    country: 'India',
  });

  const [logo, setLogo] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    fetchOrg();
    // eslint-disable-next-line
  }, []);

  const fetchOrg = async () => {
    try {
      const res = await getOrganizationById(organizationId);
      const o = res.data;

      setForm({
        org_id: o.org_id || '',
        org_name: o.org_name || '',
        type: o.type || '',
        gst_number: o.gst_number || '',
        email_id: o.email_id || '',
        phone_number: o.phone_number || '',
        state: o.state || '',
        pincode: o.pincode || '',
        country: o.country || 'India',
      });

      if (o.logo) {
        setPreview(`${API_BASE}/uploads/organizations/${o.logo}`);
      }
    } catch {
      alert('Failed to load organization');
      navigate('/superadmin/organizations');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogo(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k !== 'org_id') fd.append(k, v);
      });
      if (logo) fd.append('logo', logo);

      await updateOrganization(organizationId, fd);
      navigate('/superadmin/organizations');
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SuperAdminNavbar>
        <Page>
          <Card>
            <Loading>⏳ Loading organization details…</Loading>
          </Card>
        </Page>
      </SuperAdminNavbar>
    );
  }

  return (
    <SuperAdminNavbar>
      <Page>
        <Card>
          <Header>
            <Title>Edit Organization</Title>
            <Subtitle>Update organization details and branding</Subtitle>
          </Header>

          <form onSubmit={handleSubmit}>
            <Section>
              <SectionTitle>Business Information</SectionTitle>
              <Grid>
                <Field>
                  <Label $muted>Organization ID</Label>
                  <Input value={form.org_id} disabled />
                </Field>

                <Field>
                  <Label $required>Organization Name</Label>
                  <Input
                    name="org_name"
                    value={form.org_name}
                    onChange={handleChange}
                    required
                  />
                </Field>

                <Field>
                  <Label>Type</Label>
                  <Input name="type" value={form.type} onChange={handleChange} />
                </Field>

                <Field>
                  <Label>GST Number</Label>
                  <Input
                    name="gst_number"
                    value={form.gst_number}
                    onChange={handleChange}
                  />
                </Field>
              </Grid>
            </Section>

            <Section>
              <SectionTitle>Contact Details</SectionTitle>
              <Grid>
                <Field>
                  <Label $required>Email</Label>
                  <Input
                    type="email"
                    name="email_id"
                    value={form.email_id}
                    onChange={handleChange}
                    required
                  />
                </Field>

                <Field>
                  <Label>Phone</Label>
                  <Input
                    name="phone_number"
                    value={form.phone_number}
                    onChange={handleChange}
                  />
                </Field>
              </Grid>
            </Section>

            <Section>
              <SectionTitle>Location</SectionTitle>
              <Grid>
                <Field>
                  <Label>State</Label>
                  <Input name="state" value={form.state} onChange={handleChange} />
                </Field>

                <Field>
                  <Label>Pincode</Label>
                  <Input
                    name="pincode"
                    value={form.pincode}
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
              </Grid>
            </Section>

            <Section>
              <SectionTitle>Branding</SectionTitle>
              <Full>
                <Label>Organization Logo</Label>
                <Input type="file" accept="image/*" onChange={handleLogoChange} />
                {preview && (
                  <LogoWrap>
                    <LogoImage src={preview} alt="Logo" />
                  </LogoWrap>
                )}
              </Full>
            </Section>

            <Footer>
              <Button $cancel type="button" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Updating…' : 'Update Organization'}
              </Button>
            </Footer>
          </form>
        </Card>
      </Page>
    </SuperAdminNavbar>
  );
};

export default EditOrganization;
