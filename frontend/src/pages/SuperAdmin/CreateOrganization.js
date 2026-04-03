import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { createOrganization } from '../../services/superAdminService';
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
  color: #0f172a;
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
  background: #ffffff;

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12);
  }
`;

/* =========================
   LOGO UPLOAD
========================= */

const LogoPreview = styled.div`
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 12px;
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
   FOOTER ACTIONS
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
    p.$cancel
      ? 'none'
      : '0 12px 24px rgba(37, 99, 235, 0.35)'};

  &:hover:not(:disabled) {
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

/* =========================
   COMPONENT
========================= */

const CreateOrganization = () => {
  const navigate = useNavigate();

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
  const [loading, setLoading] = useState(false);

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
    setLoading(true);

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (logo) fd.append('logo', logo);

      await createOrganization(fd);
      navigate('/superadmin/organizations');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create organization');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SuperAdminNavbar>
      <Page>
        <Card>
          <Header>
            <Title>Create Organization</Title>
            <Subtitle>Register a new organization into the platform</Subtitle>
          </Header>

          <form onSubmit={handleSubmit}>
            {/* BUSINESS INFO */}
            <Section>
              <SectionTitle>Business Information</SectionTitle>
              <Grid>
                <Field>
                  <Label $required>Organization ID</Label>
                  <Input name="org_id" required onChange={handleChange} />
                </Field>

                <Field>
                  <Label $required>Organization Name</Label>
                  <Input name="org_name" required onChange={handleChange} />
                </Field>

                <Field>
                  <Label>Type</Label>
                  <Input name="type" onChange={handleChange} />
                </Field>

                <Field>
                  <Label>GST Number</Label>
                  <Input name="gst_number" onChange={handleChange} />
                </Field>
              </Grid>
            </Section>

            {/* CONTACT */}
            <Section>
              <SectionTitle>Contact Details</SectionTitle>
              <Grid>
                <Field>
                  <Label $required>Email</Label>
                  <Input type="email" name="email_id" required onChange={handleChange} />
                </Field>

                <Field>
                  <Label>Phone</Label>
                  <Input name="phone_number" onChange={handleChange} />
                </Field>
              </Grid>
            </Section>

            {/* LOCATION */}
            <Section>
              <SectionTitle>Location</SectionTitle>
              <Grid>
                <Field>
                  <Label>State</Label>
                  <Input name="state" onChange={handleChange} />
                </Field>

                <Field>
                  <Label>Pincode</Label>
                  <Input name="pincode" onChange={handleChange} />
                </Field>

                <Field>
                  <Label>Country</Label>
                  <Input name="country" value={form.country} onChange={handleChange} />
                </Field>
              </Grid>
            </Section>

            {/* LOGO */}
            <Section>
              <SectionTitle>Branding</SectionTitle>
              <Full>
                <Label>Organization Logo</Label>
                <Input type="file" accept="image/*" onChange={handleLogoChange} />
                {preview && (
                  <LogoPreview>
                    <LogoImage src={preview} />
                  </LogoPreview>
                )}
              </Full>
            </Section>

            <Footer>
              <Button $cancel type="button" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Organization'}
              </Button>
            </Footer>
          </form>
        </Card>
      </Page>
    </SuperAdminNavbar>
  );
};

export default CreateOrganization;
