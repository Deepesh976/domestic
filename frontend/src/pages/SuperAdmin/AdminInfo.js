import React, { useEffect, useState, useMemo } from 'react';
import styled from 'styled-components';
import { FiX, FiChevronDown } from 'react-icons/fi';
import {
  getAdmins,
  deleteAdmin,
  getOrganizations,
  createAdmin,
  updateAdmin,
  getAdminById,
} from '../../services/superAdminService';
import SuperAdminNavbar from '../../components/Navbar/SuperAdminNavbar';

/* =========================
   STYLES
========================= */
const Page = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e2e8f0;
`;

const Title = styled.h2`
  font-weight: 800;
  color: #1a202c;
  font-size: 28px;
  letter-spacing: -0.5px;
  margin: 0;
`;

const Actions = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const Button = styled.button`
  padding: 10px 18px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  color: white;
  font-size: 13px;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  background: ${(p) =>
    p.variant === 'edit'
      ? 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)'
      : p.variant === 'delete'
      ? 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)'
      : 'linear-gradient(135deg, #059669 0%, #10b981 100%)'};
  box-shadow: 0 4px 12px ${(p) =>
    p.variant === 'edit'
      ? 'rgba(59, 130, 246, 0.3)'
      : p.variant === 'delete'
      ? 'rgba(239, 68, 68, 0.3)'
      : 'rgba(5, 150, 105, 0.3)'};

  &:hover:not(:disabled) {
    box-shadow: 0 6px 20px ${(p) =>
      p.variant === 'edit'
        ? 'rgba(59, 130, 246, 0.4)'
        : p.variant === 'delete'
        ? 'rgba(239, 68, 68, 0.4)'
        : 'rgba(5, 150, 105, 0.4)'};
    transform: translateY(-2px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  opacity: ${(p) => (p.disabled ? 0.5 : 1)};
  pointer-events: ${(p) => (p.disabled ? 'none' : 'auto')};
`;

const SearchRow = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
`;

const SearchBox = styled.input`
  padding: 11px 16px;
  border-radius: 8px;
  border: 2px solid #e2e8f0;
  width: 320px;
  font-size: 13px;
  font-weight: 500;
  color: #1a202c;
  transition: all 0.3s ease;
  background: white;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='m21 21-4.35-4.35'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 40px;
  background-size: 18px;

  &:hover {
    border-color: #cbd5e1;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &::placeholder {
    color: #94a3b8;
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: auto;
`;

const Th = styled.th`
  text-align: center;
  padding: 14px 16px;
  background: linear-gradient(90deg, #f8fafc 0%, #f1f5f9 100%);
  font-size: 12px;
  font-weight: 700;
  color: #475569;
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  border-bottom: 2px solid #e2e8f0;
`;

const Td = styled.td`
  padding: 14px 16px;
  border-top: 1px solid #e2e8f0;
  font-size: 13px;
  color: #1a202c;
  text-align: center;
  vertical-align: middle;

  img {
    display: block;
    margin: 0 auto;
  }

  input[type='checkbox'] {
    margin: 0 auto;
    display: block;
  }
`;

const Tr = styled.tr`
  transition: all 0.2s ease;

  &:hover {
    background: #f8fafc;
  }

  &:last-child td {
    border-bottom: 1px solid #e2e8f0;
  }
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #3b82f6;
`;

const RoleBadge = styled.span`
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
  display: inline-block;
  background: ${(p) =>
    p.role === 'headadmin' ? '#fee2e2' : '#e0f2fe'};
  color: ${(p) =>
    p.role === 'headadmin' ? '#991b1b' : '#075985'};
  border: 1px solid ${(p) =>
    p.role === 'headadmin' ? '#fecaca' : '#bae6fd'};
`;

const KycLink = styled.span`
  color: #2563eb;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s ease;

  &:hover {
    color: #1d4ed8;
    background: #eff6ff;
    text-decoration: underline;
  }
`;

const EmptyState = styled.td`
  text-align: center;
  padding: 40px 20px !important;
  color: #94a3b8;
  font-size: 14px;
  font-style: italic;
`;

/* MODAL STYLES */
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.25s ease-out;
  padding: 20px;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 16px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15), 0 0 1px rgba(0, 0, 0, 0.1);
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  padding: 32px 32px 24px 32px;
  border-bottom: 1px solid #e2e8f0;
`;

const ModalTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 6px 0;
  letter-spacing: -0.3px;
`;

const ModalSubtitle = styled.p`
  font-size: 13px;
  color: #64748b;
  margin: 0;
  font-weight: 500;
`;

const ModalCloseBtn = styled.button`
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 8px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  flex-shrink: 0;

  &:hover {
    color: #1a202c;
    background: #f1f5f9;
    transform: rotate(90deg);
  }
`;

const ModalError = styled.div`
  margin: 0;
  padding: 12px 32px;
  background: #fef2f2;
  border-left: 4px solid #ef4444;
  display: flex;
  gap: 12px;
  align-items: center;
  color: #991b1b;
  font-size: 13px;
  font-weight: 500;

  span:first-child {
    font-size: 16px;
  }
`;

const ModalForm = styled.form`
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FormSectionTitle = styled.h3`
  font-size: 13px;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #e2e8f0;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;

  &.full {
    grid-template-columns: 1fr;
  }
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FormLabel = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: #1a202c;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const Required = styled.span`
  color: #ef4444;
  font-weight: 700;
`;

const FormInput = styled.input`
  padding: 11px 14px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 13px;
  font-family: inherit;
  color: #1a202c;
  transition: all 0.25s ease;
  background: white;
  font-weight: 500;

  &::placeholder {
    color: #cbd5e1;
    font-weight: 400;
  }

  &:hover {
    border-color: #cbd5e1;
    background: #f9fafb;
  }

  &:focus {
    outline: none;
    border-color: #3b82f6;
    background: white;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.08);
  }

  &:disabled {
    background: #f9fafb;
    color: #94a3b8;
    cursor: not-allowed;
    border-color: #e2e8f0;
  }
