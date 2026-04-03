import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Headadmin-Navbar';
import AdminNavbar from '../../components/Navbar/Admin-Navbar';
import DatePicker from 'react-datepicker';
import { format } from 'date-fns';
import { FaDownload, FaSearch, FaFilter, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import 'react-datepicker/dist/react-datepicker.css';
import './AdminTransaction.css';

const Transaction = () => {
    const [data, setData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [filteredData, setFilteredData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [isLoading, setIsLoading] = useState(false);
    const [showDateFilter, setShowDateFilter] = useState(false);
    const navigate = useNavigate();
    const role = localStorage.getItem('role');

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('YOUR_API_ENDPOINT');
            if (!response.ok) throw new Error('Network response was not ok');
            const result = await response.json();
            setData(result);
            setFilteredData(result);
            setCurrentPage(1);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const query = searchTerm.toLowerCase();
        const updatedFilteredData = data.filter(row => {
            const withinDateRange = (!fromDate || new Date(row.datetime) >= fromDate) &&
                                    (!toDate || new Date(row.datetime) <= toDate);
            return withinDateRange &&
                (row.deviceId.toLowerCase().includes(query) ||
                 row.emailid.toLowerCase().includes(query) ||
                 row.txnid.toLowerCase().includes(query));
        });
        setFilteredData(updatedFilteredData);
        setCurrentPage(1);
    }, [searchTerm, fromDate, toDate, data]);

    const handleDownload = () => {
        console.log('Download clicked');
    };

    const handleClearFilters = () => {
        setFromDate(null);
        setToDate(null);
        setSearchTerm('');
    };

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(Math.max(1, Math.min(pageNumber, totalPages)));
    };

    return (
        <div className="transaction-wrapper">
            {role === 'headadmin' ? <Navbar /> : <AdminNavbar />}
            <div className="transaction-container">
                {/* Header Section */}
                <div className="transaction-header">
                    <div>
                        <h1 className="transaction-title">Transactions</h1>
                        <p className="transaction-subtitle">View and manage all transaction records</p>
                    </div>
                </div>

                {/* Controls Section */}
                <div className="transaction-controls">
                    <div className="controls-left">
                        <div className="search-wrapper">
                            <FaSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search by Device ID, Phone, or TXN ID..."
                                className="search-input"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button 
                            className="filter-toggle-button"
                            onClick={() => setShowDateFilter(!showDateFilter)}
                        >
                            <FaFilter className="button-icon" />
                            Filters
                        </button>
                    </div>
                    <button className="download-button" onClick={handleDownload}>
                        <FaDownload className="button-icon" />
                        Export to Excel
                    </button>
                </div>

                {/* Date Filter Section */}
                {showDateFilter && (
                    <div className="date-filter-section">
                        <div className="filter-content">
                            <div className="filter-group">
                                <label className="filter-label">From Date</label>
                                <DatePicker
                                    selected={fromDate}
                                    onChange={(date) => setFromDate(date)}
                                    dateFormat="MM/dd/yyyy"
                                    className="filter-date-input"
                                    placeholderText="Select from date"
                                />
                            </div>
                            <div className="filter-group">
                                <label className="filter-label">To Date</label>
                                <DatePicker
                                    selected={toDate}
                                    onChange={(date) => setToDate(date)}
                                    dateFormat="MM/dd/yyyy"
                                    className="filter-date-input"
                                    placeholderText="Select to date"
                                />
                            </div>
                            <button className="clear-filters-button" onClick={handleClearFilters}>
                                Clear Filters
                            </button>
                        </div>
                    </div>
                )}

                {/* Table Section */}
                <div className="table-wrapper">
                    {isLoading ? (
                        <div className="loading-message">Loading transaction data...</div>
                    ) : filteredData.length === 0 ? (
                        <div className="empty-message">No transactions found</div>
                    ) : (
                        <>
                            <div className="table-scroll-container">
                                <table className="transaction-table">
                                    <thead>
                                        <tr className="table-header-row">
                                            <th className="table-header">S.No</th>
                                            <th className="table-header">DateTime</th>
                                            <th className="table-header">Device ID</th>
                                            <th className="table-header">Phone No</th>
                                            <th className="table-header">Plan Name</th>
                                            <th className="table-header">Total Cost</th>
                                            <th className="table-header">TXN ID</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedData.map((row, index) => (
                                            <tr key={index} className="table-data-row">
                                                <td className="table-data">{startIndex + index + 1}</td>
                                                <td className="table-data">{row.datetime}</td>
                                                <td className="table-data device-id">{row.deviceId}</td>
                                                <td className="table-data phone">{row.phoneno}</td>
                                                <td className="table-data plan-name">{row.planname}</td>
                                                <td className="table-data cost-value">₹{row.totalcost}</td>
                                                <td className="table-data txn-id">{row.txnid}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Section */}
                            <div className="pagination-section">
                                <div className="pagination-info">
                                    <span className="record-count">
                                        Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} transactions
                                    </span>
                                    <div className="items-per-page">
                                        <label htmlFor="items-select">Items per page:</label>
                                        <select 
                                            id="items-select"
                                            className="items-select"
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
                                        </select>
                                    </div>
                                </div>

                                <div className="pagination-controls">
                                    <button 
                                        className="pagination-button"
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                    >
                                        <FaChevronLeft />
                                        Previous
                                    </button>

                                    <div className="pagination-numbers">
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
                                                <button
                                                    key={pageNum}
                                                    className={`page-number ${currentPage === pageNum ? 'active' : ''}`}
                                                    onClick={() => handlePageChange(pageNum)}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <button 
                                        className="pagination-button"
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                    >
                                        Next
                                        <FaChevronRight />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Transaction;
