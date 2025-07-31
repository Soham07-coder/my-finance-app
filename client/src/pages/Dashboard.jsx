import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/Dashboard.module.css'; // Using your provided CSS module
import { FiPlus, FiTrendingUp, FiTrendingDown, FiDollarSign } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// MetricCard component structured to match your CSS
const MetricCard = ({ title, value, type = 'balance', icon }) => (
    <motion.div className={styles.metricCard}>
        <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>{title}</h3>
            {icon && <div className={styles.cardIcon}>{icon}</div>}
        </div>
        <p className={`${styles.cardValue} ${styles[type]}`}>
            ₹{value.toLocaleString('en-IN')}
        </p>
    </motion.div>
);

// SpendingChart component remains the same as it uses the Recharts library
const SpendingChart = ({ data }) => {
    const colors = ["#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe", "#dbeafe"];
    return (
        <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={300}>
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

// Main Dashboard Component
function Dashboard() {
    const [user, setUser] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [view, setView] = useState('personal');
    const navigate = useNavigate();

    const { totalIncome, totalExpenses, balance, spendingByCategory } = useMemo(() => {
        const income = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + parseFloat(t.amount), 0);
        const expenses = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + parseFloat(t.amount), 0);

        const spendingMap = transactions.filter(t => t.amount < 0).reduce((acc, t) => {
            const amount = Math.abs(parseFloat(t.amount));
            acc[t.category] = (acc[t.category] || 0) + amount;
            return acc;
        }, {});

        const sortedSpending = Object.entries(spendingMap)
            .map(([category, total]) => ({ category, total }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 5);

        return {
            totalIncome: income,
            totalExpenses: Math.abs(expenses),
            balance: income + expenses,
            spendingByCategory: sortedSpending
        };
    }, [transactions]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { 'Authorization': `Bearer ${token}` } };
                const userRes = await axios.get('http://localhost:5000/api/auth/me', config);
                setUser(userRes.data);

                const endpoint = view === 'family' && userRes.data.family_id
                    ? 'http://localhost:5000/api/transactions/family'
                    : 'http://localhost:5000/api/transactions/list';

                const transactionsRes = await axios.post(endpoint, {}, config);
                setTransactions(transactionsRes.data);
            } catch (err) {
                setError('Failed to load dashboard data. Please try refreshing.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboardData();
    }, [view]);

    if (isLoading) return <div className={styles.centeredMessage}>Loading dashboard...</div>;
    if (error) return <div className={styles.centeredMessage} style={{ color: 'red' }}>{error}</div>;

    return (
        <div className={styles.dashboard}>
            <header className={styles.dashboardHeader}>
                <h1 className={styles.welcomeTitle}>Welcome Back, {user?.username || 'User'}!</h1>
                <button onClick={() => navigate('/addtransactions')} className={styles.addButton}>
                    <FiPlus /> Add Transaction
                </button>
            </header>

            {user?.family_id && (
                <div className={styles.viewToggleContainer}>
                    <div className={styles.viewToggle}>
                        <button
                            onClick={() => setView('personal')}
                            className={view === 'personal' ? styles.active : ''}
                        >
                            Personal
                        </button>
                        <button
                            onClick={() => setView('family')}
                            className={view === 'family' ? styles.active : ''}
                        >
                            Family
                        </button>
                    </div>
                </div>
            )}

            {/* This div structure matches your CSS grid layout */}
            <div className={styles.dashboardGrid}>
                <div className={styles.metrics}>
                    <MetricCard title="Total Income" value={totalIncome.toFixed(2)} type="income" icon={<FiTrendingUp />} />
                    <MetricCard title="Total Expenses" value={totalExpenses.toFixed(2)} type="expense" icon={<FiTrendingDown />} />
                    <MetricCard title="Current Balance" value={balance.toFixed(2)} />
                </div>

                <div className={styles.mainContent}>
                    <div className={styles.contentBox}>
                        <h3 className={styles.contentTitle}>Recent {view === 'family' ? 'Family' : 'Personal'} Transactions</h3>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th className={styles.th}>Description</th>
                                    <th className={styles.th}>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.slice(0, 5).map(t => (
                                    <tr key={t.id} className={styles.tableRow}>
                                        <td className={styles.td}>
                                            <div className={styles.tdDescription}>{t.description}</div>
                                            <div className={styles.tdCategory}>
                                                {view === 'family' ? `${t.category} (by ${t.entered_by})` : t.category}
                                            </div>
                                        </td>
                                        <td className={`${styles.td} ${t.amount > 0 ? styles.amountCredit : styles.amountDebit}`}>
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
        </div>
    );
}

export default Dashboard;