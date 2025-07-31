// src/pages/Dashboard.jsx
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css';
import { FiPlus, FiTrendingUp, FiTrendingDown, FiDollarSign } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const MetricCard = ({ title, value, type = 'balance', icon }) => (
    <motion.div
        className={styles.metricCard}
        whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)" }}
        transition={{ type: "spring", stiffness: 300 }}
    >
        <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>{title}</h3>
            <div className={styles.cardIcon}>{icon}</div>
        </div>
        <p className={`${styles.cardValue} ${styles[type]}`}>₹{value.toLocaleString('en-IN')}</p>
    </motion.div>
);

const SpendingChart = ({ data }) => {
    const colors = ["#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe", "#dbeafe"];
    return (
        <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="category" axisLine={false} tickLine={false} width={80} tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <Tooltip
                        cursor={{ fill: 'rgba(243, 244, 246, 0.5)' }}
                        formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Spent']}
                        contentStyle={{ borderRadius: '0.5rem', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="total" barSize={20} radius={[0, 4, 4, 0]}>
                        {data.map((entry, index) => (<Cell key={`cell-${index}`} fill={colors[index % colors.length]} />))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

const DashboardMetrics = ({ transactions }) => {
    const { totalIncome, totalExpenses, balance } = useMemo(() => {
        const income = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + parseFloat(t.amount), 0);
        const expenses = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + parseFloat(t.amount), 0);
        return { totalIncome: income, totalExpenses: expenses, balance: income + expenses };
    }, [transactions]);

    return (
        <div className={styles.metrics}>
            <MetricCard title="Total Income" value={totalIncome.toFixed(2)} type="income" icon={<FiTrendingUp />} />
            <MetricCard title="Total Expenses" value={Math.abs(totalExpenses).toFixed(2)} type="expense" icon={<FiTrendingDown />} />
            <MetricCard title="Current Balance" value={balance.toFixed(2)} />
        </div>
    );
};

function Dashboard() {
    const [user, setUser] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    // STATE: This state variable tracks the current view (personal or family).
    const [view, setView] = useState('personal'); //
    const navigate = useNavigate();

    const { spendingByCategory } = useMemo(() => {
        const spendingMap = transactions.filter(t => t.amount < 0).reduce((acc, t) => {
            const amount = Math.abs(parseFloat(t.amount));
            acc[t.category] = (acc[t.category] || 0) + amount;
            return acc;
        }, {});
        return {
            spendingByCategory: Object.entries(spendingMap).map(([category, total]) => ({ category, total })).sort((a, b) => b.total - a.total).slice(0, 5)
        };
    }, [transactions]);

    // LOGIC: This effect re-runs whenever the `view` state changes.
    useEffect(() => { //
        const fetchDashboardData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { 'Authorization': `Bearer ${token}` } };
                const userRes = await axios.get('http://localhost:5000/api/auth/me', config);
                setUser(userRes.data);

                // It checks the `view` state to determine which API endpoint to call.
                const endpoint = view === 'family' && userRes.data.family_id //
                    ? 'http://localhost:5000/api/transactions/family' //
                    : 'http://localhost:5000/api/transactions/list'; //

                const transactionsRes = await axios.post(endpoint, {}, config);
                setTransactions(transactionsRes.data);
            } catch (err) {
                setError('Failed to load dashboard data. Please try refreshing.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboardData();
    }, [view]); // The dependency array ensures this runs when `view` changes.

    if (isLoading) return <div className={styles.centeredMessage}>Loading dashboard...</div>;
    if (error) return <div className={styles.centeredMessage} style={{ color: 'red' }}>{error}</div>;

    return (
        <motion.div className={styles.dashboard} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <div className={styles.dashboardHeader}>
                <h2 className={styles.welcomeTitle}>Welcome Back, {user?.username || 'User'}!</h2>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/addtransactions')} className={styles.addButton}><FiPlus /> Add Transaction</motion.button>
            </div>

            {/* UI: This JSX renders the view switch only if the user has a family_id. */}
            {user?.family_id && ( //
                <div className={styles.viewToggle}>
                    <button onClick={() => setView('personal')} className={view === 'personal' ? styles.active : ''}>Personal</button>
                    <button onClick={() => setView('family')} className={view === 'family' ? styles.active : ''}>Family</button>
                </div>
            )}

            <DashboardMetrics transactions={transactions} />

            <div className={styles.dashboardGrid}>
                <div className={styles.mainContent}>
                    <div className={styles.contentBox}>
                        <h3 className={styles.contentTitle}>Recent {view === 'family' ? 'Family' : 'Personal'} Transactions</h3>
                        <table className={styles.table}>
                            <thead><tr><th className={styles.th}>Description</th><th className={styles.th}>Amount</th></tr></thead>
                            <tbody>
                                {transactions.slice(0, 5).map(t => (
                                    <tr key={t.id} className={styles.tableRow}>
                                        <td className={styles.td}>
                                            <div className={styles.tdDescription}>{t.description}</div>
                                            <div className={styles.tdCategory}>{view === 'family' ? `${t.category} (by ${t.entered_by})` : t.category}</div>
                                        </td>
                                        <td className={`{t.amount > 0 ? styles.amountCredit : styles.amountDebit} ${styles.td}`}>
                                            {t.amount > 0 ? '+' : '-'}₹{Math.abs(parseFloat(t.amount)).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className={styles.sidebar}>
                    <div className={styles.contentBox}>
                        <h3 className={styles.contentTitle}>Top Spending Categories</h3>
                        <SpendingChart data={spendingByCategory} />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default Dashboard;