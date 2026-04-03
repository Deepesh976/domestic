// DeviceInfo.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllDevices, deleteDevice, createDevice } from '../../services/deviceService';
import { getUserById } from '../../services/userService';
import { getOrganizationById } from '../../services/orgService';
import { getallCustomer } from '../../services/customerService';
import { getOrganizations } from '../../services/orgService';
import * as XLSX from 'xlsx';
import { FiArrowRight } from 'react-icons/fi';
import Navbar from '../../components/Navbar/Headadmin-Navbar';
import AdminNavbar from '../../components/Navbar/Admin-Navbar';


const DeviceInfo = () => {
    const [deviceData, setDeviceData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [userNames, setUserNames] = useState({});
    const [orgNames, setOrgNames] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [users, setUsers] = useState([]);
    const [organizations, setOrganizations] = useState([]);
    const [createUnassigned, setCreateUnassigned] = useState(true);
    const [assignToOrg, setAssignToOrg] = useState(false);
    const [formData, setFormData] = useState({
        user_id: '',
        organization_id: '',
        deviceId: '',
        macAddress: '',
        device_plan: '',
        status: 'Available',
        phone_no: '',
        expiry: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [hoveredDeviceId, setHoveredDeviceId] = useState(null);
    const itemsPerPage = 10;
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const navigate = useNavigate();

    useEffect(() => {
        fetchDeviceData();
        if (showCreateModal) {
            fetchUsersAndOrganizations();
        }
    }, [token, showCreateModal]);

    useEffect(() => {
        let filtered = deviceData.filter(device => {
            const matchSearch = !searchQuery || (
                (device._id && device._id.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (device.deviceId && device.deviceId.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (device.device_id && device.device_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (device.module_physical_id && device.module_physical_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (device.installed_location && device.installed_location.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (device.status && device.status.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (userNames[device.user_id] && userNames[device.user_id].toLowerCase().includes(searchQuery.toLowerCase()))
            );

            const matchStatus = !statusFilter || (device.status && device.status.toLowerCase() === statusFilter.toLowerCase());

            return matchSearch && matchStatus;
        });
        setFilteredData(filtered);
        setCurrentPage(1);
    }, [searchQuery, statusFilter, deviceData, userNames, orgNames]);

    const fetchUsersAndOrganizations = async () => {
        try {
            const [usersResponse, orgsResponse] = await Promise.all([
                getallCustomer(token),
                getOrganizations(token)
            ]);
            setUsers(usersResponse);
            setOrganizations(orgsResponse);
        } catch (error) {
            console.error('Error fetching users and organizations:', error);
        }
    };

    const fetchDeviceData = async () => {
        try {
            setLoading(true);
            const data = await getAllDevices(token);
            
            // Sort devices: unassigned ones first, then assigned ones
            const unassignedDevices = data.filter(device => 
                !device.user_id || device.user_id === "" || device.status === 'Available'
            );
            
            const assignedDevices = data.filter(device => 
                device.user_id && device.user_id !== "" && device.status !== 'Available'
            );
            
            const sortedDevices = [...unassignedDevices, ...assignedDevices];
            
            setDeviceData(sortedDevices);
            setFilteredData(sortedDevices);
            
            // Fetch user names for assigned devices
            const userIds = [...new Set(data
                .filter(d => d.user_id && d.user_id !== "")
                .map(d => d.user_id))];
                
            const usersObj = {};
            await Promise.all(
                userIds.map(async (userId) => {
                    try {
                        const userData = await getUserById(token, userId);
                        if (userData && userData.username) {
                            usersObj[userId] = userData.username;
                        } else {
                            usersObj[userId] = 'Unknown User';
                        }
                    } catch (error) {
                        if (error.response?.status !== 404) {
                            console.error(`Error fetching user ${userId}:`, error);
                        }
                        usersObj[userId] = 'Unknown User';
                    }
                })
            );
            setUserNames(usersObj);
            
            // Fetch organization names
            const orgIds = [...new Set(data
                .filter(d => d.organization_id && d.organization_id !== "")
                .map(d => d.organization_id))];
                
            const orgsObj = {};
            await Promise.all(
                orgIds.map(async (orgId) => {
                    try {
                        const orgData = await getOrganizationById(token, orgId);
                        if (orgData && orgData.organizationName) {
                            orgsObj[orgId] = orgData.organizationName;
                        } else {
                            orgsObj[orgId] = 'Unknown Organization';
                        }
                    } catch (error) {
                        console.error(`Error fetching organization ${orgId}:`, error);
                        orgsObj[orgId] = 'Unknown Organization';
                    }
                })
            );
            setOrgNames(orgsObj);
            
        } catch (err) {
            setError(err.message || 'An error occurred while fetching device data');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        // Add user names and org names to export data
        const exportData = filteredData.map(device => ({
            ...device,
            user_name: device.user_id ? userNames[device.user_id] || 'Unknown User' : 'Unassigned',
            organization_name: device.organization_id ? orgNames[device.organization_id] || 'Unknown Organization' : 'None'
        }));
        
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        XLSX.writeFile(wb, 'devices_report.xlsx');
    };

    const handleEdit = (deviceId) => {
        window.location.href = `/headadmin/updateDevice/${deviceId}`;
    };

    const handleDelete = async (deviceId) => {
        if (window.confirm('Are you sure you want to delete this device?')) {
            try {
                await deleteDevice(token, deviceId);
                fetchDeviceData();
            } catch (error) {
                console.error('Error deleting device:', error);
            }
        }
    };

    const isDeviceAssigned = (device) => {
        return device.user_id &&
            device.user_id !== "" &&
            device.user_id !== null &&
            device.user_id !== undefined &&
            device.status !== 'Available';
    };

    const handleOpenCreateModal = () => {
        setShowCreateModal(true);
        resetForm();
    };

    const handleCloseCreateModal = () => {
        setShowCreateModal(false);
        resetForm();
    };

    const resetForm = () => {
        setFormData({
            user_id: '',
            organization_id: '',
            deviceId: '',
            macAddress: '',
            device_plan: '',
            status: 'Available',
            phone_no: '',
            expiry: ''
        });
        setCreateUnassigned(true);
        setAssignToOrg(false);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        if (name === 'user_id') {
            const selectedUser = users.find(user => user._id === value);
            setFormData(prev => ({
                ...prev,
                user_id: value,
                organization_id: '',
                phone_no: selectedUser ? selectedUser.phoneNo : '',
                status: value ? 'Active' : 'Available'
            }));
        } else if (name === 'organization_id') {
            setFormData(prev => ({
                ...prev,
                organization_id: value,
                user_id: '',
                status: value ? 'Active' : 'Available'
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const toggleAssignmentMode = () => {
        setCreateUnassigned(!createUnassigned);
        setFormData(prev => ({
            ...prev,
            user_id: '',
            organization_id: '',
            status: createUnassigned ? 'Active' : 'Available'
        }));
    };

    const toggleAssignmentType = () => {
        setAssignToOrg(!assignToOrg);
        setFormData(prev => ({
            ...prev,
            user_id: '',
            organization_id: ''
        }));
    };

    const handleSubmitCreateDevice = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const devicePayload = {
            deviceId: formData.deviceId,
            macAddress: formData.macAddress,
            device_plan: formData.device_plan,
            status: formData.status || 'Available',
            expiry: formData.expiry,
            phone_no: formData.phone_no || '0000000000'
        };

        if (!createUnassigned) {
            if (assignToOrg && formData.organization_id) {
                devicePayload.organization_id = formData.organization_id;
            } else if (!assignToOrg && formData.user_id) {
                devicePayload.user_id = formData.user_id;
            }
        }

        try {
            await createDevice(token, devicePayload);
            alert('Device created successfully');
            handleCloseCreateModal();
            fetchDeviceData();
        } catch (error) {
            console.error('Error creating device:', error);
            alert('Failed to create device: ' + (error.message || 'Unknown error'));
        } finally {
            setSubmitting(false);
        }
    };

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    if (loading) {
        return <div style={styles.loadingContainer}>Loading...</div>;
    }

    if (error) {
        return <div style={styles.errorContainer}>Error: {error}</div>;
    }

    return (
        <div>
            {role === 'headadmin' ? <Navbar /> : <AdminNavbar />}
            <div style={styles.container}>
                <div style={styles.headerSection}>
                    <div style={styles.titleWrapper}>
                        <h1 style={styles.pageTitle}>Purifiers Info</h1>
                        <p style={styles.pageSubtitle}>Monitor and manage all water purifiers</p>
                    </div>
                    {role === 'headadmin' && (
                        <button
                            onClick={handleOpenCreateModal}
                            style={styles.createDeviceButton}
                        >
                            + Create Device
                        </button>
                    )}
                </div>

                <div style={styles.controlsSection}>
                    <div style={styles.searchWrapper}>
                        <input
                            type="text"
                            placeholder="🔍 Search by Device ID, Module ID, Location, User, Status..."
                            style={styles.searchInput}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div style={styles.statusFilterWrapper}>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={styles.statusDropdown}
                        >
                            <option value="">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                    <button
                        id="downloadButton"
                        onClick={handleDownload}
                        style={styles.downloadButton}
                    >
                        ⬇ Download
                    </button>
                </div>

                <div style={styles.tableWrapper}>
                    <table style={styles.table} id="deviceTable">
                        <thead>
                            <tr style={styles.tableHeader}>
                                <th style={styles.tableTh}>S.No</th>
                                <th style={styles.tableTh}>Device ID</th>
                                <th style={styles.tableTh}>User ID</th>
                                <th style={styles.tableTh}>Module Physical ID</th>
                                <th style={styles.tableTh}>Status</th>
                                <th style={styles.tableTh}>Installed Location</th>
                                <th style={styles.tableTh}>Installed At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.length > 0 ? (
                                paginatedData.map((device, index) => {
                                    const statusClass = device.status === 'Active' ? styles.activeTag : styles.inactiveTag;
                                    return (
                                        <tr key={device._id} style={styles.tableBodyRow}>
                                            <td style={styles.tableTd}>{startIndex + index + 1}</td>
                                            <td style={styles.tableTd}>
                                                <div
                                                    style={{
                                                        ...styles.deviceIdContainer,
                                                        ...(hoveredDeviceId === device._id ? styles.deviceIdContainerHover : {})
                                                    }}
                                                    onClick={() => navigate(`/${role}/device-history/${device._id}`)}
                                                    onMouseEnter={() => setHoveredDeviceId(device._id)}
                                                    onMouseLeave={() => setHoveredDeviceId(null)}
                                                    role="button"
                                                    tabIndex={0}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' || e.key === ' ') {
                                                            navigate(`/${role}/device-history/${device._id}`);
                                                        }
                                                    }}
                                                >
                                                    <span style={styles.deviceIdBadge}>{device.device_id || device.deviceId || '-'}</span>
                                                    <FiArrowRight style={{
                                                        ...styles.deviceIdIcon,
                                                        ...(hoveredDeviceId === device._id ? styles.deviceIdIconHover : {})
                                                    }} />
                                                </div>
                                            </td>
                                            <td style={styles.tableTd}>{device.user_id || '-'}</td>
                                            <td style={styles.tableTd}>{device.module_physical_id || '-'}</td>
                                            <td style={styles.tableTd}>
                                                <span style={statusClass}>
                                                    {device.status || 'N/A'}
                                                </span>
                                            </td>
                                            <td style={styles.tableTd}>{device.installed_location || '-'}</td>
                                            <td style={styles.tableTd}>
                                                {device.installed_at ? new Date(device.installed_at).toLocaleDateString() : '-'}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="7" style={styles.emptyRow}>No purifiers found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {filteredData.length > 0 && (
                    <div style={styles.paginationSection}>
                        <div style={styles.resultInfo}>
                            Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} purifiers
                        </div>
                        <div style={styles.paginationControls}>
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                style={{...styles.paginationButton, ...(!currentPage === 1 ? {} : styles.paginationButtonDisabled)}}
                            >
                                ← Previous
                            </button>
                            <div style={styles.pageNumbers}>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        style={{
                                            ...styles.pageNumber,
                                            ...(page === currentPage ? styles.pageNumberActive : {})
                                        }}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                style={{...styles.paginationButton, ...(!currentPage === totalPages ? {} : styles.paginationButtonDisabled)}}
                            >
                                Next →
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {showCreateModal && (
                <div style={styles.modalOverlay} onClick={handleCloseCreateModal}>
                    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h2 style={styles.modalTitle}>Create New Device</h2>
                            <button style={styles.closeButton} onClick={handleCloseCreateModal}>✕</button>
                        </div>

                        <div style={styles.modalContent}>
                            <div style={styles.toggleContainer}>
                                <button
                                    type="button"
                                    onClick={toggleAssignmentMode}
                                    style={createUnassigned ? styles.activeToggle : styles.inactiveToggle}
                                >
                                    Create Unassigned
                                </button>
                                <button
                                    type="button"
                                    onClick={toggleAssignmentMode}
                                    style={!createUnassigned ? styles.activeToggle : styles.inactiveToggle}
                                >
                                    Assign Device
                                </button>
                            </div>

                            {!createUnassigned && (
                                <div style={styles.toggleContainer}>
                                    <button
                                        type="button"
                                        onClick={toggleAssignmentType}
                                        style={!assignToOrg ? styles.activeToggle : styles.inactiveToggle}
                                    >
                                        Assign to User
                                    </button>
                                    <button
                                        type="button"
                                        onClick={toggleAssignmentType}
                                        style={assignToOrg ? styles.activeToggle : styles.inactiveToggle}
                                    >
                                        Assign to Organization
                                    </button>
                                </div>
                            )}

                            <form onSubmit={handleSubmitCreateDevice} style={styles.form}>
                                {!createUnassigned && !assignToOrg && (
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Select User *</label>
                                        <select
                                            name="user_id"
                                            value={formData.user_id}
                                            onChange={handleFormChange}
                                            style={styles.input}
                                            required={!createUnassigned && !assignToOrg}
                                        >
                                            <option value="">Select a User</option>
                                            {users.map(user => (
                                                <option key={user._id} value={user._id}>
                                                    {user.username} - {user.phoneNo}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {!createUnassigned && assignToOrg && (
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Select Organization *</label>
                                        <select
                                            name="organization_id"
                                            value={formData.organization_id}
                                            onChange={handleFormChange}
                                            style={styles.input}
                                            required={!createUnassigned && assignToOrg}
                                        >
                                            <option value="">Select an Organization</option>
                                            {organizations.map(org => (
                                                <option key={org._id} value={org._id}>
                                                    {org.organizationName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Device ID *</label>
                                    <input
                                        type="text"
                                        name="deviceId"
                                        value={formData.deviceId}
                                        onChange={handleFormChange}
                                        placeholder="Enter Device ID"
                                        required
                                        style={styles.input}
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>MAC Address *</label>
                                    <input
                                        type="text"
                                        name="macAddress"
                                        value={formData.macAddress}
                                        onChange={handleFormChange}
                                        placeholder="e.g., 00:1A:2B:3C:4D:5E"
                                        required
                                        style={styles.input}
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Device Plan *</label>
                                    <select
                                        name="device_plan"
                                        value={formData.device_plan}
                                        onChange={handleFormChange}
                                        required
                                        style={styles.input}
                                    >
                                        <option value="">Select Device Plan</option>
                                        <option value="Basic">Basic</option>
                                        <option value="Standard">Standard</option>
                                        <option value="Premium">Premium</option>
                                    </select>
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Expiry Date *</label>
                                    <input
                                        type="date"
                                        name="expiry"
                                        value={formData.expiry}
                                        onChange={handleFormChange}
                                        required
                                        style={styles.input}
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Status *</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleFormChange}
                                        required
                                        style={styles.input}
                                    >
                                        <option value="Available">Available</option>
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Phone Number {!createUnassigned ? '*' : ''}</label>
                                    <input
                                        type="tel"
                                        name="phone_no"
                                        value={formData.phone_no}
                                        onChange={handleFormChange}
                                        placeholder={createUnassigned ? "Optional" : "Required"}
                                        maxLength="13"
                                        required={!createUnassigned}
                                        style={styles.input}
                                    />
                                </div>

                                <div style={styles.formActions}>
                                    <button
                                        type="button"
                                        onClick={handleCloseCreateModal}
                                        style={styles.cancelButton}
                                        disabled={submitting}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        style={styles.submitButton}
                                        disabled={submitting}
                                    >
                                        {submitting ? 'Creating...' : 'Create Device'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    loadingContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666',
    },
    errorContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#d32f2f',
    },
    container: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: '1400px',
        margin: '40px auto',
        padding: '0 20px',
    },
    headerSection: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '32px',
        gap: '20px',
    },
    titleWrapper: {
        flex: 1,
    },
    pageTitle: {
        fontSize: '28px',
        fontWeight: '700',
        color: '#1a1a1a',
        margin: '0 0 8px 0',
    },
    pageSubtitle: {
        fontSize: '14px',
        color: '#666',
        margin: 0,
    },
    createDeviceButton: {
        padding: '12px 24px',
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontWeight: '600',
        fontSize: '14px',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'all 0.3s ease',
        boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
    },
    controlsSection: {
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    searchWrapper: {
        flex: 1,
        display: 'flex',
        minWidth: '250px',
    },
    statusFilterWrapper: {
        display: 'flex',
    },
    statusDropdown: {
        padding: '10px 14px',
        border: '1px solid #ddd',
        borderRadius: '6px',
        fontSize: '14px',
        backgroundColor: 'white',
        color: '#333',
        cursor: 'pointer',
        boxSizing: 'border-box',
        transition: 'border-color 0.3s',
    },
    searchInput: {
        width: '100%',
        padding: '10px 16px',
        border: '1px solid #ddd',
        borderRadius: '6px',
        fontSize: '14px',
        boxSizing: 'border-box',
        transition: 'border-color 0.3s',
    },
    downloadButton: {
        padding: '10px 16px',
        backgroundColor: '#2196F3',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: '500',
        fontSize: '14px',
        transition: 'all 0.3s ease',
        boxShadow: '0 2px 6px rgba(33, 150, 243, 0.2)',
    },
    tableWrapper: {
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden',
        marginBottom: '24px',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    tableHeader: {
        backgroundColor: '#f5f5f5',
    },
    tableTh: {
        padding: '14px 12px',
        textAlign: 'center',
        fontWeight: '600',
        fontSize: '13px',
        color: '#1a1a1a',
        borderBottom: '2px solid #e0e0e0',
    },
    tableBodyRow: {
        borderBottom: '1px solid #f0f0f0',
        transition: 'background-color 0.2s',
    },
    tableTd: {
        padding: '14px 12px',
        fontSize: '13px',
        color: '#333',
        textAlign: 'center',
    },
    deviceIdContainer: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 14px',
        backgroundColor: '#e3f2fd',
        border: '2px solid #1976d2',
        borderRadius: '20px',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        fontWeight: '600',
        color: '#1565c0',
        boxShadow: '0 2px 4px rgba(25, 118, 210, 0.1)',
    },
    deviceIdBadge: {
        fontSize: '13px',
        fontWeight: '700',
        letterSpacing: '0.3px',
    },
    deviceIdIcon: {
        fontSize: '16px',
        transition: 'transform 0.3s ease, opacity 0.3s ease',
        opacity: 0.7,
    },
    deviceIdContainerHover: {
        backgroundColor: '#1e88e5',
        borderColor: '#1565c0',
        color: '#ffffff',
        boxShadow: '0 6px 16px rgba(25, 118, 210, 0.25)',
        transform: 'translateY(-2px)',
    },
    deviceIdIconHover: {
        transform: 'translateX(4px)',
        opacity: 1,
    },
    macAddress: {
        fontSize: '12px',
        backgroundColor: '#f5f5f5',
        padding: '2px 6px',
        borderRadius: '4px',
        fontFamily: 'monospace',
    },
    activeTag: {
        display: 'inline-block',
        background: '#e8f5e9',
        color: '#2e7d32',
        padding: '6px 12px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: '600',
    },
    inactiveTag: {
        display: 'inline-block',
        background: '#ffebee',
        color: '#c62828',
        padding: '6px 12px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: '600',
    },
    assignedRow: {
        backgroundColor: '#fafafa',
    },
    actionButtons: {
        display: 'flex',
        gap: '6px',
    },
    editButton: {
        padding: '6px 12px',
        backgroundColor: '#FFC107',
        color: '#333',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: '500',
        transition: 'all 0.2s',
    },
    deleteButton: {
        padding: '6px 12px',
        backgroundColor: '#f44336',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: '500',
        transition: 'all 0.2s',
    },
    emptyRow: {
        textAlign: 'center',
        padding: '40px',
        color: '#999',
        fontSize: '14px',
    },
    paginationSection: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    },
    resultInfo: {
        fontSize: '13px',
        color: '#666',
    },
    paginationControls: {
        display: 'flex',
        gap: '6px',
        alignItems: 'center',
    },
    paginationButton: {
        padding: '8px 12px',
        border: '1px solid #ddd',
        backgroundColor: 'white',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: '500',
        transition: 'all 0.2s',
        color: '#333',
    },
    paginationButtonDisabled: {
        opacity: 0.5,
        cursor: 'not-allowed',
    },
    pageNumbers: {
        display: 'flex',
        gap: '4px',
    },
    pageNumber: {
        padding: '6px 10px',
        border: '1px solid #ddd',
        backgroundColor: 'white',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: '500',
        transition: 'all 0.2s',
        color: '#333',
    },
    pageNumberActive: {
        backgroundColor: '#4CAF50',
        color: 'white',
        borderColor: '#4CAF50',
    },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    modal: {
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto',
    },
    modalHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '24px',
        borderBottom: '1px solid #f0f0f0',
    },
    modalTitle: {
        fontSize: '20px',
        fontWeight: '700',
        color: '#1a1a1a',
        margin: 0,
    },
    closeButton: {
        background: 'none',
        border: 'none',
        fontSize: '24px',
        cursor: 'pointer',
        color: '#999',
        padding: '0',
        width: '32px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'color 0.2s',
    },
    modalContent: {
        padding: '24px',
    },
    toggleContainer: {
        display: 'flex',
        gap: '8px',
        marginBottom: '20px',
        borderRadius: '6px',
        overflow: 'hidden',
        backgroundColor: '#f5f5f5',
        padding: '4px',
    },
    activeToggle: {
        flex: 1,
        padding: '10px',
        border: 'none',
        backgroundColor: '#4CAF50',
        color: 'white',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '13px',
        borderRadius: '4px',
        transition: 'all 0.2s',
    },
    inactiveToggle: {
        flex: 1,
        padding: '10px',
        border: 'none',
        backgroundColor: 'transparent',
        color: '#666',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '13px',
        borderRadius: '4px',
        transition: 'all 0.2s',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    label: {
        fontSize: '13px',
        fontWeight: '600',
        color: '#1a1a1a',
    },
    input: {
        padding: '10px 12px',
        borderRadius: '6px',
        border: '1px solid #ddd',
        fontSize: '13px',
        boxSizing: 'border-box',
        transition: 'border-color 0.2s',
    },
    formActions: {
        display: 'flex',
        gap: '12px',
        justifyContent: 'flex-end',
        marginTop: '20px',
        paddingTop: '20px',
        borderTop: '1px solid #f0f0f0',
    },
    submitButton: {
        padding: '10px 20px',
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '13px',
        transition: 'all 0.2s',
    },
    cancelButton: {
        padding: '10px 20px',
        backgroundColor: '#f5f5f5',
        color: '#333',
        border: '1px solid #ddd',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '13px',
        transition: 'all 0.2s',
    }
};

export default DeviceInfo;
