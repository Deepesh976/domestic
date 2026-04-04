import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { getAdminById } from '../../services/superAdminService';
import SuperAdminNavbar from '../../components/Navbar/SuperAdminNavbar';

const Page = styled.div`
  max-width: 900px;
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
  font-weight: 700;
  margin-bottom: 16px;
`;

const Image = styled.img`
  max-width: 100%;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
`;

const Button = styled.button`
  margin-top: 20px;
  padding: 10px 16px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
`;

const AdminKycView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    loadAdmin();
    // eslint-disable-next-line
  }, []);

  const loadAdmin = async () => {
    try {
      const res = await getAdminById(id);
      setAdmin(res.data);
    } catch {
      alert('Failed to load KYC');
      navigate('/superadmin/admins');
    }
  };

  if (!admin) {
    return (
      <SuperAdminNavbar>
        <Page>
          <Card>Loading KYC...</Card>
        </Page>
      </SuperAdminNavbar>
    );
  }

  const kycImage = admin.kyc_details?.kyc_image;

  return (
    <SuperAdminNavbar>
      <Page>
        <Card>
          <Title>KYC Document</Title>

          {kycImage ? (
            <Image
src={`${
  process.env.REACT_APP_API_URL || 'http://localhost:5000'
}/uploads/kycadmins/${kycImage}`}
              alt="KYC"
            />
          ) : (
            <p>No KYC image uploaded</p>
          )}

          <Button onClick={() => navigate(-1)}>
            Back
          </Button>
        </Card>
      </Page>
    </SuperAdminNavbar>
  );
};

export default AdminKycView;