`;

const FormSelect = styled.select`
  padding: 11px 14px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 13px;
  font-family: inherit;
  color: #1a202c;
  transition: all 0.25s ease;
  background: white;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    border-color: #cbd5e1;
    background: #f9fafb;
  }

  &:focus {
    outline: none;
    border-color: #3b82f6;
    background: white;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.08);
  }

  &:disabled {
    background: #f9fafb;
    color: #94a3b8;
    cursor: not-allowed;
    border-color: #e2e8f0;
  }

  option {
    color: #1a202c;
    background: white;
  }
`;

const OrgDropdownContainer = styled.div`
  position: relative;
`;

const OrgDropdownInput = styled(FormInput)`
  padding-right: 40px;
`;

const OrgDropdownList = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: white;
  border: 2px solid #3b82f6;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  max-height: 300px;
  overflow-y: auto;
  z-index: 10;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }
`;

const OrgDropdownItem = styled.div`
  padding: 12px 14px;
  cursor: pointer;
  border-bottom: 1px solid #e2e8f0;
  transition: all 0.2s ease;
  font-size: 13px;

  &:hover {
    background: #eff6ff;
    color: #3b82f6;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const OrgDropdownEmpty = styled(OrgDropdownItem)`
  cursor: default;
  text-align: center;
  color: #94a3b8;
  font-style: italic;
`;

const ModalFooter = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 20px 32px;
  border-top: 1px solid #e2e8f0;
  background: #f9fafb;
`;

