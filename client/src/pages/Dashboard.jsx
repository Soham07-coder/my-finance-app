// src/pages/Dashboard.jsx
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import styles from './Dashboard.module.css';
import { FiPlus } from 'react-icons/fi';

// --- Helper Components (No changes needed here) ---
const MetricCard = ({ title, value, type = 'balance' }) => (
    <div className={styles.metricCard}>
        <h3 className={styles.cardTitle}>{title}</h3>
        <p className={`${styles.cardValue} ${styles[type]}`}>₹{value.toLocaleString('en-IN')}</p>
    </div>
);

const SpendingChart = ({ data }) => {
    const maxSpending = Math.max(...data.map(d => d.total), 0);
    return (
        <div className={styles.chartContainer}>
            {data.map(item => (
                <div key={item.category} className={styles.chartBar}>
                    <div className={styles.barLabel}>{item.category}</div>
                    <div className={styles.bar} style={{ width: maxSpending > 0 ? `${(item.total / maxSpending) * 80}%` : '0%' }}>
                        {item.total.toFixed(0)}
                    </div>
                </div>
            ))}
        </div>
    );
};


// --- Main Dashboard Component (Updated) ---
function Dashboard() {
    const [user, setUser] = useState(null); // State for user data
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // useMemo for calculations remains the same, which is great for performance
    const { totalIncome, totalExpenses, balance, spendingByCategory } = useMemo(() => {
        const income = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + parseFloat(t.amount), 0);
        const expenses = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + parseFloat(t.amount), 0);
        const spendingMap = transactions.filter(t => t.amount < 0).reduce((acc, t) => {
            const amount = Math.abs(parseFloat(t.amount));
            acc[t.category] = (acc[t.category] || 0) + amount;
            return acc;
        }, {});
        const spendingData = Object.entries(spendingMap).map(([category, total]) => ({ category, total })).sort((a, b) => b.total - a.total);
        return { totalIncome: income, totalExpenses: expenses, balance: income + expenses, spendingByCategory: spendingData };
    }, [transactions]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { 'Authorization': `Bearer ${token}` } };

                // Fetch user data and transactions at the same time for efficiency
                const [userRes, transactionsRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/auth/me', config),
                    axios.post('http://localhost:5000/api/transactions/list', {}, config)
                ]);

                setUser(userRes.data);
                setTransactions(transactionsRes.data);

            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError('Failed to load dashboard data. Please try refreshing.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (isLoading) {
        return <div className={styles.centeredMessage}>Loading your dashboard...</div>;
    }

    if (error) {
        return <div className={styles.centeredMessage} style={{ color: 'red' }}>{error}</div>;
    }

    return (
        <div className={styles.dashboard}>
            <div className={styles.dashboardHeader}>
                {/* Dynamically display the user's name */}
                <h2 className={styles.welcomeTitle}>Welcome Back, {user?.username || 'User'}!</h2>
                <button className={styles.addButton}>
                    <FiPlus /> Add Transaction
                </button>
            </div>

            <div className={styles.dashboardGrid}>
                <div className={styles.metrics}>
                    <MetricCard title="Total Income" value={totalIncome.toFixed(2)} type="income" />
                    <MetricCard title="Total Expenses" value={Math.abs(totalExpenses).toFixed(2)} type="expense" />
                    <MetricCard title="Current Balance" value={balance.toFixed(2)} />
                </div>
                <div className={styles.mainContent}>
                    <div className={styles.contentBox}>
                        <h3 className={styles.contentTitle}>Recent Transactions</h3>
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
                                            <div className={styles.tdCategory}>{t.category}</div>
                                        </td>
                                        <td className={`${t.amount > 0 ? styles.amountCredit : styles.amountDebit} ${styles.td}`}>
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
                        <h3 className={styles.contentTitle}>Spending by Category</h3>
                        <SpendingChart data={spendingByCategory} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
