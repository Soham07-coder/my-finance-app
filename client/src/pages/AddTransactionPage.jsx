// src/pages/AddTransactionPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/AddTransactionPage.module.css';
import { FiArrowLeft } from 'react-icons/fi';

function AddTransactionPage() {
    const [formData, setFormData] = useState({
        description: '', amount: '', category: 'Food',
        transaction_type: 'expense', date: new Date().toISOString().split('T')[0],
    });
    // STATE: This state variable tracks if the transaction is for the family or personal.
    const [isFamilyExpense, setIsFamilyExpense] = useState(false); //
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { 'Authorization': `Bearer ${token}` } };
                const res = await axios.get('http://localhost:5000/api/auth/me', config);
                setUser(res.data); //
            } catch (error) {
                console.error("Could not fetch user", error);
            }
        };
        fetchUser();
    }, []);

    const { description, amount, category, transaction_type, date } = formData;
    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } };
            const finalAmount = transaction_type === 'expense' ? -Math.abs(amount) : Math.abs(amount);

            // LOGIC: When submitting, the family_id is set if the user is in a family
            // and the "Family" toggle is active. Otherwise, it's null.
            const body = {
                ...formData,
                amount: finalAmount,
                family_id: isFamilyExpense && user?.family_id ? user.family_id : null, //
            };
            await axios.post('http://localhost:5000/api/transactions', body, config); //
            navigate('/transactions');
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to add transaction.');
        } finally {
            setIsLoading(false);
        }
    };

    const categories = ['Food', 'Groceries', 'Transport', 'Utilities', 'Rent', 'Shopping', 'Entertainment', 'Health', 'Education', 'Investment', 'Salary', 'Side Income', 'Other'];

    return (
        <div className={styles.pageContainer}>
            <div className={styles.header}>
                <button onClick={() => navigate(-1)} className={styles.backButton}><FiArrowLeft /> Back</button>
                <h1 className={styles.title}>Add New Transaction</h1>
            </div>
            <div className={styles.formContainer}>
                <form onSubmit={onSubmit}>
                    {error && <p className={styles.errorMessage}>{error}</p>}

                    {/* UI: This JSX renders the toggle switch only if the user has a family_id. */}
                    {user?.family_id && ( //
                        <div className={styles.toggleGroup}>
                            <label className={styles.toggleLabel}>Transaction For:</label>
                            <div className={styles.toggleSwitch}>
                                <button type="button" onClick={() => setIsFamilyExpense(false)} className={!isFamilyExpense ? styles.active : ''}>Personal</button>
                                <button type="button" onClick={() => setIsFamilyExpense(true)} className={isFamilyExpense ? styles.active : ''}>Family</button>
                            </div>
                        </div>
                    )}

                    <div className={styles.inputGroup}><label htmlFor="description">Description</label><input type="text" id="description" name="description" value={description} onChange={onChange} placeholder="e.g., Lunch at Modern Cafe" required /></div>
                    <div className={styles.inputGroup}><label htmlFor="amount">Amount (₹)</label><input type="number" id="amount" name="amount" value={amount} onChange={onChange} placeholder="e.g., 150.00" required /></div>
                    <div className={styles.inputGroup}><label htmlFor="category">Category</label><select id="category" name="category" value={category} onChange={onChange}>{categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></div>
                    <div className={styles.inputGroup}><label>Transaction Type</label><div className={styles.radioGroup}><label><input type="radio" name="transaction_type" value="expense" checked={transaction_type === 'expense'} onChange={onChange} /> Expense</label><label><input type="radio" name="transaction_type" value="income" checked={transaction_type === 'income'} onChange={onChange} /> Income</label></div></div>
                    <div className={styles.inputGroup}><label htmlFor="date">Date</label><input type="date" id="date" name="date" value={date} onChange={onChange} required /></div>
                    <button type="submit" className={styles.submitButton} disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Transaction'}</button>
                </form>
            </div>
        </div>
    );
}

export default AddTransactionPage;