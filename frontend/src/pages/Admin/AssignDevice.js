import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getallCustomer } from '../../services/customerService';
import { getAllDevices, updateDevice } from '../../services/deviceService';
import { getUserById } from '../../services/userService';
import { useSelector } from 'react-redux';
import LoadingButton from '../../components/Loading/LoadingButton';
import Navbar from '../../components/Navbar/Headadmin-Navbar';
import AdminNavbar from '../../components/Navbar/Admin-Navbar';

const AssignDevice = () => {
    const [allDevices, setAllDevices] = useState([]);
    const [availableDevices, setAvailableDevices] = useState([]);
    const [assignedDevices, setAssignedDevices] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [assigning, setAssigning] = useState(false);
    const [assignedUsers, setAssignedUsers] = useState({});
    const [loadingUsers, setLoadingUsers] = useState(false);
    const navigate = useNavigate();
    const { token } = useSelector(state => state.auth);
    const role = localStorage.getItem('role');
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [devicesData, customersData] = await Promise.all([
                    getAllDevices(token),
                    getallCustomer(token)
                ]);
                
                setAllDevices(devicesData);
                
                // More permissive filtering - consider a device available if:
                // - user_id is missing, null, undefined, empty string
                // - or status is 'Available'
                const unassignedDevices = devicesData.filter(device => 
                    !device.user_id || 
                    device.user_id === "" || 
                    device.user_id === null ||
                    device.user_id === undefined ||
                    device.status === 'Available'
                );
                
                const userAssignedDevices = devicesData.filter(device => 
                    device.user_id && 
                    device.user_id !== "" && 
                    device.user_id !== null &&
                    device.user_id !== undefined &&
                    device.status !== 'Available'
                );
                
                setAvailableDevices(unassignedDevices);
                setAssignedDevices(userAssignedDevices);
                
                // Fetch users data for assigned devices
                setLoadingUsers(true);
                if (userAssignedDevices.length > 0) {
                    const usersObj = {};
                    const userIdsToFetch = userAssignedDevices
                        .filter(d => d.user_id && d.user_id !== "" && d.user_id !== null)
                        .map(d => d.user_id);
                    
                    // Remove duplicates from userIdsToFetch
                    const uniqueUserIds = [...new Set(userIdsToFetch)];
                    
                    // Fetch user data for each assigned device
                    try {
                        await Promise.all(
                            uniqueUserIds.map(async (userId) => {
                                try {
                                    const userData = await getUserById(token, userId);
                                    console.log(`User data for ${userId}:`, userData);
                                    // The customer API returns the full user object directly
                                    if (userData && userData.username) {
                                        usersObj[userId] = userData.username;
                                    } else {
                                        usersObj[userId] = 'Unknown User';
                                    }
                                } catch (error) {
                                    console.error(`Error fetching user ${userId}:`, error);
                                    usersObj[userId] = 'Unknown User';
                                }
                            })
                        );
                    } catch (error) {
                        console.error('Error fetching user data:', error);
                    }
                    
                    setAssignedUsers(usersObj);
                }
                setLoadingUsers(false);
                
                setCustomers(customersData);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [token]);

    const openAssignModal = (device) => {
        // Only open modal for devices that can be assigned
        const isAssignable = !device.user_id || 
            device.user_id === "" || 
            device.user_id === null ||
            device.user_id === undefined ||
            device.status === 'Available';
            
        if (isAssignable) {
            setSelectedDevice(device);
            setSelectedCustomerId('');
        } else {
            alert('This device is already assigned and cannot be reassigned.');
        }
    };

    const closeAssignModal = () => {
        setSelectedDevice(null);
        setSelectedCustomerId('');
    };

    const handleCustomerChange = (e) => {
        setSelectedCustomerId(e.target.value);
    };

    const handleAssign = async () => {
        if (!selectedDevice || !selectedCustomerId) {
            alert("Please select a customer to assign the device to");
            return;
        }

        setAssigning(true);
        try {
            // Find the selected customer to get their phone number
            const customer = customers.find(c => c._id === selectedCustomerId);
            
            if (!customer) {
                alert("Selected customer not found");
                return;
            }
            
            // Prepare the device update data
            const deviceUpdateData = {
                user_id: selectedCustomerId,
                organization_id: customer.organization || null,
                deviceId: selectedDevice.deviceId,
                macAddress: selectedDevice.macAddress,
                device_plan: selectedDevice.device_plan,
                status: 'Active', // Change status to Active when assigned
                expiry: selectedDevice.expiry,
                phone_no: customer.phoneNo // Use customer's phone number
            };

            // Update the device with the new user_id
            await updateDevice(token, selectedDevice._id, deviceUpdateData);
            
            alert('Device assigned successfully to customer');
            
            // Close the assignment modal
            closeAssignModal();
            
            // Refresh the page to get updated data
            window.location.reload();
            
        } catch (error) {
            console.error('Error assigning device:', error);
            alert('Failed to assign device: ' + (error.message || 'Unknown error'));
        } finally {
            setAssigning(false);
        }
    };

    if (loading) {
        return <div>Loading available devices and customers...</div>;
    }

    // Combine available devices at top, followed by assigned devices
    const combinedDevices = [...availableDevices, ...assignedDevices];

    return (
        <div>
            {role === 'headadmin' ? <Navbar /> : <AdminNavbar />}
            <div style={styles.container}>
                <h2 style={styles.header}>Device Assignment</h2>
                
                {combinedDevices.length === 0 ? (
                    <div style={styles.noDevices}>
                        <p>No devices found in the system.</p>
                        {role === 'headadmin' && (
                            <button 
                                onClick={() => navigate('/headadmin/createDevice')}
                                style={styles.createButton}
                            >
                                Create New Device
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div style={styles.deviceList}>
                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        <th style={styles.th}>Device ID</th>
                                        <th style={styles.th}>MAC Address</th>
                                        <th style={styles.th}>Plan</th>
                                        <th style={styles.th}>Status</th>
                                        <th style={styles.th}>Assignment</th>
                                        <th style={styles.th}>Assigned To</th>
                                        <th style={styles.th}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {combinedDevices.map(device => {
                                        // Check if device is actually available for assignment
                                        const isAssignable = !device.user_id || 
                                            device.user_id === "" || 
                                            device.user_id === null ||
                                            device.user_id === undefined ||
                                            device.status === 'Available';
                                        
                                        const assignedUserName = device.user_id && assignedUsers[device.user_id] 
                                            ? assignedUsers[device.user_id] 
                                            : loadingUsers 
                                                ? 'Loading...' 
                                                : 'Unknown User';
                                            
                                        return (
                                            <tr key={device._id} style={isAssignable ? {} : styles.assignedRow}>
                                                <td style={styles.td}>{device.deviceId}</td>
                                                <td style={styles.td}>{device.macAddress}</td>
                                                <td style={styles.td}>{device.device_plan}</td>
                                                <td style={styles.td}>{device.status}</td>
                                                <td style={styles.td}>
                                                    {isAssignable ? 
                                                        <span style={styles.availableTag}>Available</span> : 
                                                        <span style={styles.assignedTag}>Assigned</span>
                                                    }
                                                </td>
                                                <td style={styles.td}>
                                                    {isAssignable ? 
                                                        '-' : 
                                                        assignedUserName
                                                    }
                                                </td>
                                                <td style={styles.td}>
                                                    <button 
                                                        onClick={() => openAssignModal(device)}
                                                        style={isAssignable ? styles.assignButton : styles.disabledAssignButton}
                                                        disabled={!isAssignable}
                                                    >
                                                        {isAssignable ? 'Assign' : 'Already Assigned'}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Assignment Modal */}
                        {selectedDevice && (
                            <div style={styles.modalOverlay}>
                                <div style={styles.modal}>
                                    <h3 style={styles.modalHeader}>Assign Device</h3>
                                    
                                    <div style={styles.deviceInfo}>
                                        <p><strong>Device ID:</strong> {selectedDevice.deviceId}</p>
                                        <p><strong>MAC Address:</strong> {selectedDevice.macAddress}</p>
                                        <p><strong>Plan:</strong> {selectedDevice.device_plan}</p>
                                    </div>
                                    
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Select Customer to Assign</label>
                    <select
                                            value={selectedCustomerId}
                                            onChange={handleCustomerChange}
                                            style={styles.select}
                        required
                                        >
                                            <option value="">-- Select Customer --</option>
                                            {customers.map(customer => (
                                                <option key={customer._id} value={customer._id}>
                                                    {customer.username} - {customer.phoneNo}
                            </option>
                        ))}
                    </select>
                                    </div>
                                    
                                    <div style={styles.modalButtons}>
                                        <button 
                                            onClick={closeAssignModal} 
                                            style={styles.cancelButton}
                                        >
                                            Cancel
                                        </button>
                    <LoadingButton 
                                            isLoading={assigning}
                                            onClick={handleAssign}
                                            disabled={!selectedCustomerId}
                                            style={selectedCustomerId ? styles.confirmButton : styles.disabledButton}
                        loadingText="Assigning..."
                    >
                        Assign Device
                    </LoadingButton>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '90%',
        margin: '0 auto',
        padding: '20px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
        marginTop: '20px',
    },
    header: {
        textAlign: 'center',
        color: '#333',
        marginBottom: '20px',
    },
    noDevices: {
        textAlign: 'center',
        padding: '30px',
        color: '#666',
    },
    createButton: {
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
        marginTop: '10px',
    },
    deviceList: {
        overflowX: 'auto',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    th: {
        backgroundColor: '#007bff',
        color: 'white',
        padding: '12px',
        textAlign: 'left',
        border: '1px solid #dee2e6',
    },
    td: {
        padding: '12px',
        border: '1px solid #dee2e6',
    },
    assignButton: {
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        padding: '8px 12px',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    assignedRow: {
        backgroundColor: '#f8f9fa',
    },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    modal: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '500px',
        boxShadow: '0 0 20px rgba(0,0,0,0.2)',
    },
    modalHeader: {
        textAlign: 'center',
        marginBottom: '20px',
        color: '#333',
    },
    deviceInfo: {
        backgroundColor: '#f8f9fa',
        padding: '15px',
        borderRadius: '4px',
        marginBottom: '20px',
    },
    formGroup: {
        marginBottom: '20px',
    },
    label: {
        display: 'block',
        marginBottom: '5px',
        fontWeight: 'bold',
    },
    select: {
        width: '100%',
        padding: '10px',
        borderRadius: '4px',
        border: '1px solid #ddd',
    },
    modalButtons: {
        display: 'flex',
        justifyContent: 'space-between',
    },
    cancelButton: {
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        padding: '10px 15px',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    confirmButton: {
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        padding: '10px 15px',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    disabledButton: {
        backgroundColor: '#cccccc',
        color: '#666666',
        border: 'none',
        padding: '10px 15px',
        borderRadius: '4px',
        cursor: 'not-allowed',
    },
    availableTag: {
        backgroundColor: '#dff0d8',
        color: '#28a745',
        padding: '2px 5px',
        borderRadius: '4px',
    },
    assignedTag: {
        backgroundColor: '#f8d7da',
        color: '#dc3545',
        padding: '2px 5px',
        borderRadius: '4px',
    },
    disabledAssignButton: {
        backgroundColor: '#cccccc',
        color: '#666666',
        border: 'none',
        padding: '8px 12px',
        borderRadius: '4px',
        cursor: 'not-allowed',
    }
};

export default AssignDevice;
