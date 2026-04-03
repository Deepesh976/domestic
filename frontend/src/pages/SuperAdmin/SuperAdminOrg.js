import React, { useEffect, useState } from 'react';
import { FiX, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import {
  getOrganizations,
  deleteOrganization,
  createOrganization,
  updateOrganization,
} from '../../services/superAdminService';
import SuperAdminNavbar from '../../components/Navbar/SuperAdminNavbar';
import './SuperAdminOrg.css';

const API_BASE = process.env.REACT_APP_API_URL || '';

const SuperAdminOrg = () => {
  const [orgs, setOrgs] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [page, setPage] = useState(1);

  /* =========================
     MODAL STATE
  ========================= */
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // create | edit
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

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
  const [logoPreview, setLogoPreview] = useState(null);

  const pageSize = 5;

  /* =========================
     FETCH
  ========================= */
  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const res = await getOrganizations();
      setOrgs(res.data || []);
    } catch {
      alert('Failed to load organizations');
    }
  };

  /* =========================
     FILTER + PAGINATION
  ========================= */
  const filtered = orgs.filter((org) =>
    `
      ${org.org_name || ''}
      ${org.org_id || ''}
      ${org.email_id || ''}
      ${org.phone_number || ''}
      ${org.state || ''}
    `
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  /* =========================
     MODAL HANDLERS
  ========================= */
  const openCreateModal = () => {
    setModalMode('create');
    setForm({
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
    setLogo(null);
    setLogoPreview(null);
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = () => {
    if (!selectedId) return;
    const org = orgs.find((o) => o._id === selectedId);
    if (!org) return;

    setModalMode('edit');
    setForm({
      org_id: org.org_id || '',
      org_name: org.org_name || '',
      type: org.type || '',
      gst_number: org.gst_number || '',
      email_id: org.email_id || '',
      phone_number: org.phone_number || '',
      state: org.state || '',
      pincode: org.pincode || '',
      country: org.country || 'India',
    });

    setLogo(null);
    setLogoPreview(
      org.logo
        ? `${API_BASE}/uploads/organizations/${org.logo}`
        : null
    );

    setFormError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setFormError('');
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

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLogo(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError('');

    try {
      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });

      if (logo) {
        formData.append('logo', logo);
      }

      if (modalMode === 'create') {
        await createOrganization(formData);
      } else {
        await updateOrganization(selectedId, formData);
      }

      setModalOpen(false);
      setSelectedId(null);
      fetchOrganizations();
    } catch (err) {
      setFormError(
        err.response?.data?.message || 'Failed to save organization'
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
    if (!window.confirm('Delete this organization?')) return;

    try {
      await deleteOrganization(selectedId);
      setSelectedId(null);
      fetchOrganizations();
    } catch {
      alert('Failed to delete organization');
    }
  };

  /* =========================
     RENDER
  ========================= */
  return (
    <SuperAdminNavbar>
      <div className="org-page">
        {/* HEADER */}
        <div className="org-header">
          <h1 className="org-title">Organizations</h1>

          <div className="org-actions">
            <button className="org-button primary" onClick={openCreateModal}>
              <FiPlus size={16} /> Create
            </button>

            <button
              className="org-button edit"
              disabled={!selectedId}
              onClick={openEditModal}
            >
              <FiEdit2 size={16} /> Edit
            </button>

            <button
              className="org-button delete"
              disabled={!selectedId}
              onClick={handleDelete}
            >
              <FiTrash2 size={16} /> Delete
            </button>
          </div>
        </div>

        {/* SEARCH */}
        <input
          className="org-search"
          type="text"
          placeholder="Search organizations..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />

        {/* TABLE */}
        <div className="org-card">
<table className="org-table">
  <thead className="org-table-header">
    <tr>
      <th className="org-table-header-cell" style={{ width: 40 }}></th>
      <th className="org-table-header-cell">Logo</th>
      <th className="org-table-header-cell">Org ID</th>
      <th className="org-table-header-cell">Organization Name</th>
      <th className="org-table-header-cell">Email</th>
      <th className="org-table-header-cell">Phone</th>
      <th className="org-table-header-cell">State</th>
    </tr>
  </thead>

  <tbody>
    {paginated.map((org) => (
      <tr
        key={org._id}
        className={`org-table-body-row ${
          selectedId === org._id ? 'selected' : ''
        }`}
        onClick={() => setSelectedId(org._id)}
      >
        <td className="org-table-body-cell">
          <input
            type="radio"
            className="org-checkbox"
            checked={selectedId === org._id}
            readOnly
          />
        </td>

        <td className="org-table-body-cell">
          {org.logo ? (
            <img
              src={`${API_BASE}/uploads/organizations/${org.logo}`}
              alt="logo"
              style={{ height: 32 }}
            />
          ) : (
            '—'
          )}
        </td>

        <td className="org-table-body-cell">{org.org_id}</td>
        <td className="org-table-body-cell">{org.org_name}</td>
        <td className="org-table-body-cell">{org.email_id || '—'}</td>
        <td className="org-table-body-cell">{org.phone_number || '—'}</td>
        <td className="org-table-body-cell">{org.state || '—'}</td>
      </tr>
    ))}

    {paginated.length === 0 && (
      <tr>
        <td colSpan="7" className="org-empty">
          No organizations found
        </td>
      </tr>
    )}
  </tbody>
</table>


          {totalPages > 1 && (
            <div className="org-pagination">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  className={page === i + 1 ? 'active' : ''}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="org-modal-overlay" onClick={closeModal}>
          <div className="org-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="org-modal-header">
              <div>
                <h2 className="org-modal-title">
                  {modalMode === 'create' ? '✨ Create New Organization' : '✏️ Edit Organization'}
                </h2>
                <p className="org-modal-subtitle">
                  {modalMode === 'create' ? 'Add a new organization to your system' : 'Update organization details'}
                </p>
              </div>
              <button className="org-modal-close" onClick={closeModal} title="Close">
                <FiX size={24} />
              </button>
            </div>

            {formError && (
              <div className="org-modal-error">
                <span>⚠️</span>
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="org-modal-form">
              <div className="org-form-section">
                <h3 className="org-form-section-title">Basic Information</h3>
                <div className="org-form-grid">
                  <div className="org-form-field">
                    <label className="org-form-label">Organization ID <span className="required">*</span></label>
                    <input
                      className="org-form-input"
                      name="org_id"
                      placeholder="e.g., ORG001"
                      value={form.org_id}
                      onChange={handleFormChange}
                      disabled={modalMode === 'edit'}
                      required
                    />
                  </div>

                  <div className="org-form-field">
                    <label className="org-form-label">Organization Name <span className="required">*</span></label>
                    <input
                      className="org-form-input"
                      name="org_name"
                      placeholder="e.g., Acme Corporation"
                      value={form.org_name}
                      onChange={handleFormChange}
                      required
                    />
                  </div>

                  <div className="org-form-field">
                    <label className="org-form-label">Email <span className="required">*</span></label>
                    <input
                      className="org-form-input"
                      type="email"
                      name="email_id"
                      placeholder="e.g., contact@organization.com"
                      value={form.email_id}
                      onChange={handleFormChange}
                      required
                    />
                  </div>

                  <div className="org-form-field">
                    <label className="org-form-label">Phone Number</label>
                    <input
                      className="org-form-input"
                      name="phone_number"
                      placeholder="e.g., +91 9876543210"
                      value={form.phone_number}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="org-form-field">
                    <label className="org-form-label">Organization Type</label>
                    <input
                      className="org-form-input"
                      name="type"
                      placeholder="e.g., Private, Public"
                      value={form.type}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="org-form-field">
                    <label className="org-form-label">GST Number</label>
                    <input
                      className="org-form-input"
                      name="gst_number"
                      placeholder="e.g., 27AAPFC0055K1Z5"
                      value={form.gst_number}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>
              </div>

              <div className="org-form-section">
                <h3 className="org-form-section-title">Location Details</h3>
                <div className="org-form-grid">
                  <div className="org-form-field">
                    <label className="org-form-label">State</label>
                    <input
                      className="org-form-input"
                      name="state"
                      placeholder="e.g., Maharashtra"
                      value={form.state}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="org-form-field">
                    <label className="org-form-label">Pincode</label>
                    <input
                      className="org-form-input"
                      name="pincode"
                      placeholder="e.g., 400001"
                      value={form.pincode}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="org-form-field">
                    <label className="org-form-label">Country</label>
                    <input
                      className="org-form-input"
                      name="country"
                      placeholder="e.g., India"
                      value={form.country}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>
              </div>

              <div className="org-form-section">
                <h3 className="org-form-section-title">Organization Logo</h3>
                <div className="org-logo-upload">
                  <input
                    className="org-file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    id="org-logo-file"
                  />
                  <label htmlFor="org-logo-file" className="org-file-label">
                    <div className="org-upload-icon">📤</div>
                    <div className="org-upload-text">
                      <p className="org-upload-title">Click to upload or drag and drop</p>
                      <p className="org-upload-hint">PNG, JPG, GIF up to 5MB</p>
                    </div>
                  </label>
                  {logoPreview && (
                    <div className="org-logo-preview">
                      <img src={logoPreview} alt="Organization logo preview" />
                      <button
                        type="button"
                        className="org-logo-remove"
                        onClick={() => {
                          setLogo(null);
                          setLogoPreview(null);
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="org-modal-footer">
                <button type="button" className="org-btn-cancel" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="org-btn-submit" disabled={formSubmitting}>
                  {formSubmitting ? 'Saving...' : modalMode === 'create' ? 'Create Organization' : 'Update Organization'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SuperAdminNavbar>
  );
};

export default SuperAdminOrg;