const BtnCancel = styled.button`
  padding: 11px 24px;
  border-radius: 10px;
  border: 2px solid #e2e8f0;
  background: white;
  color: #475569;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.25s ease;
  text-transform: uppercase;
  letter-spacing: 0.3px;

  &:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const BtnSubmit = styled.button`
  padding: 11px 24px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  color: white;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.25s ease;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.25);

  &:hover:not(:disabled) {
    box-shadow: 0 6px 20px rgba(5, 150, 105, 0.35);
    transform: translateY(-2px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

/* KYC VIEWER MODAL STYLES */
const KycViewerOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.25s ease-out;
  padding: 20px;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const KycViewerContainer = styled.div`
  background: white;
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const KycViewerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 20px 24px;
  border-bottom: 1px solid #e2e8f0;
`;

const KycViewerTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
`;

const KycViewerCloseBtn = styled.button`
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 8px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;

  &:hover {
    color: #1a202c;
    background: #f1f5f9;
    transform: rotate(90deg);
  }
`;

const KycViewerContent = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const KycImage = styled.img`
  width: 100%;
  max-width: 100%;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
`;

const KycInfoBox = styled.div`
  background: #f9fafb;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const KycInfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
`;

const KycInfoLabel = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.3px;
`;

const KycInfoValue = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #1a202c;
`;

/* =========================
   COMPONENT
========================= */
const AdminInfo = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const [orgSearch, setOrgSearch] = useState('');
  const [adminSearch, setAdminSearch] = useState('');

  /* MODAL STATE */
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);
  const [orgDropdownSearch, setOrgDropdownSearch] = useState('');

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
  });

  const [kycImage, setKycImage] = useState(null);
  const [kycImagePreview, setKycImagePreview] = useState(null);

  /* KYC VIEWER STATE */
  const [kycViewerOpen, setKycViewerOpen] = useState(false);
  const [kycViewerData, setKycViewerData] = useState(null);

  /* =========================
     LOAD DATA
  ========================= */
  useEffect(() => {
    fetchAdmins();
    fetchOrganizations();
  }, []);

  const fetchAdmins = async () => {
    try {
      const res = await getAdmins();
      setAdmins(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load admins:', err);
      setAdmins([]);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const res = await getOrganizations();
      setOrganizations(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load organizations:', err);
      setOrganizations([]);
    }
  };

  /* =========================
     FILTERING
  ========================= */
  const filteredAdmins = useMemo(() => {
    return admins.filter((admin) => {
      const orgText = `
        ${admin.organization?.org_name || ''}
        ${admin.org_id || ''}
      `.toLowerCase();

      const adminText = `
        ${admin.username || ''}
        ${admin.email || ''}
        ${admin.phone_number || ''}
        ${admin.role || ''}
      `.toLowerCase();

      return (
        orgText.includes(orgSearch.toLowerCase()) &&
        adminText.includes(adminSearch.toLowerCase())
      );
    });
  }, [admins, orgSearch, adminSearch]);

  const filteredOrganizations = useMemo(() => {
    return organizations.filter((org) =>
      org.org_name.toLowerCase().includes(orgDropdownSearch.toLowerCase())
    );
  }, [organizations, orgDropdownSearch]);

  /* =========================
     MODAL HANDLERS
  ========================= */
  const openCreateModal = () => {
    setModalMode('create');
    setForm({
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
    });
    setKycImage(null);
    setKycImagePreview(null);
    setOrgDropdownSearch('');
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = async () => {
    if (!selectedId) return;

    try {
      const res = await getAdminById(selectedId);
      const admin = res.data;

      setModalMode('edit');
      setForm({
        organization: admin.organization?._id || '',
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
      });

      setKycImage(null);
      setKycImagePreview(
        admin.kyc_details?.kyc_image
          ? `${process.env.REACT_APP_API_URL || ''}/uploads/kyc/${admin.kyc_details.kyc_image}`
          : null
      );

      setOrgDropdownSearch('');
      setFormError('');
      setModalOpen(true);
    } catch (err) {
      alert('Failed to load admin details');
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setFormError('');
    setOrgDropdownOpen(false);
  };

  const openKycViewer = (admin) => {
    setKycViewerData(admin);
    setKycViewerOpen(true);
  };

  const closeKycViewer = () => {
    setKycViewerOpen(false);
    setKycViewerData(null);
  };

  /* =========================
     FORM HANDLERS
  ========================= */
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFormError('');
  };

  const handleOrgSelect = (orgId) => {
    const selectedOrg = organizations.find((org) => org._id === orgId);
    setForm((prev) => ({
      ...prev,
      organization: orgId,
      org_id: selectedOrg?.org_id || '',
    }));
    setOrgDropdownOpen(false);
    setOrgDropdownSearch('');
  };

  const handleKycImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setKycImage(file);
    setKycImagePreview(URL.createObjectURL(file));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError('');

    try {
      if (!form.organization || !form.email) {
        setFormError('Please fill all required fields');
        setFormSubmitting(false);
        return;
      }

      if (modalMode === 'create' && !form.password) {
        setFormError('Password is required for new admin');
        setFormSubmitting(false);
        return;
      }

      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });

      if (kycImage) {
        formData.append('kyc_image', kycImage);
      }

      if (modalMode === 'create') {
        await createAdmin(formData);
      } else {
        await updateAdmin(selectedId, formData);
      }

      setModalOpen(false);
      setSelectedId(null);
      fetchAdmins();
    } catch (err) {
      setFormError(
        err.response?.data?.message || 'Failed to save admin'
      );
    } finally {
      setFormSubmitting(false);
    }
  };

  /* =========================
     DELETE
  ========================= */
  const handleDelete = async () => {
    if (!selectedId) return;
    if (!window.confirm('Delete this admin?')) return;

    try {
      await deleteAdmin(selectedId);
      setSelectedId(null);
      fetchAdmins();
    } catch {
      alert('Failed to delete admin');
    }
  };

  /* =========================
     RENDER
  ========================= */
  return (
    <SuperAdminNavbar>
      <Page>
        {/* ================= TOP BAR ================= */}
        <TopBar>
          <Title>Admins / Head Admins</Title>

          <Actions>
            <Button onClick={openCreateModal}>Create</Button>

            <Button
              variant="edit"
              disabled={!selectedId}
              onClick={openEditModal}
            >
              Edit
            </Button>

            <Button
              variant="delete"
              disabled={!selectedId}
              onClick={handleDelete}
            >
              Delete
            </Button>
          </Actions>
        </TopBar>

        {/* ================= SEARCH ================= */}
        <SearchRow>
          <SearchBox
            placeholder="Search by org name / org ID"
            value={orgSearch}
            onChange={(e) => setOrgSearch(e.target.value)}
          />

          <SearchBox
            placeholder="Search by name / email / phone / role"
            value={adminSearch}
            onChange={(e) => setAdminSearch(e.target.value)}
          />
        </SearchRow>

        {/* ================= TABLE ================= */}
        <Card>
          <Table>
            <thead>
              <tr>
                <Th style={{ width: 40 }}></Th>
                <Th>Org ID</Th>
                <Th>Organization</Th>
                <Th>Username</Th>
                <Th>Email</Th>
                <Th>Phone</Th>
                <Th>Address</Th>
                <Th>Role</Th>
                <Th>KYC</Th>
              </tr>
            </thead>

            <tbody>
              {filteredAdmins.map((admin) => (
                <Tr key={admin._id}>
                  <Td>
                    <Checkbox
                      type="checkbox"
                      checked={selectedId === admin._id}
                      onChange={() =>
                        setSelectedId(
                          selectedId === admin._id
                            ? null
                            : admin._id
                        )
                      }
                    />
                  </Td>

                  <Td>{admin.org_id || '-'}</Td>
                  <Td>{admin.organization?.org_name || '-'}</Td>
                  <Td>{admin.username || '-'}</Td>
                  <Td>{admin.email || '-'}</Td>
                  <Td>{admin.phone_number || '-'}</Td>
                  <Td>
                    {[
                      admin.flat_no,
                      admin.area,
                      admin.city,
                      admin.state,
                      admin.country &&
                        `${admin.country}${
                          admin.postal_code
                            ? ' - ' + admin.postal_code
                            : ''
                        }`,
                    ]
                      .filter(Boolean)
                      .join(', ') || '-'}
                  </Td>

                  <Td>
                    <RoleBadge role={admin.role}>
                      {admin.role}
                    </RoleBadge>
                  </Td>

                  <Td>
                    {admin.kyc_details?.kyc_image ? (
                      <KycLink
                        onClick={() => openKycViewer(admin)}
                      >
                        View
                      </KycLink>
                    ) : (
                      <span style={{ color: '#64748b' }}>
                        Pending
                      </span>
                    )}
                  </Td>
                </Tr>
              ))}

              {filteredAdmins.length === 0 && (
                <Tr>
                  <EmptyState colSpan="9">
                    📭 No admins found. Create one to get started!
                  </EmptyState>
                </Tr>
              )}
            </tbody>
          </Table>
        </Card>
      </Page>

      {/* ================= MODAL ================= */}
      {modalOpen && (
        <ModalOverlay onClick={closeModal}>
          <ModalContainer onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <div>
                <ModalTitle>
                  {modalMode === 'create'
                    ? '✨ Create New Admin'
                    : '✏️ Edit Admin'}
                </ModalTitle>
                <ModalSubtitle>
                  {modalMode === 'create'
                    ? 'Add a new admin or head admin to manage organizations'
                    : 'Update admin details'}
                </ModalSubtitle>
              </div>
              <ModalCloseBtn onClick={closeModal} title="Close">
                <FiX size={24} />
              </ModalCloseBtn>
            </ModalHeader>

            {formError && (
              <ModalError>
                <span>⚠️</span>
                <span>{formError}</span>
              </ModalError>
            )}

            <ModalForm onSubmit={handleFormSubmit}>
              {/* ORGANIZATION & ROLE */}
              <FormSection>
                <FormSectionTitle>Organization & Role</FormSectionTitle>
                <FormGrid>
                  <FormField>
                    <FormLabel>
                      Organization <Required>*</Required>
                    </FormLabel>
                    <OrgDropdownContainer>
                      <OrgDropdownInput
                        type="text"
                        placeholder="Search and select organization"
                        value={orgDropdownSearch}
                        onChange={(e) =>
                          setOrgDropdownSearch(e.target.value)
                        }
                        onFocus={() => setOrgDropdownOpen(true)}
                      />
                      {orgDropdownOpen && (
                        <OrgDropdownList>
                          {filteredOrganizations.length > 0 ? (
                            filteredOrganizations.map((org) => (
                              <OrgDropdownItem
                                key={org._id}
                                onClick={() => {
                                  handleOrgSelect(org._id);
                                  setOrgDropdownSearch(
                                    org.org_name
                                  );
                                }}
                              >
                                <strong>{org.org_name}</strong>
                                <span
                                  style={{
                                    fontSize: '12px',
                                    color: '#64748b',
                                    marginLeft: '8px',
                                  }}
                                >
                                  ({org.org_id})
                                </span>
                              </OrgDropdownItem>
                            ))
                          ) : (
                            <OrgDropdownEmpty>
                              No organizations found
                            </OrgDropdownEmpty>
                          )}
                        </OrgDropdownList>
                      )}
                      {form.organization && (
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                          Selected: {organizations.find(o => o._id === form.organization)?.org_name}
                        </div>
                      )}
                    </OrgDropdownContainer>
                  </FormField>

                  <FormField>
                    <FormLabel>Organization ID</FormLabel>
                    <FormInput
                      value={form.org_id}
                      disabled
                      placeholder="Auto-filled"
                    />
                  </FormField>

                  <FormField>
                    <FormLabel>Role</FormLabel>
                    <FormSelect
                      name="role"
                      value={form.role}
                      onChange={handleFormChange}
                    >
                      <option value="admin">Admin</option>
                      <option value="headadmin">Head Admin</option>
                    </FormSelect>
                  </FormField>
                </FormGrid>
              </FormSection>

              {/* PERSONAL INFORMATION */}
              <FormSection>
                <FormSectionTitle>Personal Information</FormSectionTitle>
                <FormGrid>
                  <FormField>
                    <FormLabel>Username</FormLabel>
                    <FormInput
                      name="username"
                      placeholder="e.g., john_admin"
                      value={form.username}
                      onChange={handleFormChange}
                    />
                  </FormField>

                  <FormField>
                    <FormLabel>
                      Email <Required>*</Required>
                    </FormLabel>
                    <FormInput
                      type="email"
                      name="email"
                      placeholder="e.g., john@example.com"
                      value={form.email}
                      onChange={handleFormChange}
                      required
                    />
                  </FormField>

<FormField>
  <FormLabel>
    Password{' '}
    {modalMode === 'create' && <Required>*</Required>}
  </FormLabel>

  <div style={{ position: 'relative' }}>
    <FormInput
      type={showPassword ? 'text' : 'password'}
      name="password"
      placeholder={
        modalMode === 'create'
          ? 'Enter password'
          : 'Leave empty to keep current'
      }
      value={form.password}
      onChange={handleFormChange}
      required={modalMode === 'create'}
      style={{ paddingRight: '180px' }} // space for icon
    />

    <span
      onClick={() => setShowPassword((prev) => !prev)}
      style={{
        position: 'absolute',
        right: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        cursor: 'pointer',
        fontSize: '16px',
        color: '#64748b',
        userSelect: 'none',
      }}
    >
      {showPassword ? '👁' : '👁'}
    </span>
  </div>
</FormField>

                  <FormField>
                    <FormLabel>Phone Number</FormLabel>
                    <FormInput
                      name="phone_number"
                      placeholder="e.g., +91 9876543210"
                      value={form.phone_number}
                      onChange={handleFormChange}
                    />
                  </FormField>
                </FormGrid>
              </FormSection>

              {/* ADDRESS */}
              <FormSection>
                <FormSectionTitle>Address</FormSectionTitle>
                <FormGrid>
                  <FormField>
                    <FormLabel>Flat No</FormLabel>
                    <FormInput
                      name="flat_no"
                      placeholder="e.g., 123"
                      value={form.flat_no}
                      onChange={handleFormChange}
                    />
                  </FormField>

                  <FormField>
                    <FormLabel>Area</FormLabel>
                    <FormInput
                      name="area"
                      placeholder="e.g., Bandra"
                      value={form.area}
                      onChange={handleFormChange}
                    />
                  </FormField>

                  <FormField>
                    <FormLabel>City</FormLabel>
                    <FormInput
                      name="city"
                      placeholder="e.g., Mumbai"
                      value={form.city}
                      onChange={handleFormChange}
                    />
                  </FormField>

                  <FormField>
                    <FormLabel>State</FormLabel>
                    <FormInput
                      name="state"
                      placeholder="e.g., Maharashtra"
                      value={form.state}
                      onChange={handleFormChange}
                    />
                  </FormField>

                  <FormField>
                    <FormLabel>Country</FormLabel>
                    <FormInput
                      name="country"
                      placeholder="e.g., India"
                      value={form.country}
                      onChange={handleFormChange}
                    />
                  </FormField>

                  <FormField>
                    <FormLabel>Postal Code</FormLabel>
                    <FormInput
                      name="postal_code"
                      placeholder="e.g., 400001"
                      value={form.postal_code}
                      onChange={handleFormChange}
                    />
                  </FormField>
                </FormGrid>
              </FormSection>

              {/* KYC */}
              <FormSection>
                <FormSectionTitle>KYC Documents</FormSectionTitle>
                <FormGrid>
                  <FormField>
                    <FormLabel>Document Type</FormLabel>
                    <FormInput
                      name="doc_type"
                      placeholder="e.g., Aadhar, PAN, Passport"
                      value={form.doc_type}
                      onChange={handleFormChange}
                    />
                  </FormField>

                  <FormField>
                    <FormLabel>Document Number</FormLabel>
                    <FormInput
                      name="doc_detail"
                      placeholder="e.g., Document number"
                      value={form.doc_detail}
                      onChange={handleFormChange}
                    />
                  </FormField>

                  <FormField>
                    <FormLabel>KYC Image</FormLabel>
                    <FormInput
                      type="file"
                      accept="image/*"
                      onChange={handleKycImageChange}
                    />
                    {kycImagePreview && (
                      <div
                        style={{
                          marginTop: '8px',
                          padding: '8px',
                          background: '#f0fdf4',
                          borderRadius: '8px',
                          border: '1px solid #bbf7d0',
                          textAlign: 'center',
                        }}
                      >
                        <img
                          src={kycImagePreview}
                          alt="KYC preview"
                          style={{
                            maxWidth: '100px',
                            maxHeight: '100px',
                            borderRadius: '6px',
                          }}
                        />
                      </div>
                    )}
                  </FormField>
                </FormGrid>
              </FormSection>

              <ModalFooter>
                <BtnCancel type="button" onClick={closeModal}>
                  Cancel
                </BtnCancel>
                <BtnSubmit type="submit" disabled={formSubmitting}>
                  {formSubmitting
                    ? 'Saving...'
                    : modalMode === 'create'
                    ? 'Create Admin'
                    : 'Update Admin'}
                </BtnSubmit>
              </ModalFooter>
            </ModalForm>
          </ModalContainer>
        </ModalOverlay>
      )}

      {/* ================= KYC VIEWER MODAL ================= */}
      {kycViewerOpen && kycViewerData && (
        <KycViewerOverlay onClick={closeKycViewer}>
          <KycViewerContainer onClick={(e) => e.stopPropagation()}>
            <KycViewerHeader>
              <KycViewerTitle>📋 KYC Document</KycViewerTitle>
              <KycViewerCloseBtn onClick={closeKycViewer} title="Close">
                <FiX size={24} />
              </KycViewerCloseBtn>
            </KycViewerHeader>

            <KycViewerContent>
              {kycViewerData.kyc_details?.kyc_image && (
<KycImage
  src={`${
    process.env.REACT_APP_API_URL || 'http://localhost:5000'
  }/uploads/kycadmins/${kycViewerData.kyc_details.kyc_image}`}
/>
              )}

              <KycInfoBox>
                <KycInfoRow>
                  <KycInfoLabel>Admin Name</KycInfoLabel>
                  <KycInfoValue>{kycViewerData.username || '-'}</KycInfoValue>
                </KycInfoRow>
                <KycInfoRow>
                  <KycInfoLabel>Email</KycInfoLabel>
                  <KycInfoValue>{kycViewerData.email || '-'}</KycInfoValue>
                </KycInfoRow>
                {kycViewerData.kyc_details?.doc_type && (
                  <KycInfoRow>
                    <KycInfoLabel>Document Type</KycInfoLabel>
                    <KycInfoValue>{kycViewerData.kyc_details.doc_type}</KycInfoValue>
                  </KycInfoRow>
                )}
                {kycViewerData.kyc_details?.doc_detail && (
                  <KycInfoRow>
                    <KycInfoLabel>Document Number</KycInfoLabel>
                    <KycInfoValue>{kycViewerData.kyc_details.doc_detail}</KycInfoValue>
                  </KycInfoRow>
                )}
              </KycInfoBox>
            </KycViewerContent>
          </KycViewerContainer>
        </KycViewerOverlay>
      )}
    </SuperAdminNavbar>
  );
};

export default AdminInfo;
