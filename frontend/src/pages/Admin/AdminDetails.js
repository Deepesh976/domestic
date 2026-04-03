import React, { useState, useEffect } from 'react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { getAllAdmin, deleteAdmin } from '../../services/adminService';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from '../../components/Navbar/Headadmin-Navbar';
import AdminNavbar from '../../components/Navbar/Admin-Navbar';
import LoadingSpinner from '../../components/Loading/LoadingSpinner';
import LoadingButton from '../../components/Loading/LoadingButton';

const styles = {
    container: {
        width: '100%',
        maxWidth: '1300px',
        margin: '20px auto',
        background: '#fff',
        padding: '20px',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
        boxSizing: 'border-box',
        position: 'relative',
    },
    header: {
        textAlign: 'center',
        marginBottom: '20px',
        fontSize: '1.75rem',
    },
    searchContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '20px',
    },
    searchInput: {
        padding: '10px',
        width: '100%',
        maxWidth: '300px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        boxSizing: 'border-box',
        height: '40px',
    },
    addAdminButton: {
        padding: '10px 20px',
        backgroundColor: '#28a745',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '4px',
        fontWeight: 'bold',
    },
    tableContainer: {
        overflowX: 'auto',
        margin: '0 auto',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    tableTh: {
        border: '1px solid #ddd',
        padding: '10px',
        textAlign: 'center',
        backgroundColor: '#f4f4f4',
    },
    tableTd: {
        border: '1px solid #ddd',
        padding: '10px',
        textAlign: 'center',
    },
    emptyRow: {
        textAlign: 'center',
        fontStyle: 'italic',
        color: '#999',
    },
    downloadContainer: {
        textAlign: 'center',
        marginTop: '20px',
    },
    downloadButton: {
        backgroundColor: '#008000',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    editButton: {
        padding: '5px 10px',
        backgroundColor: '#ffc107',
        color: 'black',
        border: 'none',
        borderRadius: '4px',
        marginRight: '5px',
        cursor: 'pointer',
    },
    deleteButton: {
        padding: '5px 10px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
};

const AdminDetails = () => {
    const [allAdmins, setAllAdmins] = useState([]);
    const [filteredAdmins, setFilteredAdmins] = useState([]);
    const [searchValue, setSearchValue] = useState('');
    const { token } = useSelector(state => state.auth);
    const navigate = useNavigate();
    const [pageLoading, setPageLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState({ delete: null, edit: null });
    const role = localStorage.getItem('role');

    useEffect(() => {
        const fetchAdmins = async () => {
            setPageLoading(true);
            try {
                const adminResponse = await getAllAdmin(token);
                setAllAdmins(adminResponse);
                setFilteredAdmins(adminResponse);
            } catch (error) {
                console.error('Error fetching admins:', error);
            } finally {
                setPageLoading(false);
            }
        };

        fetchAdmins();
    }, [token]);

    const handleSearchChange = (e) => {
        const value = e.target.value.toLowerCase();
        setSearchValue(value);

        const filteredData = allAdmins.filter(admin =>
            admin.username.toLowerCase().includes(value)
        );
        setFilteredAdmins(filteredData);
    };

    const handleDownload = () => {
        const ws = XLSX.utils.json_to_sheet(filteredAdmins);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Admins');
        XLSX.writeFile(wb, 'admins_report.xlsx');
    };

    const handleEdit = (adminId) => {
        navigate(`/superadmin/edit-admin/${adminId}`);
    };

    const handleDelete = async (adminId) => {
        if (window.confirm('Are you sure you want to delete this admin?')) {
            setActionLoading(prev => ({ ...prev, delete: adminId }));
            try {
                await deleteAdmin(token, adminId);
                const updatedAdmins = await getAllAdmin(token);
                setAllAdmins(updatedAdmins);
                setFilteredAdmins(updatedAdmins);
            } catch (error) {
                console.error('Error deleting admin:', error);
                alert('Failed to delete admin. Please try again.');
            } finally {
                setActionLoading(prev => ({ ...prev, delete: null }));
            }
        }
    };

    return (
        <div>
            {role === 'headadmin' ? <Navbar /> : <AdminNavbar />}
            <div style={styles.container}>
                <h1 style={styles.header}>Admin Information</h1>
                {pageLoading ? (
                    <LoadingSpinner size="large" />
                ) : (
                    <>
                        <div style={styles.searchContainer}>
                            <input
                                type="text"
                                placeholder="Search by Admin Name"
                                value={searchValue}
                                onChange={handleSearchChange}
                                style={styles.searchInput}
                            />
                            <Link to="/superadmin/createAdmin" style={styles.addAdminButton}>
                                Create Admin
                            </Link>
                        </div>

                        <div style={styles.tableContainer}>
                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        <th style={styles.tableTh}>S.No</th>
                                        <th style={styles.tableTh}>Admin Name</th>
                                        <th style={styles.tableTh}>Email</th>
                                        <th style={styles.tableTh}>Phone</th>
                                        <th style={styles.tableTh}>Location</th>
                                        <th style={styles.tableTh}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAdmins.length > 0 ? (
                                        filteredAdmins.map((row, index) => (
                                            <tr key={index}>
                                                <td style={styles.tableTd}>{index + 1}</td>
                                                <td style={styles.tableTd}>{row.username}</td>
                                                <td style={styles.tableTd}>{row.email}</td>
                                                <td style={styles.tableTd}>{row.phoneNo}</td>
                                                <td style={styles.tableTd}>{row.location}</td>
                                                <td style={styles.tableTd}>
                                                    <LoadingButton
                                                        isLoading={actionLoading.edit === row._id}
                                                        onClick={() => handleEdit(row._id)}
                                                        style={styles.editButton}
                                                    >
                                                        Edit
                                                    </LoadingButton>
                                                    <LoadingButton
                                                        isLoading={actionLoading.delete === row._id}
                                                        onClick={() => handleDelete(row._id)}
                                                        style={styles.deleteButton}
                                                    >
                                                        Delete
                                                    </LoadingButton>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" style={styles.emptyRow}>No data available</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div style={styles.downloadContainer}>
                            <LoadingButton onClick={handleDownload} style={styles.downloadButton}>
                                Download
                            </LoadingButton>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminDetails;
