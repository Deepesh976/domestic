import React, { useEffect, useState, useMemo } from 'react';
import styled from 'styled-components';
import QRCode from 'react-qr-code';
import QRCodeGenerator from 'qrcode';
import {
  getDevices,
  getOrganizations,
  createDevice,
} from '../../services/superAdminService';
import SuperAdminNavbar from '../../components/Navbar/SuperAdminNavbar';

/* ================= STYLES ================= */
const Page = styled.div`
  display: flex;
  flex-direction: column;
  gap: 28px;
  padding: 32px;
  background: #f8fafc;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const HeaderContent = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
`;

const Subtitle = styled.p`
  color: #64748b;
  margin: 0;
  font-size: 0.95rem;
`;

const Actions = styled.div`
  display: flex;
  gap: 12px;
`;

const AddButton = styled.button`
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  color: white;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

const SearchSection = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  align-items: center;
`;

const SearchBox = styled.input`
  padding: 11px 14px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background: white;
  width: 280px;
  font-size: 0.95rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  @media (max-width: 640px) {
    width: 100%;
  }
`;

const DataCard = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const CardHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
  background: #f8fafc;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  padding: 14px 16px;
  background: #f8fafc;
  text-align: left;
  font-size: 0.8rem;
  font-weight: 600;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  border-bottom: 1px solid #e5e7eb;
`;

const Tr = styled.tr`
  border-bottom: 1px solid #e5e7eb;

  &:hover {
    background: #f8fafc;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const Td = styled.td`
  padding: 14px 16px;
  font-size: 0.9rem;
  color: #334155;

  &:first-child {
    font-weight: 500;
    color: #1e293b;
  }
`;

const OrgBadge = styled.span`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  background: #e0e7ff;
  color: #3730a3;
  font-size: 0.85rem;
  font-weight: 500;
`;

const ViewButton = styled.button`
  background: none;
  border: none;
  color: #2563eb;
  cursor: pointer;
  font-weight: 600;
  padding: 0;
  transition: color 0.2s ease;

  &:hover {
    color: #1d4ed8;
    text-decoration: underline;
  }
`;

const Empty = styled.div`
  padding: 48px 24px;
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 12px;
`;

const EmptyText = styled.p`
  color: #64748b;
  margin: 0;
  font-size: 0.95rem;
`;

/* ================= MODAL STYLES ================= */
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.2s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const ModalContent = styled.div`
  background: white;
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 500px;
  animation: slideUp 0.3s ease;

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 640px) {
    padding: 24px;
  }
`;

const ModalHeader = styled.div`
  margin-bottom: 24px;
`;

const ModalTitle = styled.h2`
  margin: 0 0 4px 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
`;

const ModalSubtitle = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: #64748b;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FormLabel = styled.label`
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
`;

const FormInput = styled.input`
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  background: white;
  font-size: 0.95rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  &:disabled {
    background: #f1f5f9;
    cursor: not-allowed;
  }
