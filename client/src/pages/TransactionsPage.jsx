// src/pages/TransactionsPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../styles/TransactionsPage.module.css';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiSearch } from 'react-icons/fi';

function TransactionsPage() {
    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { 'Authorization': `Bearer ${token}` } };
                // Fetch user data via verify-token endpoint to ensure state is correct
                const userRes = await axios.post('http://localhost:5000/api/auth/verify-token', { idToken: token }, config);

                // Updated to use the new GET endpoint for personal transactions
                const transactionsRes = await axios.get('http://localhost:5000/api/transactions/personal', config);
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

    useEffect(() => {
        const results = transactions.filter(transaction =>
            transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredTransactions(results);
    }, [searchTerm, transactions]);

    if (isLoading) return <div className={styles.centeredMessage}>Loading transactions...</div>;
    if (error) return <div className={`${styles.centeredMessage} ${styles.error}`}>{error}</div>;

    return (
        <div className={styles.pageContainer}>
            <div className={styles.header}>
                <h1 className={styles.title}>All Transactions</h1>
                <button className={styles.addButton} onClick={() => navigate('/addtransactions')}>
                    <FiPlus /> Add Transaction
                </button>
            </div>

            <div className={styles.controls}>
                <div className={styles.searchBox}>
                    <FiSearch className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search by description or category..."
                        className={styles.searchInput}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.th}>Description</th>
                            <th className={styles.th}>Category</th>
                            <th className={styles.th}>Date</th>
                            <th className={styles.th}>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTransactions.length > 0 ? filteredTransactions.map(t => (
                            <tr key={t.id} className={styles.tableRow}>
                                <td className={styles.td}>{t.description}</td>
                                <td className={styles.td}>
                                    <span className={styles.categoryTag}>{t.category}</span>
                                </td>
                                {/* The date field is a Firestore Timestamp, so it's a bit more robust to parse */}
                                <td className={styles.td}>{new Date(t.date?.toDate()).toLocaleDateString()}</td>
                                <td className={`${styles.td} ${t.amount > 0 ? styles.income : styles.expense}`}>
                                    {t.amount > 0 ? '+' : '-'}₹{Math.abs(parseFloat(t.amount)).toFixed(2)}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="4" className={styles.centeredMessage}>No transactions found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default TransactionsPage;