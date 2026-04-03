import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import HeadAdminNavbar from '../../components/Navbar/HeadAdminNavbar';
import styled from 'styled-components';
import { 
  MdArrowBack, 
  MdInsights, 
  MdOutlineConstruction, 
  MdEngineering
} from 'react-icons/md';

const PageContainer = styled.div`
  padding: 2rem;
  background-color: #f8fafc;
  min-height: calc(100vh - 64px);
  font-family: 'Inter', -apple-system, sans-serif;
  display: flex;
  flex-direction: column;
`;

const HeaderSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;

  .back-btn {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    border: 1px solid #e2e8f0;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #64748b;
    transition: all 0.2s;

    &:hover {
      background: #f1f5f9;
      color: #2563eb;
      border-color: #2563eb;
    }
  }

  h1 {
    font-size: 1.5rem;
    font-weight: 800;
    color: #1e293b;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    span {
      color: #64748b;
      font-weight: 500;
      font-family: 'JetBrains Mono', monospace;
    }
  }
`;

const PlaceholderCard = styled.div`
  background: white;
  border-radius: 1.5rem;
  border: 2px dashed #e2e8f0;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  color: #64748b;

  .icon-wrapper {
    width: 5rem;
    height: 5rem;
    border-radius: 1.25rem;
    background: #f1f5f9;
    color: #2563eb;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
    margin-bottom: 1.5rem;
  }

  h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 0.75rem;
  }

  p {
    max-width: 400px;
    font-size: 1rem;
    line-height: 1.6;
    margin-bottom: 2rem;
  }

  .badges {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .badge {
    padding: 0.5rem 1rem;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 999px;
    font-size: 0.875rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

export default function Analysis() {
  const { deviceId } = useParams();
  const navigate = useNavigate();

  return (
    <HeadAdminNavbar>
      <PageContainer>
        <HeaderSection>
          <button className="back-btn" onClick={() => navigate('/headadmin/purifiers')}>
            <MdArrowBack />
          </button>
          <h1>Analytics <span>#{deviceId}</span></h1>
        </HeaderSection>

        <PlaceholderCard>
          <div className="icon-wrapper">
            <MdInsights />
          </div>
          <h2>Advanced Analytics Dashboard</h2>
          <p>
            We are working on bringing you powerful insights into device health, 
            water quality trends, and consumption patterns.
          </p>
          
          <div className="badges">
            <div className="badge">
              <MdOutlineConstruction size={18} color="#f59e0b" />
              Under Development
            </div>
            <div className="badge">
              <MdEngineering size={18} color="#2563eb" />
              Real-time monitoring
            </div>
            <div className="badge">
              <MdInsights size={18} color="#10b981" />
              Trend Prediction
            </div>
          </div>
        </PlaceholderCard>
      </PageContainer>
    </HeadAdminNavbar>
  );
}
