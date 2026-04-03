import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import axios from 'axios'; // Import axios for API calls

const AdminRecharge = () => {
    const [deviceId, setDeviceId] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [selectedLiters, setSelectedLiters] = useState('');
    const [totalCost, setTotalCost] = useState('Select liters to see cost');
    const [transactionDetails, setTransactionDetails] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate(); // Initialize useNavigate

    const handleLitersChange = (event) => {
        const liters = event.target.value;
        setSelectedLiters(liters);

        if (liters) {
            const cost = liters; // 1 liter = 1 Rs
            setTotalCost(`Total Cost: ${cost} Rs`);
        } else {
            setTotalCost('Select liters to see cost');
        }
    };

    const handlePhoneNumberChange = (event) => {
        const sanitizedPhoneNumber = event.target.value.replace(/\D/g, '');
        setPhoneNumber(sanitizedPhoneNumber);
    };

    const handleTransactionClick = async () => {
        const deviceIdValid = /^\d+$/.test(deviceId);
        const phoneNumberValid = /^\d{8,13}$/.test(phoneNumber);

        if (!deviceIdValid) {
            setErrorMessage('Please enter a valid Device ID (only numbers).');
            return;
        }

        if (!phoneNumberValid) {
            setErrorMessage('Please enter a valid Phone Number (8-13 digits).');
            return;
        }

        if (selectedLiters) {
            const cost = selectedLiters; // 1 liter = 1 Rs

            // Prepare the transaction data
            const transactionData = {
                deviceId,
                phoneNumber,
                selectedLiters,
                totalCost: cost,
            };

            try {
                // Make an API call to submit the transaction
                const response = await axios.post('YOUR_API_ENDPOINT', transactionData);
                console.log(response.data); // Check the response from the API

                // Set transaction details
                setTransactionDetails(`
          Device ID: ${deviceId}<br>
          Phone Number: ${phoneNumber}<br>
          Selected Liters: ${selectedLiters}<br>
          Total Cost: ${cost} Rs
        `);

                // Redirect to admin after the transaction is processed
                navigate('/admin');
            } catch (error) {
                console.error('Error processing transaction:', error);
                setErrorMessage('Transaction failed. Please try again.');
            }
        } else {
            setErrorMessage('Please select the number of liters.');
        }
    };

    const styles = {
        container: {
            width: '100%',
            maxWidth: '600px',
            padding: '2rem',
            backgroundColor: '#fff',
            borderRadius: '0.75rem',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        },
        formGroup: {
            width: '100%',
            marginBottom: '1rem',
        },
        inputField: {
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #D1D5DB',
            borderRadius: '0.75rem',
            fontSize: '1rem',
        },
        selectBox: {
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #D1D5DB',
            borderRadius: '0.75rem',
            fontSize: '1rem',
            backgroundColor: '#fff',
            cursor: 'pointer',
        },
        totalCost: {
            marginTop: '1rem',
            fontSize: '1.25rem',
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #D1D5DB',
            borderRadius: '0.75rem',
        },
        transactionDetails: {
            marginTop: '1rem',
            textAlign: 'center',
            fontSize: '1.25rem',
            color: '#1F2937',
        },
        errorMessage: {
            color: 'red',
            fontSize: '1rem',
            marginTop: '1rem',
        },
        buttonContainer: {
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
            marginTop: '1rem',
        },
        btn: {
            backgroundColor: '#1F2937',
            color: '#ffffff',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.75rem',
            fontSize: '1rem',
            cursor: 'pointer',
            border: 'none',
            transition: 'background-color 0.3s ease, transform 0.2s ease',
        },
        btnHover: {
            backgroundColor: '#0F172A',
            transform: 'scale(1.02)',
        },
        btnActive: {
            transform: 'scale(0.98)',
        },
    };

    return (
        <div style={styles.container}>
            <h1>Recharge</h1>
            <div style={styles.formGroup}>
                <input
                    type="number"
                    style={styles.inputField}
                    placeholder="Enter Device ID"
                    min="0"
                    value={deviceId}
                    onChange={(e) => setDeviceId(e.target.value)}
                    required
                />
            </div>
            <div style={styles.formGroup}>
                <input
                    type="tel"
                    style={styles.inputField}
                    placeholder="Enter Phone Number"
                    pattern="\d{8,13}"
                    title="Phone number should be between 8 and 13 digits"
                    value={phoneNumber}
                    onChange={handlePhoneNumberChange}
                    required
                />
            </div>
            <div style={styles.formGroup}>
                <select
                    style={styles.selectBox}
                    value={selectedLiters}
                    onChange={handleLitersChange}
                >
                    <option value="" disabled>
                        Select liters
                    </option>
                    <option value="5">5 Liters</option>
                    <option value="10">10 Liters</option>
                    <option value="15">15 Liters</option>
                    <option value="20">20 Liters</option>
                    <option value="25">25 Liters</option>
                    <option value="30">30 Liters</option>
                    <option value="35">35 Liters</option>
                    <option value="40">40 Liters</option>
                    <option value="45">45 Liters</option>
                    <option value="50">50 Liters</option>
                </select>
            </div>
            <div style={styles.formGroup}>
                <div style={styles.totalCost}>{totalCost}</div>
            </div>
            <div style={styles.buttonContainer}>
                <button
                    style={styles.btn}
                    onMouseDown={(e) => (e.target.style.transform = styles.btnActive.transform)}
                    onMouseUp={(e) => (e.target.style.transform = styles.btnHover.transform)}
                    onClick={handleTransactionClick}
                    onMouseEnter={(e) => (e.target.style.backgroundColor = styles.btnHover.backgroundColor)}
                    onMouseLeave={(e) => (e.target.style.backgroundColor = styles.btn.backgroundColor)}
                >
                    Transaction
                </button>
            </div>
            <div
                style={styles.transactionDetails}
                dangerouslySetInnerHTML={{ __html: transactionDetails }}
            />
            {errorMessage && <div style={styles.errorMessage}>{errorMessage}</div>}
        </div>
    );
};

export default AdminRecharge;
