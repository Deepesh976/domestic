import React from 'react';
import styled from 'styled-components';

/* =========================
   STYLES
========================= */
const Wrapper = styled.div`
  background: white;
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  min-width: 1100px;
  border-collapse: collapse;
`;

const Th = styled.th`
  padding: 14px 16px;
  background: #f8fafc;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  border-bottom: 1px solid #e5e7eb;
`;

const Td = styled.td`
  padding: 14px 16px;
  border-bottom: 1px solid #e5e7eb;
  font-size: 14px;
  color: #0f172a;
  white-space: nowrap;
`;

const Badge = styled.span`
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  background: ${({ action }) =>
    action === 'deleted' ? '#fee2e2' : '#fef3c7'};
  color: ${({ action }) =>
    action === 'deleted' ? '#b91c1c' : '#92400e'};
`;

const PlanId = styled.code`
  font-size: 12px;
  background: #f1f5f9;
  padding: 4px 8px;
  border-radius: 6px;
  color: #334155;
`;

const EmptyState = styled.div`
  padding: 60px;
  text-align: center;
  color: #64748b;
  font-size: 15px;
`;

/* =========================
   HELPERS
========================= */
const formatDateTime = (date) =>
  new Date(date).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

/* =========================
   COMPONENT
========================= */
export default function ArchivedPlan({ plans }) {
  if (!plans || plans.length === 0) {
    return <EmptyState>No archived plans found</EmptyState>;
  }

  return (
    <Wrapper>
      <Table>
        <thead>
          <tr>
            <Th>S.No</Th>
            <Th>Name</Th>
            <Th>Price</Th>
            <Th>Limit</Th>
            <Th>Validity</Th>
            <Th>Type</Th>
            <Th>Action</Th>
            <Th>Modified At</Th>
            <Th>Plan ID</Th>
          </tr>
        </thead>

        <tbody>
          {plans.map((plan, index) => (
            <tr key={plan._id}>
              <Td>{index + 1}</Td>
              <Td>{plan.name}</Td>
              <Td>₹ {plan.price}</Td>
              <Td>{plan.limit}</Td>
              <Td>{plan.validity || 'Unlimited'}</Td>
              <Td>{plan.type}</Td>
              <Td>
                <Badge action={plan.action}>
                  {plan.action === 'deleted' ? 'Deleted' : 'Edited'}
                </Badge>
              </Td>
              <Td>{formatDateTime(plan.modified_at)}</Td>
              <Td>
                <PlanId>{plan.plan_id}</PlanId>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Wrapper>
  );
}
