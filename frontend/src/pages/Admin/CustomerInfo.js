import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { getallCustomer, deleteCustomer, createCustomer, updateCustomer, getCustomer } from "../../services/customerService";
import styled from "styled-components";
import Navbar from '../../components/Navbar/Headadmin-Navbar';
import AdminNavbar from '../../components/Navbar/Admin-Navbar';
import { API_BASE_URL } from '../../config';

// ==================== STYLED COMPONENTS ====================

const PageWrapper = styled.div`
  width: 100%;
  min-height: 100vh;
  background: #f8f9fa;
  padding-top: 2rem;
  padding-bottom: 2rem;
`;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1.5rem;
`;

const PageHeader = styled.div`
  margin-bottom: 2.5rem;
`;

const PageTitle = styled.h1`
  font-size: 2.2rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
  letter-spacing: -0.5px;
`;

const ControlBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 300px;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.95rem;
  background: white;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  @media (max-width: 768px) {
    min-width: unset;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;

  @media (max-width: 768px) {
    width: 100%;
    gap: 0.5rem;
  }
`;

const ActionButton = styled.button`
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    flex: 1;
    justify-content: center;
    padding: 0.65rem 0.75rem;
    font-size: 0.85rem;
  }
`;

const CreateBtn = styled(ActionButton)`
  background: #10b981;
  color: white;

  &:hover:not(:disabled) {
    background: #059669;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }
`;

const EditBtn = styled(ActionButton)`
  background: #f59e0b;
  color: white;

  &:hover:not(:disabled) {
    background: #d97706;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
  }
`;

const DeleteBtn = styled(ActionButton)`
  background: #ef4444;
  color: white;

  &:hover:not(:disabled) {
    background: #dc2626;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
  }
`;

const TableCard = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 2rem;
`;

const TableWrapper = styled.div`
  overflow-x: auto;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;

  thead {
    background: linear-gradient(to right, #1e293b, #334155);
    position: sticky;
    top: 0;
    z-index: 10;
  }

  th {
    padding: 1rem;
    text-align: left;
    color: white;
    font-weight: 600;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 2px solid #e2e8f0;
  }

  tbody tr {
    border-bottom: 1px solid #e2e8f0;
    transition: background-color 0.2s ease;

    &:hover {
      background: #f8fafc;
    }

    &.selected {
      background: #dbeafe;
    }
  }

  td {
    padding: 1rem;
    font-size: 0.95rem;
    color: #334155;
  }

  @media (max-width: 768px) {
    font-size: 0.9rem;

    th, td {
      padding: 0.75rem;
    }
  }
`;

const CheckboxInput = styled.input`
  width: 1.1rem;
  height: 1.1rem;
  cursor: pointer;
  accent-color: #3b82f6;
`;

const NameCell = styled.td`
  font-weight: 600;
  color: #1e293b;
`;

const EmailCell = styled.td`
  color: #475569;
`;

const DocumentLink = styled.a`
  color: #3b82f6;
  text-decoration: none;
  font-weight: 600;
  padding: 0.35rem 0.75rem;
  background: #eff6ff;
  border-radius: 4px;
  transition: all 0.3s ease;
  display: inline-block;

  &:hover {
    background: #3b82f6;
    color: white;
  }
`;

const NoDocumentText = styled.span`
  color: #94a3b8;
  font-size: 0.9rem;
`;

const EmptyMessage = styled.div`
  padding: 3rem 2rem;
  text-align: center;
  color: #64748b;
  font-size: 1rem;
`;

const LoadingMessage = styled.div`
  padding: 2rem;
  text-align: center;
  color: #64748b;
`;

const FooterSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: white;
  border-top: 1px solid #e2e8f0;
  border-radius: 0 0 8px 8px;
  flex-wrap: wrap;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const PaginationInfo = styled.span`
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 500;
`;

const PaginationControls = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
`;

const PageBtn = styled.button`
  padding: 0.5rem 0.75rem;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.85rem;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    border-color: #3b82f6;
    color: #3b82f6;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  &.active {
    background: #3b82f6;
    color: white;
    border-color: #3b82f6;
  }
`;

const ItemsPerPageContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ItemsPerPageSelect = styled.select`
  padding: 0.5rem 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  background: white;
  cursor: pointer;
  font-weight: 500;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

// ==================== MODAL COMPONENTS ====================

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.15);
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h2 {
    margin: 0;
    font-size: 1.4rem;
    color: #1e293b;
  }
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #64748b;
  cursor: pointer;
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.3s ease;

  &:hover {
    background: #f1f5f9;
    color: #1e293b;
  }
`;

const ModalBody = styled.div`
  padding: 2rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.25rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #334155;
  font-size: 0.9rem;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.95rem;
  font-family: inherit;
  transition: all 0.3s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &:disabled {
    background: #f8fafc;
    color: #94a3b8;
  }
`;

const FormSelect = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.95rem;
  font-family: inherit;
  transition: all 0.3s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #334155;
  font-size: 0.95rem;
  cursor: pointer;

  input {
    cursor: pointer;
  }
`;

const ErrorMsg = styled.div`
  padding: 0.75rem;
  margin-bottom: 1rem;
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #991b1b;
  font-size: 0.9rem;
`;

const ModalFooter = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
  justify-content: flex-end;

  @media (max-width: 480px) {
    flex-direction: column-reverse;
  }
`;

const ModalBtn = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 480px) {
    width: 100%;
  }