`;

const FormSelect = styled.select`
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  background: white;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  &:disabled {
    background: #f1f5f9;
    cursor: not-allowed;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
  justify-content: flex-end;
`;

const Button = styled.button`
  padding: 10px 18px;
  border-radius: 6px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;

  ${(p) =>
    p.$primary
      ? `
    background: #2563eb;
    color: white;

    &:hover:not(:disabled) {
      background: #1d4ed8;
      box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
    }
  `
      : `
    background: #e2e8f0;
    color: #334155;

    &:hover:not(:disabled) {
      background: #cbd5e1;
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const QRModal = styled(ModalOverlay)``;

const QRModalContent = styled(ModalContent)`
  max-width: auto;
  padding: 20px;
`;

const ErrorMessage = styled.span`
  color: #dc2626;
  font-size: 0.85rem;
  margin-top: 4px;
`;

const SuccessMessage = styled.div`
  padding: 12px 16px;
  background: #dcfce7;
  border: 1px solid #86efac;
  border-radius: 6px;
  color: #166534;
  font-size: 0.9rem;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

/* ================= COMPONENT ================= */
const Devices = () => {
  const [devices, setDevices] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [search, setSearch] = useState('');
  const [orgSearch, setOrgSearch] = useState('');
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  /* Form State */
  const [form, setForm] = useState({
    organization: '',
    org_id: '',
    mac_id: '',
    serial_number: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [deviceRes, orgRes] = await Promise.all([
        getDevices(),
        getOrganizations(),
      ]);

      setDevices(deviceRes.data || []);
      setOrganizations(orgRes.data || []);
    } catch (err) {
      console.error(err);
      alert('Failed to load devices');
    } finally {
      setLoading(false);
    }
  };

  /* ================= ORG MAP ================= */
  const orgMap = useMemo(() => {
    const map = {};
    organizations.forEach((o) => {
      map[o.org_id] = o.org_name;
    });
    return map;
  }, [organizations]);

  /* ================= FILTER ================= */
  const filteredDevices = useMemo(() => {
    return devices.filter((d) => {
      const deviceText = `${d.mac_id || ''} ${d.serial_number || ''}`.toLowerCase();
      const orgText = `${d.org_id || ''} ${orgMap[d.org_id] || ''}`.toLowerCase();

      return (
        deviceText.includes(search.toLowerCase()) &&
        orgText.includes(orgSearch.toLowerCase())
      );
    });
  }, [devices, search, orgSearch, orgMap]);

  /* ================= FORM HANDLERS ================= */
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormErrors((prev) => ({ ...prev, [name]: '' }));

    if (name === 'organization') {
      const selectedOrg = organizations.find((o) => o._id === value);
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

    const mac = form.mac_id.trim().toUpperCase();
    const serial = form.serial_number.trim().toUpperCase();
    const errors = {};

    if (!form.org_id) errors.organization = 'Organization is required';
    if (!mac) errors.mac_id = 'MAC ID is required';
    if (!serial) errors.serial_number = 'Serial Number is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setFormLoading(true);

      await createDevice({
        org_id: form.org_id,
        mac_id: mac,
        serial_number: serial,
      });

      setSuccessMessage('✅ Device added successfully');
      setForm({ organization: '', org_id: '', mac_id: '', serial_number: '' });
      setFormErrors({});

      setTimeout(() => {
        setShowAddModal(false);
        setSuccessMessage(null);
      }, 1500);

      loadData();
    } catch (err) {
      console.error(err);
      const errorMsg =
        err?.response?.data?.message || 'Failed to add device';
      setFormErrors({ submit: errorMsg });
    } finally {
      setFormLoading(false);
    }
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setForm({ organization: '', org_id: '', mac_id: '', serial_number: '' });
    setFormErrors({});
  };

  const downloadQR = async (qrValue, serialNumber) => {
  try {
    const url = await QRCodeGenerator.toDataURL(qrValue);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${serialNumber}_QR.png`;
    link.click();
  } catch (err) {
    console.error('QR Download error:', err);
  }
};

  /* ================= UI ================= */
  return (
    <SuperAdminNavbar>
      <Page>
        <Header>
          <HeaderContent>
            <Title>Devices</Title>
            <Subtitle>
              Manage all devices across your organizations
            </Subtitle>
          </HeaderContent>
          <Actions>
            <AddButton onClick={() => setShowAddModal(true)}>
              + Add Device
            </AddButton>
          </Actions>
        </Header>

        <SearchSection>
          <SearchBox
            placeholder="🔍 Search by MAC or Serial..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <SearchBox
            placeholder="🏢 Search by Organization..."
            value={orgSearch}
            onChange={(e) => setOrgSearch(e.target.value)}
          />
        </SearchSection>

        <DataCard>
          <CardHeader>
            <CardTitle>
              {loading ? '...' : `${filteredDevices.length} Device${filteredDevices.length !== 1 ? 's' : ''}`}
            </CardTitle>
          </CardHeader>

          {loading ? (
            <Empty>
              <EmptyIcon>⏳</EmptyIcon>
              <EmptyText>Loading devices…</EmptyText>
            </Empty>
          ) : filteredDevices.length === 0 ? (
            <Empty>
              <EmptyIcon>📱</EmptyIcon>
              <EmptyText>
                {devices.length === 0
                  ? 'No devices found. Start by adding one!'
                  : 'No devices match your search.'}
              </EmptyText>
            </Empty>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>#</Th>
                  <Th>Organization</Th>
                  <Th>MAC ID</Th>
                  <Th>Serial Number</Th>
                  <Th>Org ID</Th>
                  <Th>QR Code</Th>
                  <Th>Download</Th>
                </tr>
              </thead>

              <tbody>
                {filteredDevices.map((d, index) => (
                  <Tr key={d._id}>
                    <Td>{index + 1}</Td>
                    <Td>
                      <OrgBadge>{orgMap[d.org_id] || '—'}</OrgBadge>
                    </Td>
                    <Td>
                      <code style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        {d.mac_id}
                      </code>
                    </Td>
                    <Td>
                      <code style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        {d.serial_number}
                      </code>
                    </Td>
                    <Td>{d.org_id}</Td>
                    <Td>
<ViewButton
  onClick={() =>
    setQrData(
      JSON.stringify({
        org_id: d.org_id,
        mac_id: d.mac_id,
        serial_number: d.serial_number,
      })
    )
  }
>
  View QR
</ViewButton>
                    </Td>
                    <Td>
<ViewButton
  onClick={() =>
    downloadQR(
      JSON.stringify({
        org_id: d.org_id,
        mac_id: d.mac_id,
        serial_number: d.serial_number,
      }),
      d.serial_number
    )
  }
>
  Download
</ViewButton>
</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          )}
        </DataCard>

        {/* ================= ADD DEVICE MODAL ================= */}
        {showAddModal && (
          <ModalOverlay onClick={closeAddModal}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <ModalTitle>Add New Device</ModalTitle>
                <ModalSubtitle>
                  Register a new device to your organization
                </ModalSubtitle>
              </ModalHeader>

              {successMessage && (
                <SuccessMessage>{successMessage}</SuccessMessage>
              )}

              <Form onSubmit={handleSubmit}>
                {formErrors.submit && (
                  <ErrorMessage style={{ display: 'block', marginBottom: 16 }}>
                    {formErrors.submit}
                  </ErrorMessage>
                )}

                <FormField>
                  <FormLabel>Organization *</FormLabel>
                  <FormSelect
                    name="organization"
                    value={form.organization}
                    onChange={handleFormChange}
                    disabled={formLoading}
                  >
                    <option value="">Select Organization</option>
                    {organizations.map((org) => (
                      <option key={org._id} value={org._id}>
                        {org.org_name}
                      </option>
                    ))}
                  </FormSelect>
                  {formErrors.organization && (
                    <ErrorMessage>{formErrors.organization}</ErrorMessage>
                  )}
                </FormField>

                <FormField>
                  <FormLabel>Organization ID</FormLabel>
                  <FormInput
                    type="text"
                    value={form.org_id}
                    disabled
                    placeholder="Auto-filled"
                  />
                </FormField>

                <FormField>
                  <FormLabel>MAC ID *</FormLabel>
                  <FormInput
                    type="text"
                    name="mac_id"
                    value={form.mac_id}
                    onChange={handleFormChange}
                    placeholder="AA:BB:CC:DD:EE:FF"
                    disabled={formLoading}
                  />
                  {formErrors.mac_id && (
                    <ErrorMessage>{formErrors.mac_id}</ErrorMessage>
                  )}
                </FormField>

                <FormField>
                  <FormLabel>Serial Number *</FormLabel>
                  <FormInput
                    type="text"
                    name="serial_number"
                    value={form.serial_number}
                    onChange={handleFormChange}
                    placeholder="SN-000123"
                    disabled={formLoading}
                  />
                  {formErrors.serial_number && (
                    <ErrorMessage>{formErrors.serial_number}</ErrorMessage>
                  )}
                </FormField>

                <ButtonGroup>
                  <Button
                    type="button"
                    onClick={closeAddModal}
                    disabled={formLoading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" $primary disabled={formLoading}>
                    {formLoading ? 'Saving...' : 'Add Device'}
                  </Button>
                </ButtonGroup>
              </Form>
            </ModalContent>
          </ModalOverlay>
        )}

        {/* ================= QR MODAL ================= */}
        {qrData && (
          <QRModal onClick={() => setQrData(null)}>
            <QRModalContent onClick={(e) => e.stopPropagation()}>
              <QRCode value={qrData} />
            </QRModalContent>
          </QRModal>
        )}
      </Page>
    </SuperAdminNavbar>
  );
};

export default Devices;
