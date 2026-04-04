import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../utils/axiosConfig';
import HeadAdminNavbar from '../../components/Navbar/HeadAdminNavbar';
import styled from 'styled-components';

/* =========================
   STYLES
========================= */
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
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  color: #64748b;
  margin-bottom: 16px;
  font-size: 0.9rem;
`;

const ImageWrap = styled.div`
  margin-top: 16px;
  text-align: center;
`;

const Image = styled.img`
  max-width: 100%;
  max-height: 520px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
`;

const ButtonBar = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
`;

const Button = styled.button`
  padding: 10px 18px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;

  &:hover {
    background: #1d4ed8;
  }
`;

const Empty = styled.div`
  padding: 24px;
  text-align: center;
  color: #64748b;
`;

/* =========================
   COMPONENT
========================= */
export default function CustomerKycView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  /* =========================
     LOAD CUSTOMER
  ========================= */
  useEffect(() => {
    if (!id) {
      navigate('/headadmin/customers');
      return;
    }

    loadCustomer();
    // eslint-disable-next-line
  }, [id]);

  const loadCustomer = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/headadmin/customers');
      const found = res.data.customers?.find(
        (c) => c._id === id
      );

      if (!found) {
        alert('Customer not found');
        navigate('/headadmin/customers');
        return;
      }

      setCustomer(found);
    } catch (error) {
      console.error(error);
      alert('Failed to load customer KYC');
      navigate('/headadmin/customers');
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     RENDER
  ========================= */
  return (
    <HeadAdminNavbar>
      <Page>
        <Card>
          {loading ? (
            <Empty>Loading KYC...</Empty>
          ) : !customer?.kyc_details?.doc_image ? (
            <Empty>No KYC image uploaded</Empty>
          ) : (
            <>
              <Title>Customer KYC</Title>

              <Subtitle>
                {customer.user_name?.first_name}{' '}
                {customer.user_name?.last_name} —{' '}
                {customer.kyc_details?.doc_type || 'Document'}
              </Subtitle>

              <ImageWrap>
                <Image
                  src={`http://localhost:5000/uploads/kyccustomers/${customer.kyc_details.doc_image}`}
                  alt="Customer KYC"
                />
              </ImageWrap>

              <ButtonBar>
                <Button onClick={() => navigate(-1)}>
                  Back
                </Button>
              </ButtonBar>
            </>
          )}
        </Card>
      </Page>
    </HeadAdminNavbar>
  );
}
