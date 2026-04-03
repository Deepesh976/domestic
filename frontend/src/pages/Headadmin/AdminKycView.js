import React, { useEffect, useState } from 'react';
import axios from '../../utils/axiosConfig';
import { useParams, useNavigate } from 'react-router-dom';
import HeadAdminNavbar from '../../components/Navbar/HeadAdminNavbar';
import styled from 'styled-components';

/* =========================
   STYLES
========================= */
const Page = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
`;

const Title = styled.h2`
  font-weight: 700;
  margin-bottom: 20px;
`;

const Card = styled.div`
  background: white;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  padding: 20px;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Info = styled.div`
  font-size: 0.85rem;
  color: #0f172a;
`;

const Label = styled.div`
  font-size: 0.75rem;
  color: #64748b;
  margin-bottom: 4px;
`;

const Value = styled.div`
  font-weight: 600;
  margin-bottom: 12px;
`;

const ImageBox = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px;
  text-align: center;
`;

const KycImage = styled.img`
  max-width: 100%;
  max-height: 480px;
  border-radius: 8px;
`;

const Actions = styled.div`
  margin-top: 20px;
`;

const Button = styled.button`
  padding: 10px 18px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  color: white;
  background: #64748b;

  &:hover {
    opacity: 0.9;
  }
`;

/* =========================
   COMPONENT
========================= */
export default function AdminKycView() {
  const { adminId } = useParams();
  const navigate = useNavigate();

  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  /* =========================
     FETCH ADMIN
  ========================= */
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await axios.get('/api/headadmin/admins');
        const found = res.data.admins.find(
          (a) => a._id === adminId
        );

        if (!found) {
          alert('Admin not found');
          navigate('/headadmin/admins');
          return;
        }

        setAdmin(found);
      } catch (err) {
        console.error(err);
        alert('Failed to load KYC');
        navigate('/headadmin/admins');
      } finally {
        setLoading(false);
      }
    };

    fetchAdmin();
  }, [adminId, navigate]);

  if (loading) {
    return (
      <HeadAdminNavbar>
        <Page>Loading KYC...</Page>
      </HeadAdminNavbar>
    );
  }

  if (!admin?.kyc_details?.kyc_image) {
    return (
      <HeadAdminNavbar>
        <Page>No KYC image uploaded</Page>
      </HeadAdminNavbar>
    );
  }

  const imageUrl = `http://localhost:5000/uploads/kycadmins/${admin.kyc_details.kyc_image}`;

  return (
    <HeadAdminNavbar>
      <Page>
        <Title>Admin KYC Review</Title>

        <Card>
          <Row>
            {/* LEFT INFO */}
            <Info>
              <Label>Username</Label>
              <Value>{admin.username}</Value>

              <Label>Email</Label>
              <Value>{admin.email}</Value>

              <Label>Document Type</Label>
              <Value>
                {admin.kyc_details.doc_type || '—'}
              </Value>

              <Label>Document Detail</Label>
              <Value>
                {admin.kyc_details.doc_detail || '—'}
              </Value>
            </Info>

            {/* RIGHT IMAGE */}
            <ImageBox>
              <KycImage src={imageUrl} alt="KYC Document" />
            </ImageBox>
          </Row>

          <Actions>
            <Button
              onClick={() => navigate('/headadmin/admins')}
            >
              Back
            </Button>
          </Actions>
        </Card>
      </Page>
    </HeadAdminNavbar>
  );
}
