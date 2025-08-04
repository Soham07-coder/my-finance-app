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
    const [view, setView] = useState('personal'); // Added state for view toggle
    const [user, setUser] = useState(null); // Added state to store user data
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTransactions = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('Authentication token not found.');

                const config = { headers: { 'Authorization': `Bearer ${token}` } };
                
                // Fetch user data to check for familyId
                const userRes = await axios.post('http://localhost:5000/api/auth/verify-token', { idToken: token }, config);
                setUser(userRes.data);

                // Conditionally fetch data based on the selected view
                let endpoint = '';
                if (view === 'family' && userRes.data.familyId) {
                    endpoint = 'http://localhost:5000/api/transactions/family'; // Use the family endpoint
                } else {
                    endpoint = 'http://localhost:5000/api/transactions/personal'; // Use the personal endpoint
                }

                const transactionsRes = await axios.get(endpoint, config);
                setTransactions(transactionsRes.data);
            } catch (err) {
                console.error('Error fetching transactions:', err);
                setError('Failed to load transactions. Please try refreshing.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchTransactions();
    }, [view]); // The effect now re-runs whenever the 'view' state changes

    useEffect(() => {
        const results = transactions.filter(transaction =>
            transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (transaction.category && transaction.category.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setFilteredTransactions(results);
    }, [searchTerm, transactions]);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (isLoading) return <div className={styles.centeredMessage}>Loading transactions...</div>;
    if (error) return <div className={`${styles.centeredMessage} ${styles.error}`}>{error}</div>;

    return (
        <div className={styles.pageContainer}>
            <div className={styles.header}>
                <h1 className={styles.title}>{view === 'family' ? 'Family Transactions' : 'Personal Transactions'}</h1>
                <button className={styles.addButton} onClick={() => navigate('/addtransactions')}>
                    <FiPlus /> Add Transaction
                </button>
            </div>

            {user?.familyId && ( // Only show the toggle if the user is in a family
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
                            {user?.familyId && <th className={styles.th}>Type</th>} {/* New column for personal/family type */}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTransactions.length > 0 ? filteredTransactions.map(t => (
                            <tr key={t.id} className={styles.tableRow}>
                                <td className={styles.td}>{t.description}</td>
                                <td className={styles.td}>
                                    <span className={styles.categoryTag}>{t.category}</span>
                                </td>
                                <td className={styles.td}>{formatDate(t.date)}</td>
                                <td className={`${styles.td} ${t.amount > 0 ? styles.income : styles.expense}`}>
                                    {t.amount > 0 ? '+' : '-'}₹{Math.abs(parseFloat(t.amount)).toFixed(2)}
                                </td>
                                {user?.familyId && (
                                    <td className={styles.td}>
                                        <span className={t.familyId ? styles.familyTag : styles.personalTag}>
                                            {t.familyId ? 'Family' : 'Personal'}
                                        </span>
                                    </td>
                                )}
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={user?.familyId ? "5" : "4"} className={styles.centeredMessage}>No transactions found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default TransactionsPage;