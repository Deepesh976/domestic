import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar/Headadmin-Navbar';
import { PieChart, Pie, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid, Cell, Legend, ResponsiveContainer } from 'recharts';
import { FaUsers, FaMobileAlt, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const revenueData = [
    { month: 'Jan', revenue: 5000 },
    { month: 'Feb', revenue: 4800 },
    { month: 'Mar', revenue: 4500 },
    { month: 'Apr', revenue: 4700 },
    { month: 'May', revenue: 5200 },
    { month: 'Jun', revenue: 5600 },
    { month: 'Jul', revenue: 5800 },
    { month: 'Aug', revenue: 6000 },
    { month: 'Sep', revenue: 6200 },
    { month: 'Oct', revenue: 7000 },
    { month: 'Nov', revenue: 7200 },
    { month: 'Dec', revenue: 7500 },
];

const trendingPlanData = [
    { name: 'Plan A', value: 300, color: '#D32F2F' },
    { name: 'Plan B', value: 200, color: '#1976D2' },
    { name: 'Plan C', value: 400, color: '#388E3C' },
];

const monthlyCustomerData = [
    { name: 'Jan', customers: 150 },
    { name: 'Feb', customers: 200 },
    { name: 'Mar', customers: 250 },
    { name: 'Apr', customers: 300 },
    { name: 'May', customers: 350 },
    { name: 'Jun', customers: 400 },
    { name: 'Jul', customers: 450 },
    { name: 'Aug', customers: 500 },
    { name: 'Sep', customers: 550 },
    { name: 'Oct', customers: 600 },
    { name: 'Nov', customers: 650 },
    { name: 'Dec', customers: 700 },
];

const AdminOrg = () => {
    const [counts, setCounts] = useState({
        totalCustomers: 0,
        totalDevices: 0,
        activeDevices: 0,
        inactiveDevices: 0,
    });

    useEffect(() => {
        const animateCounts = () => {
            const interval = setInterval(() => {
                setCounts((prev) => ({
                    totalCustomers: prev.totalCustomers < 750 ? prev.totalCustomers + 50 : 750,
                    totalDevices: prev.totalDevices < 800 ? prev.totalDevices + 50 : 800,
                    activeDevices: prev.activeDevices < 600 ? prev.activeDevices + 50 : 600,
                    inactiveDevices: prev.inactiveDevices < 200 ? prev.inactiveDevices + 25 : 200,
                }));
            }, 100);
            setTimeout(() => clearInterval(interval), 2000);
        };
        animateCounts();
    }, []);

    return (
        <div style={styles.page}>
            <Navbar />
            <div style={styles.container}>
                {/* Cards Section */}
                <div style={styles.row}>
                    <CounterCard icon={<FaUsers />} title="Total Customers" count={counts.totalCustomers} color="#FFB74D" />
                    <CounterCard icon={<FaMobileAlt />} title="Total Devices" count={counts.totalDevices} color="#64B5F6" />
                    <CounterCard icon={<FaCheckCircle />} title="Active Devices" count={counts.activeDevices} color="#81C784" />
                    <CounterCard icon={<FaTimesCircle />} title="Inactive Devices" count={counts.inactiveDevices} color="#E57373" />
                </div>

                {/* Combined Graph Section */}
                <div style={styles.graphContainer}>
                    <GraphBox title="Monthly Customer Growth" bgColor="linear-gradient(to top, #FFB74D, #FFE0B2)">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={monthlyCustomerData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="customers" fill="#F57C00" barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </GraphBox>

                    <GraphBox title="Trending Plans" bgColor="linear-gradient(to top, #64B5F6, #BBDEFB)">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={trendingPlanData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={90}
                                    label
                                >
                                    {trendingPlanData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" align="center" />
                            </PieChart>
                        </ResponsiveContainer>
                    </GraphBox>

                    <GraphBox title="Monthly Revenue" bgColor="linear-gradient(to top, #81C784, #C8E6C9)">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="revenue" stroke="#388E3C" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </GraphBox>
                </div>
            </div>
        </div>
    );
};

const CounterCard = ({ icon, title, count, color }) => (
    <div style={{ ...styles.card, backgroundColor: color }}>
        <div style={styles.icon}>{icon}</div>
        <h4 style={styles.cardTitle}>{title}</h4>
        <p style={styles.cardCount}>{count}</p>
    </div>
);

const GraphBox = ({ title, children, bgColor }) => (
    <div style={{ ...styles.graphBox, background: bgColor }}>
        <h3 style={styles.graphTitle}>{title}</h3>
        {children}
    </div>
);

const styles = {
    page: {
        fontFamily: `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`,
        background: 'linear-gradient(to top, #F1F8E9, #FFFFFF)',
        minHeight: '100vh',
    },
    container: {
        margin: '20px auto',
        padding: '20px',
        maxWidth: '1200px',
        background: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
    row: {
        display: 'flex',
        justifyContent: 'space-between',
        gap: '25px',
        marginBottom: '30px',
        flexWrap: 'wrap',
    },
    card: {
        flex: 1,
        padding: '10px',
        borderRadius: '12px',
        boxShadow: '0 6px 12px rgba(0,0,0,0.2)',
        textAlign: 'center',
        color: '#fff',
        fontWeight: 'bold',
    },
    icon: {
        fontSize: '2.1rem',
        marginBottom: '1rem',
    },
    graphContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '20px',
        justifyContent: 'center',
    },
    graphBox: {
        flex: '1 1 30%',
        minWidth: '350px',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 6px 12px rgba(0,0,0,0.1)',
        textAlign: 'center',
    },
    graphTitle: {
        fontSize: '1.3rem',
        marginBottom: '15px',
        color: '#333',
    },
};

export default AdminOrg;
