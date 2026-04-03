import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAdmin } from '../../services/adminService';
import { useSelector } from 'react-redux';
import Navbar from '../../components/Navbar/Headadmin-Navbar';
import AdminNavbar from '../../components/Navbar/Admin-Navbar';

const styles = {
    page: {
        fontFamily: 'Arial, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: '#f4f7fc',
        minHeight: '80vh',
        padding: '20px',
    },
    content: {
        width: '80%',
        maxWidth: '900px',
        background: '#fff',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
    },
    header: {
        textAlign: 'center',
        marginBottom: '20px',
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#333',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
    },
    inputGroup: {
        display: 'flex',
        gap: '10px',
    },
    input: {
        width: '100%',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '5px',
        fontSize: '16px',
    },
    permissionHeading: {
        textAlign: 'center',
        fontSize: '24px',
        fontWeight: 'bold',
        margin: '20px 0 10px 0',
        color: '#000',
    },
    permissionContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        background: '#ffffff',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)',
    },
    permissionSection: {
        textAlign: 'center',
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#000',
        marginBottom: '10px',
    },
    permissionRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
    },
    checkboxContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '8px 12px',
        border: '1px solid #ccc',
        borderRadius: '5px',
        cursor: 'pointer',
        transition: 'background 0.2s ease-in-out',
    },
    checkbox: {
        width: '18px',
        height: '18px',
        border: '2px solid #000',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        fontWeight: 'bold',
    },
    button: {
        background: '#000',
        color: '#fff',
        padding: '10px 15px',
        fontSize: '16px',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        marginTop: '10px',
    },
};

const CreateAdmin = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phoneNo: '',
        location: '',
        password: '',
        confirmPassword: '',
        adminPermissions: [],
        planPermissions: [],
        devicePermissions: [],
        assignPermissions: '',
    });

    const navigate = useNavigate();
    const { token } = useSelector(state => state.auth);
    const role = localStorage.getItem('role');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePermissionChange = (type, action) => {
        if (type === 'assign') {
            setFormData({ ...formData, assignPermissions: action });
        } else {
            setFormData((prev) => {
                const key = `${type}Permissions`;
                const permissions = prev[key] || [];

                let updatedPermissions;
                if (action === 'All') {
                    updatedPermissions = permissions.length === 3 ? [] : ['Create', 'Edit', 'Delete'];
                } else {
                    updatedPermissions = permissions.includes(action)
                        ? permissions.filter((perm) => perm !== action)
                        : [...permissions, action];
                }

                return { ...prev, [key]: updatedPermissions };
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert('Password and Confirm Password do not match');
            return;
        }
        try {
            await createAdmin(token, formData);
            alert('Admin created successfully');
            navigate('/superadmin/admininfo');
        } catch (error) {
            console.error('Error creating Admin:', error);
            alert('Failed to create Admin');
        }
    };

    return (
        <div style={styles.page}>
            {role === 'headadmin' ? <Navbar /> : <AdminNavbar />}
            <div style={styles.content}>
                <h2 style={styles.header}>Create New Admin</h2>
                <form onSubmit={handleSubmit} style={styles.form}>

                    <div style={styles.inputGroup}>
                        <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Name" required style={styles.input} />
                        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required style={styles.input} />
                    </div>
                    <div style={styles.inputGroup}>
                        <input type="tel" name="phoneNo" value={formData.phoneNo} onChange={handleChange} placeholder="Phone Number" required style={styles.input} />
                        <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Location" required style={styles.input} />
                    </div>
                    <div style={styles.inputGroup}>
                        <input 
                            type="password" 
                            name="password" 
                            value={formData.password}  
                            onChange={handleChange} 
                            placeholder="Password" 
                            required 
                            style={styles.input} 
                        />
                        <input 
                            type="password"  
                            name="confirmPassword" 
                            value={formData.confirmPassword}  
                            onChange={handleChange} 
                            placeholder="Confirm Password" 
                            required 
                            style={styles.input} 
                        />
                    </div>

                    <div style={styles.permissionHeading}>Permissions</div>

                    <div style={styles.permissionContainer}>
                        {['admin', 'plan', 'device'].map((type) => {
                            const key = `${type}Permissions`;
                            const permissions = formData[key] || [];

                            return (
                                <div key={type}>
                                    <div style={styles.permissionSection}>
                                        {type.charAt(0).toUpperCase() + type.slice(1)} Permissions
                                    </div>
                                    <div style={styles.permissionRow}>
                                        {['All', 'Create', 'Edit', 'Delete'].map((action) => (
                                            <div key={action} style={styles.checkboxContainer} onClick={() => handlePermissionChange(type, action)}>
                                                <div style={styles.checkbox}>{permissions.includes(action) || (action === 'All' && permissions.length === 3) ? '✓' : ''}</div>
                                                {action}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}

                        <div>
                            <div style={styles.permissionSection}>Assign Permissions</div>
                            <div style={styles.permissionRow}>
                                {['Yes', 'No'].map((option) => (
                                    <div key={option} style={styles.checkboxContainer} onClick={() => handlePermissionChange('assign', option)}>
                                        <div style={styles.checkbox}>{formData.assignPermissions === option ? '✓' : ''}</div>
                                        {option}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button type="submit" style={styles.button}>Create Admin</button>
                </form>
            </div>
        </div>
    );
};

export default CreateAdmin;
