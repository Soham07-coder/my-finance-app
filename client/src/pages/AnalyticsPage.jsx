// src/pages/AnalyticsPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import styles from '../styles/AnalyticsPage.module.css';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { FiBarChart2, FiCalendar } from 'react-icons/fi';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// --- Reusable Metric Card ---
const MetricCard = ({ title, value, color }) => (
    <div className={styles.metricCard}>
        <h3 className={styles.metricTitle}>{title}</h3>
        <p className={styles.metricValue} style={{ color }}>{value}</p>
    </div>
);

function AnalyticsPage() {
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [view, setView] = useState('personal');
    const [dateRange, setDateRange] = useState('this_month');

    // --- Data Fetching Logic ---
    useEffect(() => {
        const fetchUserAndTransactions = async () => {
            setIsLoading(true);
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { 'Authorization': `Bearer ${token}` } };

                // Fetch user to check for familyId
                const userRes = await axios.post('http://localhost:5000/api/auth/verify-token', { idToken: token }, config);
                setUser(userRes.data);

                // Determine date range for the API call
                const today = new Date();
                let params = {};
                if (dateRange === 'this_month') {
                    const start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
                    const end = today.toISOString();
                    params = { startDate: start, endDate: end };
                } else if (dateRange === 'last_month') {
                    const start = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString();
                    const end = new Date(today.getFullYear(), today.getMonth(), 0).toISOString();
                    params = { startDate: start, endDate: end };
                }

                // Update the endpoint to use GET and the new route names
                const endpoint = view === 'family' && userRes.data.familyId
                    ? 'http://localhost:5000/api/transactions/family'
                    : 'http://localhost:5000/api/transactions/personal';

                // Pass date range as query parameters
                const transactionsRes = await axios.get(endpoint, { ...config, params });

                setTransactions(transactionsRes.data);
            } catch (error) {
                console.error("Failed to fetch analytics data", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUserAndTransactions();
    }, [view, dateRange]); // Refetch when view or date range changes

    // --- Data Processing with useMemo for performance ---
    const analyticsData = useMemo(() => {
        const totalIncome = transactions
            .filter(t => t.amount > 0)
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);

        const totalExpenses = transactions
            .filter(t => t.amount < 0)
            .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0);

        const spendingByCategory = transactions
            .filter(t => t.amount < 0)
            .reduce((acc, t) => {
                const category = t.category || 'Uncategorized';
                acc[category] = (acc[category] || 0) + Math.abs(parseFloat(t.amount));
                return acc;
            }, {});

        const pieChartData = Object.entries(spendingByCategory)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        return {
            totalExpenses,
            totalIncome,
            netFlow: totalIncome - totalExpenses,
            pieChartData,
        };
    }, [transactions]);


    if (isLoading) {
        return <div className={styles.centeredMessage}>Loading Analytics...</div>;
    }

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <h1><FiBarChart2 /> Analytics</h1>
                <p>Visualize your spending habits and financial health.</p>
            </header>

            <div className={styles.controls}>
                {user?.familyId && ( // Check for familyId
                    <div className={styles.viewToggle}>
                        <button onClick={() => setView('personal')} className={view === 'personal' ? styles.active : ''}>Personal</button>
                        <button onClick={() => setView('family')} className={view === 'family' ? styles.active : ''}>Family</button>
                    </div>
                )}
                <div className={styles.dateRangeSelector}>
                    <FiCalendar />
                    <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                        <option value="this_month">This Month</option>
                        <option value="last_month">Last Month</option>
                        <option value="all_time">All Time</option>
                    </select>
                </div>
            </div>

            <div className={styles.metricsGrid}>
                <MetricCard title="Total Income" value={`₹${analyticsData.totalIncome.toFixed(2)}`} color="#16a34a" />
                <MetricCard title="Total Expenses" value={`₹${analyticsData.totalExpenses.toFixed(2)}`} color="#dc2626" />
                <MetricCard title="Net Flow" value={`₹${analyticsData.netFlow.toFixed(2)}`} color={analyticsData.netFlow >= 0 ? "#16a34a" : "#dc2626"} />
            </div>

            <div className={styles.chartsGrid}>
                <div className={styles.chartContainer}>
                    <h3>Spending by Category</h3>
                    {analyticsData.pieChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={analyticsData.pieChartData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    nameKey="name"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {analyticsData.pieChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : <p className={styles.centeredMessage}>No spending data for this period.</p>}
                </div>
                <div className={styles.chartContainer}>
                    <h3>Top 5 Expenses</h3>
                    {analyticsData.pieChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={analyticsData.pieChartData.slice(0, 5)} layout="vertical" margin={{ left: 20, right: 30 }}>
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                                <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} cursor={{ fill: '#f3f4f6' }} />
                                <Bar dataKey="value" barSize={20}>
                                    {analyticsData.pieChartData.slice(0, 5).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <p className={styles.centeredMessage}>No spending data for this period.</p>}
                </div>
            </div>
        </div>
    );
}

export default AnalyticsPage;