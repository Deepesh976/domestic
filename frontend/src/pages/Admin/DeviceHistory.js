import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAllLiveData } from '../../services/liveDataService';
import { FiArrowLeft, FiDownload, FiRefreshCw, FiFilter, FiSearch, FiX } from 'react-icons/fi';
import { BiWater, BiDollar, BiTrendingUp, BiBarChart, BiDroplet } from 'react-icons/bi';
import { MdShowChart, MdTrendingDown } from 'react-icons/md';
import * as XLSX from 'xlsx';
import Navbar from '../../components/Navbar/Admin-Navbar';

const DeviceHistory = () => {
    const { deviceId } = useParams();
    const navigate = useNavigate();
    const role = localStorage.getItem('role');
    const [liveDataHistory, setLiveDataHistory] = useState([]);
    const [filteredHistory, setFilteredHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilterFrom, setDateFilterFrom] = useState('');
    const [dateFilterTo, setDateFilterTo] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [refreshing, setRefreshing] = useState(false);
    const [isPurifierModalOpen, setIsPurifierModalOpen] = useState(false);
    const token = localStorage.getItem('token');
    const itemsPerPage = 12;

    useEffect(() => {
        fetchDeviceHistory();
    }, [deviceId, token]);

    useEffect(() => {
        filterData();
    }, [liveDataHistory, searchQuery, dateFilterFrom, dateFilterTo, statusFilter]);

    const filterData = () => {
        let filtered = liveDataHistory;

        if (searchQuery) {
            filtered = filtered.filter(item =>
                (item.current_plan?.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (item.status?.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (item.tds?.toString().includes(searchQuery))
            );
        }

        if (dateFilterFrom || dateFilterTo) {
            filtered = filtered.filter(item => {
                const itemDate = new Date(item.updated_at);
                const fromDate = dateFilterFrom ? new Date(dateFilterFrom) : null;
                const toDate = dateFilterTo ? new Date(dateFilterTo) : null;

                if (fromDate && itemDate < fromDate) return false;
                if (toDate) {
                    toDate.setHours(23, 59, 59, 999);
                    if (itemDate > toDate) return false;
                }
                return true;
            });
        }

        if (statusFilter) {
            filtered = filtered.filter(item =>
                item.status?.toLowerCase() === statusFilter.toLowerCase()
            );
        }

        setFilteredHistory(filtered);
        setCurrentPage(1);
    };

    const fetchDeviceHistory = async () => {
        try {
            setLoading(true);
            const data = await getAllLiveData(token);
            
            const filteredData = data.filter(item => 
                item.device_id === deviceId || item.device_id?._id === deviceId
            ).sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
            
            setLiveDataHistory(filteredData);
            setError(null);
        } catch (err) {
            console.error('Error fetching device history:', err);
            setError('Failed to load device history');
            setLiveDataHistory([]);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchDeviceHistory();
        setRefreshing(false);
    };

    const handleDownload = () => {
        try {
            const dataToExport = filteredHistory.map(item => ({
                'Timestamp': new Date(item.updated_at).toLocaleString(),
                'Current Plan': item.current_plan || '-',
                'Liters Remaining': item.liters_remaining || '-',
                'Total Liters': item.total_liters || '-',
                'TDS': item.tds || '-',
                'Cost (₹)': item.cost || '-',
                'Deregistered At': item.deregistered_at ? new Date(item.deregistered_at).toLocaleDateString() : '-',
                'Status': item.status || '-'
            }));

            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Device History');

            const cols = [
                { wch: 20 },
                { wch: 15 },
                { wch: 18 },
                { wch: 15 },
                { wch: 10 },
                { wch: 12 },
                { wch: 16 },
                { wch: 12 }
            ];
            worksheet['!cols'] = cols;

            XLSX.writeFile(workbook, `device_history_${deviceId}_${new Date().toISOString().split('T')[0]}.xlsx`);
        } catch (err) {
            console.error('Error downloading file:', err);
        }
    };

    const paginatedData = filteredHistory.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );
    const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);

    const avgTDS = filteredHistory.length > 0
        ? (filteredHistory.reduce((sum, r) => sum + (r.tds || 0), 0) / filteredHistory.length).toFixed(1)
        : 0;

    const totalCost = filteredHistory.length > 0
        ? filteredHistory.reduce((sum, r) => sum + (r.cost || 0), 0).toFixed(2)
        : 0;

    return (
        <div style={styles.pageContainer}>
            <Navbar />
            <div style={styles.mainContent}>
                {/* Header Section */}
                <div style={styles.headerSection}>
                    <button
                        onClick={() => navigate(`/${role}/deviceinfo`)}
                        style={styles.backButton}
                    >
                        <FiArrowLeft />
                    </button>
                    <div style={styles.headerTitle}>
                        <h1 style={styles.pageTitle}>Device History</h1>
                    </div>
                    <div style={styles.headerActions}>
                        <div style={styles.deviceBadge}>
                            <span style={styles.deviceLabel}>Device ID</span>
                            <span style={styles.deviceValue}>{deviceId}</span>
                        </div>
                        <button
                            onClick={handleRefresh}
                            style={{
                                ...styles.actionButton,
                                ...styles.refreshButton
                            }}
                            disabled={refreshing}
                        >
                            <FiRefreshCw style={{
                                animation: refreshing ? 'spin 1s linear infinite' : 'none'
                            }} />
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div style={styles.loadingContainer}>
                        <div style={styles.spinner}></div>
                        <p style={styles.loadingText}>Loading device history...</p>
                    </div>
                ) : error ? (
                    <div style={styles.errorContainer}>
                        <p style={styles.errorText}>⚠️ {error}</p>
                    </div>
                ) : (
                    <>
                        {/* Stats Cards */}
                        {filteredHistory.length > 0 && (
                            <div style={styles.statsGrid}>
                                <div style={styles.statCard}>
                                    <div style={{...styles.statIcon, backgroundColor: '#e3f2fd'}}>
                                        <BiBarChart size={24} color="#1976d2" />
                                    </div>
                                    <div style={styles.statContent}>
                                        <p style={styles.statLabel}>Total Records</p>
                                        <p style={styles.statValue}>{liveDataHistory.length}</p>
                                    </div>
                                </div>

                                <div style={styles.statCard}>
                                    <div style={{...styles.statIcon, backgroundColor: '#f3e5f5'}}>
                                        <BiTrendingUp size={24} color="#7b1fa2" />
                                    </div>
                                    <div style={styles.statContent}>
                                        <p style={styles.statLabel}>Filtered Records</p>
                                        <p style={styles.statValue}>{filteredHistory.length}</p>
                                    </div>
                                </div>

                                <div style={styles.statCard}>
                                    <div style={{...styles.statIcon, backgroundColor: '#fce4ec'}}>
                                        <BiWater size={24} color="#c2185b" />
                                    </div>
                                    <div style={styles.statContent}>
                                        <p style={styles.statLabel}>Avg TDS</p>
                                        <p style={styles.statValue}>{avgTDS}</p>
                                    </div>
                                </div>

                                <div style={styles.statCard}>
                                    <div style={{...styles.statIcon, backgroundColor: '#f1f8e9'}}>
                                        <BiDollar size={24} color="#558b2f" />
                                    </div>
                                    <div style={styles.statContent}>
                                        <p style={styles.statLabel}>Total Cost</p>
                                        <p style={styles.statValue}>₹{totalCost}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Controls Section */}
                        <div style={styles.controlsCard}>
                            <div style={styles.controlsHeader}>
                                <div style={styles.controlsHeaderLeft}>
                                    <FiFilter size={18} style={styles.filterHeaderIcon} />
                                    <span style={styles.controlsHeaderText}>Search & Filter</span>
                                </div>
                                <button
                                    onClick={() => setIsPurifierModalOpen(true)}
                                    style={styles.purifierButton}
                                >
                                    <BiDroplet size={18} />
                                    <span>Purifier</span>
                                </button>
                            </div>

                            <div style={styles.controlsContent}>
                                {/* Search Row */}
                                <div style={styles.filterRow}>
                                    <div style={styles.searchContainer}>
                                        <FiSearch style={styles.searchIcon} />
                                        <input
                                            type="text"
                                            placeholder="Search by plan, status, TDS..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            style={styles.searchInput}
                                        />
                                    </div>
                                </div>

                                {/* Filters and Download Row */}
                                <div style={styles.filterRow}>
                                    <div style={styles.dateFilterGroup}>
                                        <label style={styles.filterLabel}>From Date</label>
                                        <input
                                            type="date"
                                            value={dateFilterFrom}
                                            onChange={(e) => setDateFilterFrom(e.target.value)}
                                            style={styles.filterInput}
                                        />
                                    </div>

                                    <div style={styles.dateFilterGroup}>
                                        <label style={styles.filterLabel}>To Date</label>
                                        <input
                                            type="date"
                                            value={dateFilterTo}
                                            onChange={(e) => setDateFilterTo(e.target.value)}
                                            style={styles.filterInput}
                                        />
                                    </div>

                                    <div style={styles.statusFilterGroup}>
                                        <label style={styles.filterLabel}>Status</label>
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            style={styles.filterSelect}
                                        >
                                            <option value="">All Status</option>
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                        </select>
                                    </div>

                                    <button
                                        onClick={handleDownload}
                                        style={{
                                            ...styles.downloadButton,
                                            ...(filteredHistory.length === 0 ? styles.downloadButtonDisabled : {})
                                        }}
                                        disabled={filteredHistory.length === 0}
                                    >
                                        <FiDownload size={18} />
                                        <span>Download</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Table Section */}
                        <div style={styles.tableCard}>
                            <div style={styles.tableHeader}>
                                <h3 style={styles.tableTitle}>
                                    History Records {filteredHistory.length > 0 && `(${filteredHistory.length} total)`}
                                </h3>
                            </div>

                            <div style={styles.tableWrapper}>
                                <table style={styles.table}>
                                    <thead>
                                        <tr style={styles.tableHeadRow}>
                                            <th style={{...styles.tableTh, width: '10%'}}>S.No</th>
                                            <th style={{...styles.tableTh, width: '13%'}}>Total Usage</th>
                                            <th style={{...styles.tableTh, width: '13%'}}>Avg Usage</th>
                                            <th style={{...styles.tableTh, width: '12%'}}>Flow Sensor</th>
                                            <th style={{...styles.tableTh, width: '12%'}}>TDS High</th>
                                            <th style={{...styles.tableTh, width: '12%'}}>TDS Low</th>
                                            <th style={{...styles.tableTh, width: '13%'}}>Filter Life</th>
                                            <th style={{...styles.tableTh, width: '13%'}}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedData.length > 0 ? (
                                            paginatedData.map((record, index) => (
                                                <tr key={record._id || index} style={{
                                                    ...styles.tableBodyRow,
                                                    backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9f9f9'
                                                }}>
                                                    <td style={styles.tableTd}>
                                                        <span style={styles.serialNumber}>
                                                            {((currentPage - 1) * itemsPerPage) + index + 1}
                                                        </span>
                                                    </td>
                                                    <td style={styles.tableTd}>
                                                        <span style={styles.usageValue}>{record.total_liters || '-'}L</span>
                                                    </td>
                                                    <td style={styles.tableTd}>
                                                        <span style={styles.usageValue}>
                                                            {record.liters_remaining ? Math.round(record.liters_remaining / (paginatedData.length || 1) * 100) / 100 : '-'}L
                                                        </span>
                                                    </td>
                                                    <td style={styles.tableTd}>
                                                        <span style={styles.flowBadge}>{filteredHistory.length}</span>
                                                    </td>
                                                    <td style={styles.tableTd}>
                                                        <span style={getTDSHighStyle(Math.max(...filteredHistory.map(r => r.tds || 0)))}>
                                                            {Math.max(...filteredHistory.map(r => r.tds || 0)) || '-'}
                                                        </span>
                                                    </td>
                                                    <td style={styles.tableTd}>
                                                        <span style={getTDSLowStyle(Math.min(...filteredHistory.filter(r => r.tds).map(r => r.tds)))}>
                                                            {Math.min(...filteredHistory.filter(r => r.tds).map(r => r.tds)) || '-'}
                                                        </span>
                                                    </td>
                                                    <td style={styles.tableTd}>
                                                        <span style={styles.filterLifeBadge}>
                                                            {record.deregistered_at ? new Date(record.deregistered_at).toLocaleDateString() : 'Active'}
                                                        </span>
                                                    </td>
                                                    <td style={styles.tableTd}>
                                                        <span style={getStatusStyle(record.status)}>
                                                            {record.status || 'N/A'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="8" style={styles.emptyRow}>
                                                    <div style={styles.emptyStateContent}>
                                                        <p style={styles.emptyStateText}>No history found matching your filters</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination */}
                        {filteredHistory.length > itemsPerPage && (
                            <div style={styles.paginationSection}>
                                <p style={styles.paginationInfo}>
                                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredHistory.length)} of {filteredHistory.length} records
                                </p>
                                <div style={styles.paginationControls}>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        style={{...styles.paginationButton, opacity: currentPage === 1 ? 0.5 : 1}}
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
                                        style={{...styles.paginationButton, opacity: currentPage === totalPages ? 0.5 : 1}}
                                    >
                                        Next →
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Purifier Modal */}
                {isPurifierModalOpen && (
                    <div style={styles.modalOverlay} onClick={() => setIsPurifierModalOpen(false)}>
                        <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                            <div style={styles.modalHeader}>
                                <div style={styles.modalTitleContainer}>
                                    <BiDroplet size={28} style={styles.modalIcon} />
                                    <h2 style={styles.modalTitle}>Purifier Status</h2>
                                </div>
                                <button
                                    onClick={() => setIsPurifierModalOpen(false)}
                                    style={styles.modalCloseButton}
                                    aria-label="Close modal"
                                >
                                    <FiX size={24} />
                                </button>
                            </div>

                            <div style={styles.modalBody}>
                                <div style={styles.statsGridModal}>
                                    {/* Total Usage */}
                                    <div style={styles.statItemModal}>
                                        <div style={{...styles.statIconModal, backgroundColor: '#e3f2fd'}}>
                                            <BiWater size={28} color="#1976d2" />
                                        </div>
                                        <div style={styles.statTextModal}>
                                            <p style={styles.statLabelModal}>Total Usage</p>
                                            <p style={styles.statValueModal}>{liveDataHistory.length > 0 ? `${(liveDataHistory.reduce((sum, r) => sum + (r.total_liters || 0), 0) / liveDataHistory.length).toFixed(1)}L` : '-'}</p>
                                        </div>
                                    </div>

                                    {/* Avg Usage */}
                                    <div style={styles.statItemModal}>
                                        <div style={{...styles.statIconModal, backgroundColor: '#f3e5f5'}}>
                                            <MdShowChart size={28} color="#7b1fa2" />
                                        </div>
                                        <div style={styles.statTextModal}>
                                            <p style={styles.statLabelModal}>Avg Usage</p>
                                            <p style={styles.statValueModal}>{filteredHistory.length > 0 ? `${(filteredHistory.reduce((sum, r) => sum + (r.liters_remaining || 0), 0) / filteredHistory.length).toFixed(1)}L` : '-'}</p>
                                        </div>
                                    </div>

                                    {/* Flow Sensor */}
                                    <div style={styles.statItemModal}>
                                        <div style={{...styles.statIconModal, backgroundColor: '#e8f5e9'}}>
                                            <BiTrendingUp size={28} color="#2e7d32" />
                                        </div>
                                        <div style={styles.statTextModal}>
                                            <p style={styles.statLabelModal}>Flow Sensor</p>
                                            <p style={styles.statValueModal}>{filteredHistory.length}</p>
                                        </div>
                                    </div>

                                    {/* TDS High */}
                                    <div style={styles.statItemModal}>
                                        <div style={{...styles.statIconModal, backgroundColor: '#ffccbc'}}>
                                            <MdTrendingDown size={28} color="#bf360c" />
                                        </div>
                                        <div style={styles.statTextModal}>
                                            <p style={styles.statLabelModal}>TDS High</p>
                                            <p style={styles.statValueModal}>{Math.max(...filteredHistory.map(r => r.tds || 0)) || '-'}</p>
                                        </div>
                                    </div>

                                    {/* TDS Low */}
                                    <div style={styles.statItemModal}>
                                        <div style={{...styles.statIconModal, backgroundColor: '#c8e6c9'}}>
                                            <BiWater size={28} color="#1b5e20" />
                                        </div>
                                        <div style={styles.statTextModal}>
                                            <p style={styles.statLabelModal}>TDS Low</p>
                                            <p style={styles.statValueModal}>{Math.min(...filteredHistory.filter(r => r.tds).map(r => r.tds)) || '-'}</p>
                                        </div>
                                    </div>

                                    {/* Filter Life */}
                                    <div style={styles.statItemModal}>
                                        <div style={{...styles.statIconModal, backgroundColor: '#fff3e0'}}>
                                            <BiBarChart size={28} color="#e65100" />
                                        </div>
                                        <div style={styles.statTextModal}>
                                            <p style={styles.statLabelModal}>Filter Life</p>
                                            <p style={styles.statValueModal}>{liveDataHistory.length > 0 ? `${Math.round((filteredHistory.length / liveDataHistory.length) * 100)}%` : '-'}</p>
                                        </div>
                                    </div>

                                    {/* Status Summary */}
                                    <div style={styles.statItemModal}>
                                        <div style={{...styles.statIconModal, backgroundColor: '#fce4ec'}}>
                                            <BiDollar size={28} color="#c2185b" />
                                        </div>
                                        <div style={styles.statTextModal}>
                                            <p style={styles.statLabelModal}>Status</p>
                                            <p style={styles.statValueModal}>{liveDataHistory.length > 0 ? 'Active' : 'Inactive'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

const getStatusStyle = (status) => {
    const baseStyle = {
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '0.8rem',
        fontWeight: '600',
        display: 'inline-block'
    };

    if (status === 'Active' || status === 'active') {
        return {
            ...baseStyle,
            backgroundColor: '#c8e6c9',
            color: '#1b5e20'
        };
    } else if (status === 'Inactive' || status === 'inactive') {
        return {
            ...baseStyle,
            backgroundColor: '#ffccbc',
            color: '#bf360c'
        };
    }

    return {
        ...baseStyle,
        backgroundColor: '#e0e0e0',
        color: '#424242'
    };
};

const getTDSHighStyle = (tds) => {
    let bgColor = '#e3f2fd';
    let color = '#0d47a1';

    if (tds > 150) {
        bgColor = '#ffccbc';
        color = '#bf360c';
    } else if (tds > 100) {
        bgColor = '#ffe0b2';
        color = '#e65100';
    } else if (tds > 50) {
        bgColor = '#f8bbd0';
        color = '#880e4f';
    } else if (tds > 0) {
        bgColor = '#c8e6c9';
        color = '#1b5e20';
    }

    return {
        padding: '6px 10px',
        borderRadius: '6px',
        backgroundColor: bgColor,
        color: color,
        fontWeight: '600',
        fontSize: '0.85rem',
        display: 'inline-block'
    };
};

const getTDSLowStyle = (tds) => {
    let bgColor = '#c8e6c9';
    let color = '#1b5e20';

    if (tds > 50) {
        bgColor = '#f8bbd0';
        color = '#880e4f';
    } else if (tds > 0) {
        bgColor = '#c8e6c9';
        color = '#1b5e20';
    } else {
        bgColor = '#e3f2fd';
        color = '#0d47a1';
    }

    return {
        padding: '6px 10px',
        borderRadius: '6px',
        backgroundColor: bgColor,
        color: color,
        fontWeight: '600',
        fontSize: '0.85rem',
        display: 'inline-block'
    };
};

const styles = {
    pageContainer: {
        minHeight: '100vh',
        backgroundColor: '#f5f7fa'
    },
    mainContent: {
        padding: '2rem',
        maxWidth: '1600px',
        margin: '0 auto',
        paddingTop: '4.5rem'
    },
    headerSection: {
        backgroundColor: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
        backgroundImage: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
        padding: '2rem 2.5rem',
        borderRadius: '12px',
        color: 'white',
        marginBottom: '2rem',
        boxShadow: '0 8px 24px rgba(25, 118, 210, 0.2)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '2rem',
        position: 'relative'
    },
    headerTop: {
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem'
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center'
    },
    pageTitle: {
        fontSize: '2.2rem',
        margin: '0',
        fontWeight: '700'
    },
    pageSubtitle: {
        fontSize: '0.95rem',
        margin: '0.5rem 0 0 0',
        opacity: 0.95
    },
    backButton: {
        position: 'absolute',
        left: '2.5rem',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        color: 'white',
        border: 'none',
        padding: '10px 12px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '1.1rem',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    headerActions: {
        position: 'absolute',
        right: '2.5rem',
        display: 'flex',
        gap: '1rem',
        alignItems: 'center'
    },
    deviceBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        padding: '0.75rem 1.25rem',
        borderRadius: '8px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.3)'
    },
    deviceLabel: {
        fontSize: '0.75rem',
        opacity: 0.9,
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },
    deviceValue: {
        display: 'block',
        fontSize: '1.1rem',
        fontWeight: '700',
        marginTop: '0.25rem',
        fontFamily: 'monospace'
    },
    actionButton: {
        border: 'none',
        padding: '10px 14px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '500',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
    },
    refreshButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        color: 'white',
        fontSize: '1.1rem',
    },
    loadingContainer: {
        backgroundColor: 'white',
        padding: '4rem 2rem',
        borderRadius: '12px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
    },
    spinner: {
        border: '4px solid #e0e0e0',
        borderTop: '4px solid #1976d2',
        borderRadius: '50%',
        width: '48px',
        height: '48px',
        animation: 'spin 1s linear infinite'
    },
    loadingText: {
        fontSize: '1.1rem',
        color: '#666',
        margin: '0'
    },
    errorContainer: {
        backgroundColor: '#ffebee',
        padding: '1.5rem',
        borderRadius: '12px',
        border: '2px solid #f44336',
        marginBottom: '1rem'
    },
    errorText: {
        color: '#c62828',
        margin: '0',
        fontSize: '1rem'
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
    },
    statCard: {
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.3s ease',
        border: '1px solid #f0f0f0'
    },
    statIcon: {
        width: '50px',
        height: '50px',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
    },
    statContent: {
        flex: 1
    },
    statLabel: {
        fontSize: '0.85rem',
        color: '#999',
        margin: '0',
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: '0.3px'
    },
    statValue: {
        fontSize: '1.8rem',
        fontWeight: '700',
        color: '#1976d2',
        margin: '0.5rem 0 0 0'
    },
    controlsCard: {
        backgroundColor: 'white',
        borderRadius: '12px',
        marginBottom: '2.5rem',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        overflow: 'hidden',
        border: '1px solid #f0f0f0'
    },
    controlsHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        padding: '1.25rem 1.75rem',
        borderBottom: '2px solid #f5f5f5',
        fontSize: '1rem',
        fontWeight: '700',
        color: '#1976d2',
        backgroundColor: '#fafbfc'
    },
    controlsHeaderLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
    },
    purifierButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: '#2196f3',
        color: 'white',
        border: 'none',
        padding: '10px 18px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '0.95rem',
        transition: 'all 0.3s ease',
        boxShadow: '0 2px 8px rgba(33, 150, 243, 0.2)',
    },
    filterHeaderIcon: {
        color: '#1976d2'
    },
    controlsHeaderText: {
        letterSpacing: '0.3px'
    },
    controlsContent: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        padding: '1.75rem'
    },
    filterRow: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '1rem',
        alignItems: 'flex-end'
    },
    searchContainer: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gridColumn: '1 / -1'
    },
    searchIcon: {
        position: 'absolute',
        left: '14px',
        color: '#999',
        fontSize: '1.2rem',
        pointerEvents: 'none'
    },
    searchInput: {
        width: '100%',
        padding: '12px 14px 12px 44px',
        border: '1.5px solid #ddd',
        borderRadius: '8px',
        fontSize: '0.95rem',
        transition: 'all 0.3s ease',
        boxSizing: 'border-box',
        backgroundColor: '#fafbfc',
        height: '42px',
        outline: 'none'
    },
    searchInputFocus: {
        borderColor: '#1976d2',
        backgroundColor: '#fff',
        boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.1)'
    },
    dateFilterGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        minWidth: '140px'
    },
    statusFilterGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        minWidth: '140px'
    },
    filterLabel: {
        fontSize: '0.8rem',
        fontWeight: '700',
        color: '#555',
        textTransform: 'uppercase',
        letterSpacing: '0.4px'
    },
    filterInput: {
        padding: '12px 14px',
        border: '1.5px solid #ddd',
        borderRadius: '8px',
        fontSize: '0.95rem',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        backgroundColor: '#fafbfc',
        width: '100%',
        height: '42px',
        boxSizing: 'border-box'
    },
    filterSelect: {
        padding: '12px 14px',
        border: '1.5px solid #ddd',
        borderRadius: '8px',
        fontSize: '0.95rem',
        cursor: 'pointer',
        backgroundColor: '#fafbfc',
        transition: 'all 0.3s ease',
        appearance: 'none',
        width: '100%',
        height: '42px',
        boxSizing: 'border-box',
        backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 10px center',
        backgroundSize: '18px',
        paddingRight: '36px'
    },
    downloadButton: {
        backgroundColor: '#4caf50',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        padding: '12px 20px',
        fontWeight: '600',
        fontSize: '0.95rem',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        boxShadow: '0 2px 8px rgba(76, 175, 80, 0.2)',
        minWidth: '140px',
        height: '42px'
    },
    downloadButtonHover: {
        backgroundColor: '#45a049',
        boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
    },
    downloadButtonDisabled: {
        backgroundColor: '#ccc',
        cursor: 'not-allowed',
        boxShadow: 'none',
        opacity: 0.6
    },
    tableCard: {
        backgroundColor: 'white',
        borderRadius: '12px',
        marginBottom: '2rem',
        marginTop: '0',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden',
        border: '1px solid #f0f0f0'
    },
    tableHeader: {
        padding: '1.5rem',
        borderBottom: '1px solid #f0f0f0'
    },
    tableTitle: {
        fontSize: '1.1rem',
        fontWeight: '600',
        color: '#1a1a1a',
        margin: '0'
    },
    tableWrapper: {
        overflowX: 'auto'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '0.9rem'
    },
    tableHeadRow: {
        backgroundColor: '#f8f9fa',
        borderBottom: '2px solid #e0e0e0'
    },
    tableTh: {
        padding: '14px 12px',
        textAlign: 'left',
        fontWeight: '600',
        color: '#555',
        fontSize: '0.85rem',
        textTransform: 'uppercase',
        letterSpacing: '0.3px'
    },
    tableBodyRow: {
        borderBottom: '1px solid #f0f0f0',
        transition: 'background-color 0.2s ease'
    },
    tableTd: {
        padding: '14px 12px',
        color: '#333'
    },
    timestamp: {
        fontSize: '0.85rem',
        color: '#666',
        fontFamily: 'monospace'
    },
    serialNumber: {
        fontWeight: '600',
        color: '#1976d2',
        fontSize: '0.9rem'
    },
    planBadge: {
        backgroundColor: '#f3e5f5',
        color: '#7b1fa2',
        padding: '6px 10px',
        borderRadius: '6px',
        fontWeight: '600',
        fontSize: '0.85rem'
    },
    usageValue: {
        fontWeight: '600',
        color: '#1976d2',
        fontSize: '0.9rem'
    },
    flowBadge: {
        backgroundColor: '#e8f5e9',
        color: '#2e7d32',
        padding: '6px 12px',
        borderRadius: '6px',
        fontWeight: '600',
        fontSize: '0.9rem',
        display: 'inline-block'
    },
    filterLifeBadge: {
        backgroundColor: '#fff3e0',
        color: '#e65100',
        padding: '6px 10px',
        borderRadius: '6px',
        fontWeight: '600',
        fontSize: '0.85rem',
        display: 'inline-block'
    },
    costBadge: {
        backgroundColor: '#f1f8e9',
        color: '#558b2f',
        padding: '6px 10px',
        borderRadius: '6px',
        fontWeight: '600',
        fontSize: '0.85rem'
    },
    deregisteredBadge: {
        backgroundColor: '#ffe0b2',
        color: '#e65100',
        padding: '6px 10px',
        borderRadius: '6px',
        fontWeight: '600',
        fontSize: '0.85rem',
        display: 'inline-block',
        fontFamily: 'monospace'
    },
    emptyRow: {
        padding: '3rem 1rem',
        textAlign: 'center'
    },
    emptyStateContent: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem'
    },
    emptyStateText: {
        fontSize: '1rem',
        color: '#999',
        margin: '0'
    },
    paginationSection: {
        backgroundColor: 'white',
        padding: '1.5rem 2rem',
        borderRadius: '12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        flexWrap: 'wrap',
        gap: '1.5rem'
    },
    paginationInfo: {
        fontSize: '0.95rem',
        color: '#555',
        margin: '0',
        fontWeight: '500'
    },
    paginationControls: {
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'center'
    },
    paginationButton: {
        padding: '10px 16px',
        border: '1px solid #ddd',
        backgroundColor: 'white',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '0.95rem',
        fontWeight: '600',
        transition: 'all 0.2s ease',
        color: '#1976d2',
        minWidth: '100px',
        textAlign: 'center'
    },
    pageNumbers: {
        display: 'flex',
        gap: '6px'
    },
    pageNumber: {
        padding: '8px 12px',
        border: '1px solid #ddd',
        backgroundColor: 'white',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: '600',
        transition: 'all 0.2s ease',
        color: '#555',
        minWidth: '40px',
        textAlign: 'center'
    },
    pageNumberActive: {
        backgroundColor: '#1976d2',
        color: 'white',
        borderColor: '#1976d2',
        boxShadow: '0 4px 8px rgba(25, 118, 210, 0.2)'
    }
};

export default DeviceHistory;
