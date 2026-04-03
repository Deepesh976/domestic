import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { getAllLiveData } from "../../services/liveDataService";
import Navbar from '../../components/Navbar/Headadmin-Navbar';
import AdminNavbar from '../../components/Navbar/Admin-Navbar';
import { FaDownload, FaSearch, FaFilter } from "react-icons/fa";
import "./AdminConsumption.css";

const AdminConsumption = () => {
    const [tableData, setTableData] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [filteredData, setFilteredData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showDateFilter, setShowDateFilter] = useState(false);
    const { token } = useSelector(state => state.auth);
    const role = localStorage.getItem('role');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const response = await getAllLiveData(token);
                setTableData(response);
                setFilteredData(response);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [token]);

    useEffect(() => {
        let data = [...tableData];

        if (searchQuery) {
            data = data.filter((item) =>
                item.device_id.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (dateFrom || dateTo) {
            data = data.filter((item) => {
                const itemDate = new Date(item.datetime);
                const fromDate = dateFrom ? new Date(dateFrom) : null;
                const toDate = dateTo ? new Date(dateTo) : null;

                if (fromDate && itemDate < fromDate) return false;
                if (toDate && itemDate > toDate) return false;
                return true;
            });
        }

        setFilteredData(data);
    }, [searchQuery, tableData, dateFrom, dateTo]);

    const handleDownloadExcel = () => {
        console.log("Download Excel clicked");
    };

    const handleClearFilters = () => {
        setDateFrom("");
        setDateTo("");
        setSearchQuery("");
    };

    return (
        <div className="admin-consumption-wrapper">
            {role === 'headadmin' ? <Navbar /> : <AdminNavbar />}
            <div className="admin-consumption-container">
                {/* Controls Section */}
                <div className="consumption-controls">
                    <div className="controls-left">
                        <div className="search-wrapper">
                            <FaSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search by Device ID"
                                className="search-input"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
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
                    <button className="download-button" onClick={handleDownloadExcel}>
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
                                <input
                                    type="datetime-local"
                                    className="filter-input"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                />
                            </div>
                            <div className="filter-group">
                                <label className="filter-label">To Date</label>
                                <input
                                    type="datetime-local"
                                    className="filter-input"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                />
                            </div>
                            <button className="clear-filters-button" onClick={handleClearFilters}>
                                Clear Filters
                            </button>
                        </div>
                    </div>
                )}

                {/* Table Section with Header */}
                <div className="table-wrapper">
                    {/* Header inside table wrapper */}
                    <div className="consumption-header">
                        <div>
                            <h1 className="consumption-title">Total Consumption</h1>
                            <p className="consumption-subtitle">Monitor and track device water consumption data</p>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="loading-message">Loading consumption data...</div>
                    ) : filteredData.length === 0 ? (
                        <div className="empty-message">No consumption data found</div>
                    ) : (
                        <>
                            <table className="consumption-table">
                                <thead>
                                    <tr className="table-header-row">
                                        <th className="table-header">S.No</th>
                                        <th className="table-header">Device ID</th>
                                        <th className="table-header">DateTime</th>
                                        <th className="table-header">Current Plan</th>
                                        <th className="table-header">Total Liters</th>
                                        <th className="table-header">Total Cost</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.map((row, index) => (
                                        <tr key={index} className="table-data-row">
                                            <td className="table-data">{index + 1}</td>
                                            <td className="table-data device-id">{row.device_id.slice(-5)}</td>
                                            <td className="table-data">{row.datetime}</td>
                                            <td className="table-data">{row.current_plan}</td>
                                            <td className="table-data liters-value">{row.total_liters}</td>
                                            <td className="table-data cost-value">₹{row.cost}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Footer Info */}
                            {filteredData.length > 0 && (
                                <div className="consumption-footer">
                                    <span className="record-count">Total Records: {filteredData.length}</span>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminConsumption;
