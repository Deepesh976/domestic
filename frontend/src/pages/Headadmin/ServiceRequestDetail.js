import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import HeadAdminNavbar from '../../components/Navbar/HeadAdminNavbar';
import { getServiceRequestById } from '../../services/headAdminService';
console.log("DETAIL PAGE LOADED");

export default function ServiceRequestDetail() {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleString();
  };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getServiceRequestById(id);
        setRequest(res.data);
      } catch (err) {
        setError('Failed to load service request');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <div style={{ padding: 40 }}>Loading...</div>;
  if (error) return <div style={{ padding: 40 }}>{error}</div>;
  if (!request) return <div style={{ padding: 40 }}>Request not found</div>;

  return (
    <HeadAdminNavbar>
      <div style={{ padding: 40, maxWidth: 1000, margin: '0 auto' }}>
        <h2 style={{ marginBottom: 20 }}>Service Request Details</h2>

        {/* =======================
            REQUEST INFORMATION
        ======================= */}
        <Section title="Request Information">
          <Row label="User" value={request.user_name || '—'} />
          <Row label="Device" value={request.device_id || '—'} />
          <Row
            label="Service Type"
            value={request.service_type || request.request_type || '—'}
          />
          <Row
            label="Status"
            value={<StatusBadge status={request.status} />}
          />
          <Row
            label="Description"
            value={request.service_description || '—'}
          />
        </Section>

        {/* =======================
            TIMELINE
        ======================= */}
        <Section title="Timeline">
          <Row label="Scheduled At" value={formatDate(request.scheduled_at)} />
          <Row label="Arrived At" value={formatDate(request.arrived_at)} />
          <Row label="Completed At" value={formatDate(request.completed_at)} />
<Row
  label="Created At"
  value={formatDate(request.createdAt || request.created_at)}
/>

<Row
  label="Last Updated"
  value={formatDate(request.updatedAt || request.updated_at)}
/>
        </Section>

        {/* =======================
            SERVICE OUTPUT
        ======================= */}
        <Section title="Service Output">
          <Row
            label="Replaced Parts"
            value={
              request.replaced_parts?.length
                ? request.replaced_parts.join(', ')
                : 'None'
            }
          />
        </Section>

        {/* =======================
            OBSERVATIONS
        ======================= */}
        <Section title="Observations">
          <Row
            label="Severity"
            value={<SeverityBadge severity={request.observations?.severity} />}
          />
          <Row
            label="Notes"
            value={request.observations?.notes || '—'}
          />
        </Section>

        {/* =======================
            LOCATION
        ======================= */}
        <Section title="Location">
          <Row label="Street" value={request.location?.street || '—'} />
          <Row label="Area" value={request.location?.area || '—'} />
          <Row label="City" value={request.location?.city || '—'} />
          <Row label="State" value={request.location?.state || '—'} />
          <Row label="Postal Code" value={request.location?.postal_code || '—'} />
          <Row label="Country" value={request.location?.country || '—'} />
        </Section>
      </div>
    </HeadAdminNavbar>
  );
}

/* =========================
   REUSABLE COMPONENTS
========================= */

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <h3 style={{ marginBottom: 10 }}>{title}</h3>
      <div
        style={{
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          padding: 20,
          background: '#fafafa',
        }}
      >
        {children}
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '8px 0',
        borderBottom: '1px solid #eee',
      }}
    >
      <strong>{label}</strong>
      <span>{value}</span>
    </div>
  );
}

function StatusBadge({ status }) {
  const color = status === 'closed' ? '#16a34a' : '#2563eb';

  return (
    <span
      style={{
        padding: '4px 10px',
        borderRadius: 20,
        background: `${color}20`,
        color,
        fontWeight: 600,
        textTransform: 'capitalize',
      }}
    >
      {status}
    </span>
  );
}

function SeverityBadge({ severity }) {
  if (!severity) return '—';

  const colors = {
    low: '#16a34a',
    medium: '#f59e0b',
    major: '#f97316',
    critical: '#dc2626',
  };

  const color = colors[severity] || '#6b7280';

  return (
    <span
      style={{
        padding: '4px 10px',
        borderRadius: 20,
        background: `${color}20`,
        color,
        fontWeight: 600,
        textTransform: 'capitalize',
      }}
    >
      {severity}
    </span>
  );
}