`;

const SubmitBtn = styled(ModalBtn)`
  background: #3b82f6;
  color: white;

  &:hover:not(:disabled) {
    background: #2563eb;
  }
`;

const CancelBtn = styled(ModalBtn)`
  background: #e2e8f0;
  color: #334155;

  &:hover:not(:disabled) {
    background: #cbd5e1;
  }
`;

// ==================== MODAL COMPONENT ====================

const CustomerModal = ({ isOpen, isEdit, onClose, onSubmit, customer, token }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phoneNo: '',
    identityType: '',
    otherIdentityName: '',
    idDetails: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    document: null,
    password: '',
    generatePassword: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit && customer) {
      setFormData({
        username: customer.username || '',
        email: customer.email || '',
        phoneNo: customer.phoneNo || '',
        identityType: customer.identityType || '',
        otherIdentityName: customer.otherIdentityName || '',
        idDetails: customer.idDetails || '',
        address: customer.address || '',
        city: customer.city || '',
        state: customer.state || '',
        pincode: customer.pincode || '',
        document: null,
        password: '',
        generatePassword: true,
      });
    } else {
      setFormData({
        username: '',
        email: '',
        phoneNo: '',
        identityType: '',
        otherIdentityName: '',
        idDetails: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        document: null,
        password: '',
        generatePassword: true,
      });
    }
    setError('');
  }, [isOpen, isEdit, customer]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === "phoneNo" && (!/^[0-9]*$/.test(value) || value.length > 13)) return;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      document: e.target.files[0]
    }));
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('Username is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (formData.phoneNo.length < 8 || formData.phoneNo.length > 13) {
      setError('Phone number must be between 8-13 digits');
      return false;
    }
    if (!formData.identityType) {
      setError('Identity type is required');
      return false;
    }
    if (formData.identityType === 'Other' && !formData.otherIdentityName.trim()) {
      setError('Please specify the identity card name');
      return false;
    }
    if (!formData.idDetails.trim()) {
      setError('ID details are required');
      return false;
    }
    if (!formData.address.trim()) {
      setError('Address is required');
      return false;
    }
    if (!formData.city.trim()) {
      setError('City is required');
      return false;
    }
    if (!formData.state.trim()) {
      setError('State is required');
      return false;
    }
    if (!formData.pincode.trim()) {
      setError('Pincode is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      data.append('username', formData.username);
      data.append('email', formData.email);
      data.append('phoneNo', formData.phoneNo);
      data.append('identityType', formData.identityType);
      data.append('otherIdentityName', formData.otherIdentityName || '');
      data.append('idDetails', formData.idDetails);
      data.append('address', formData.address);
      data.append('city', formData.city);
      data.append('state', formData.state);
      data.append('pincode', formData.pincode);

      if (!isEdit && !formData.generatePassword && formData.password) {
        data.append('password', formData.password);
      }

      if (formData.document) {
        data.append('document', formData.document);
      }

      await onSubmit(data, isEdit ? customer._id : null);
      onClose();
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <h2>{isEdit ? 'Edit Customer' : 'Create New Customer'}</h2>
          <CloseBtn onClick={onClose}>×</CloseBtn>
        </ModalHeader>

        <ModalBody>
          {error && <ErrorMsg>{error}</ErrorMsg>}

          <form onSubmit={handleSubmit}>
            <FormRow>
              <FormGroup>
                <Label>Username *</Label>
                <FormInput
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter username"
                  disabled={loading}
                />
              </FormGroup>

              <FormGroup>
                <Label>Email *</Label>
                <FormInput
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email"
                  disabled={loading}
                />
              </FormGroup>
            </FormRow>

            <FormRow>
              <FormGroup>
                <Label>Phone Number *</Label>
                <FormInput
                  type="tel"
                  name="phoneNo"
                  value={formData.phoneNo}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  disabled={loading}
                />
              </FormGroup>

              <FormGroup>
                <Label>Identity Type *</Label>
                <FormSelect
                  name="identityType"
                  value={formData.identityType}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="">Select Identity Type</option>
                  <option value="Aadhar Card">Aadhar Card</option>
                  <option value="Ration Card">Ration Card</option>
                  <option value="Driving License">Driving License</option>
                  <option value="PAN Card">PAN Card</option>
                  <option value="Passport">Passport</option>
                  <option value="Voter ID Card">Voter ID Card</option>
                  <option value="Other">Other</option>
                </FormSelect>
              </FormGroup>
            </FormRow>

            {formData.identityType === 'Other' && (
              <FormGroup>
                <Label>Specify Identity Card Name *</Label>
                <FormInput
                  type="text"
                  name="otherIdentityName"
                  value={formData.otherIdentityName}
                  onChange={handleChange}
                  placeholder="Enter card name"
                  disabled={loading}
                />
              </FormGroup>
            )}

            <FormGroup>
              <Label>ID Details *</Label>
              <FormInput
                type="text"
                name="idDetails"
                value={formData.idDetails}
                onChange={handleChange}
                placeholder="Enter ID details"
                disabled={loading}
              />
            </FormGroup>

            <FormGroup>
              <Label>Address *</Label>
              <FormInput
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter address"
                disabled={loading}
              />
            </FormGroup>

            <FormRow>
              <FormGroup>
                <Label>City *</Label>
                <FormInput
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Enter city"
                  disabled={loading}
                />
              </FormGroup>

              <FormGroup>
                <Label>State *</Label>
                <FormInput
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Enter state"
                  disabled={loading}
                />
              </FormGroup>
            </FormRow>

            <FormGroup>
              <Label>Pincode *</Label>
              <FormInput
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="Enter pincode"
                disabled={loading}
              />
            </FormGroup>

            {!isEdit && (
              <FormGroup>
                <CheckboxLabel>
                  <input
                    type="checkbox"
                    name="generatePassword"
                    checked={formData.generatePassword}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  Auto-generate password
                </CheckboxLabel>
              </FormGroup>
            )}

            {!isEdit && !formData.generatePassword && (
              <FormGroup>
                <Label>Password *</Label>
                <FormInput
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  disabled={loading}
                />
              </FormGroup>
            )}

            <FormGroup>
              <Label>Upload Document {!isEdit && '*'}</Label>
              <FormInput
                type="file"
                name="document"
                onChange={handleFileChange}
                accept="image/*,.pdf"
                disabled={loading}
              />
              {isEdit && <small style={{color: '#64748b'}}>Leave blank to keep existing document</small>}
            </FormGroup>

            <ModalFooter>
              <CancelBtn type="button" onClick={onClose} disabled={loading}>
                Cancel
              </CancelBtn>
              <SubmitBtn type="submit" disabled={loading}>
                {loading ? 'Processing...' : (isEdit ? 'Update' : 'Create')}
              </SubmitBtn>
            </ModalFooter>
          </form>
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

// ==================== MAIN COMPONENT ====================

const CustomerInfo = () => {
  const [allCustomers, setAllCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  const { token } = useSelector((state) => state.auth);
  const role = localStorage.getItem('role');
  const isHeadAdmin = role === 'headadmin';

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [searchQuery, allCustomers]);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const response = await getallCustomer(token);
      setAllCustomers(response);
      setFilteredCustomers(response);
      setCurrentPage(1);
      setSelectedCustomers([]);
    } catch (error) {
      console.error('Error fetching customers:', error);
      alert('Failed to load customer data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredCustomers(allCustomers);
      setCurrentPage(1);
      return;
    }

    const lowerQuery = searchQuery.toLowerCase();
    const filtered = allCustomers.filter(customer =>
      Object.values(customer).some(value =>
        value && typeof value === 'string' && value.toLowerCase().includes(lowerQuery)
      )
    );
    setFilteredCustomers(filtered);
    setCurrentPage(1);
  };

  const handleSelectCustomer = (customerId) => {
    setSelectedCustomers(prev =>
      prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleSelectAllOnPage = (e) => {
    const pageCustomers = getPaginatedData();
    if (e.target.checked) {
      setSelectedCustomers(prev => [
        ...prev,
        ...pageCustomers.filter(c => !prev.includes(c._id)).map(c => c._id)
      ]);
    } else {
      const pageIds = pageCustomers.map(c => c._id);
      setSelectedCustomers(prev => prev.filter(id => !pageIds.includes(id)));
    }
  };

  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCustomers.slice(startIndex, startIndex + itemsPerPage);
  };

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

  const handleOpenCreateModal = () => {
    setIsEditMode(false);
    setSelectedCustomer(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = async () => {
    if (selectedCustomers.length !== 1) {
      alert('Please select exactly one customer to edit');
      return;
    }

    try {
      const customer = await getCustomer(token, selectedCustomers[0]);
      setSelectedCustomer(customer);
      setIsEditMode(true);
      setIsModalOpen(true);
    } catch (error) {
      alert('Failed to load customer data for editing');
    }
  };

  const handleModalSubmit = async (formData, customerId) => {
    try {
      if (isEditMode) {
        await updateCustomer(token, customerId, formData);
        alert('Customer updated successfully');
      } else {
        const response = await createCustomer(token, formData);
        if (response.password) {
          alert(`Customer created! Password: ${response.password}\nPlease save this password.`);
        } else {
          alert('Customer created successfully');
        }
      }
      fetchCustomers();
    } catch (error) {
      throw error;
    }
  };

  const handleDelete = async () => {
    if (selectedCustomers.length === 0) return;

    const customerNames = selectedCustomers
      .map(id => allCustomers.find(c => c._id === id)?.username || 'Unknown')
      .join(', ');

    if (window.confirm(`Delete ${customerNames}?`)) {
      try {
        await Promise.all(selectedCustomers.map(id => deleteCustomer(token, id)));
        alert('Customer(s) deleted successfully');
        fetchCustomers();
      } catch (error) {
        alert('Failed to delete customer(s)');
      }
    }
  };

  const paginatedData = getPaginatedData();
  const pageCustomerIds = paginatedData.map(c => c._id);
  const allPageSelected = pageCustomerIds.length > 0 && pageCustomerIds.every(id => selectedCustomers.includes(id));

  return (
    <PageWrapper>
      {isHeadAdmin ? <Navbar /> : <AdminNavbar />}
      
      <Container>
        <PageHeader>
          <PageTitle>Customers</PageTitle>
        </PageHeader>

        <ControlBar>
          <SearchInput
            type="text"
            placeholder="Search by name, email, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          
          <ButtonGroup>
            {isHeadAdmin && (
              <CreateBtn onClick={handleOpenCreateModal}>
                ➕ Create
              </CreateBtn>
            )}
            <EditBtn
              onClick={handleOpenEditModal}
              disabled={selectedCustomers.length !== 1}
            >
              ✏️ Edit
            </EditBtn>
            <DeleteBtn
              onClick={handleDelete}
              disabled={selectedCustomers.length === 0}
            >
              🗑️ Delete
            </DeleteBtn>
          </ButtonGroup>
        </ControlBar>

        <TableCard>
          {isLoading ? (
            <LoadingMessage>Loading customers...</LoadingMessage>
          ) : filteredCustomers.length === 0 ? (
            <EmptyMessage>No customers found</EmptyMessage>
          ) : (
            <>
              <TableWrapper>
                <StyledTable>
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>
                        <CheckboxInput
                          type="checkbox"
                          checked={allPageSelected}
                          onChange={handleSelectAllOnPage}
                        />
                      </th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Identity Type</th>
                      <th>ID Details</th>
                      <th>Address</th>
                      <th>City</th>
                      <th>State</th>
                      <th>Pincode</th>
                      <th>Document</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map(customer => (
                      <tr
                        key={customer._id}
                        className={selectedCustomers.includes(customer._id) ? 'selected' : ''}
                      >
                        <td onClick={(e) => e.stopPropagation()}>
                          <CheckboxInput
                            type="checkbox"
                            checked={selectedCustomers.includes(customer._id)}
                            onChange={() => handleSelectCustomer(customer._id)}
                          />
                        </td>
                        <NameCell>{customer.username}</NameCell>
                        <EmailCell>{customer.email}</EmailCell>
                        <td>{customer.phoneNo}</td>
                        <td>
                          {customer.identityType === 'Other'
                            ? `${customer.identityType} (${customer.otherIdentityName})`
                            : customer.identityType || 'N/A'}
                        </td>
                        <td>{customer.idDetails || 'N/A'}</td>
                        <td>{customer.address || 'N/A'}</td>
                        <td>{customer.city || 'N/A'}</td>
                        <td>{customer.state || 'N/A'}</td>
                        <td>{customer.pincode || 'N/A'}</td>
                        <td>
                          {customer.document ? (
                            <DocumentLink
                              href={`${API_BASE_URL}/customer/document/${customer._id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View
                            </DocumentLink>
                          ) : (
                            <NoDocumentText>No document</NoDocumentText>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </StyledTable>
              </TableWrapper>

              <FooterSection>
                <PaginationInfo>
                  Showing {paginatedData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}–{Math.min(currentPage * itemsPerPage, filteredCustomers.length)} of {filteredCustomers.length}
                </PaginationInfo>

                <div style={{display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap'}}>
                  <ItemsPerPageContainer>
                    <span style={{fontSize: '0.9rem', color: '#64748b'}}>Per page:</span>
                    <ItemsPerPageSelect
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </ItemsPerPageSelect>
                  </ItemsPerPageContainer>

                  <PaginationControls>
                    <PageBtn
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      ← Prev
                    </PageBtn>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <PageBtn
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={currentPage === pageNum ? 'active' : ''}
                        >
                          {pageNum}
                        </PageBtn>
                      );
                    })}

                    <PageBtn
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Next →
                    </PageBtn>
                  </PaginationControls>
                </div>
              </FooterSection>
            </>
          )}
        </TableCard>
      </Container>

      <CustomerModal
        isOpen={isModalOpen}
        isEdit={isEditMode}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        customer={selectedCustomer}
        token={token}
      />
    </PageWrapper>
  );
};

export default CustomerInfo;
