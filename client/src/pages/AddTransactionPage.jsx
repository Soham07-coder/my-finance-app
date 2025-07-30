// src/pages/AddTransactionPage.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './AddTransactionPage.module.css';
import { FiArrowLeft } from 'react-icons/fi';

function AddTransactionPage() {
    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        category: 'Food', // Default category
        transaction_type: 'expense', // Default type
        date: new Date().toISOString().split('T')[0], // Default to today
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const { description, amount, category, transaction_type, date } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            };

            // Ensure amount is a number and negative for expenses
            const finalAmount = transaction_type === 'expense' ? -Math.abs(amount) : Math.abs(amount);

            const body = { ...formData, amount: finalAmount };

            await axios.post('http://localhost:5000/api/transactions', body, config);
            navigate('/transactions'); // Redirect to transactions list after success
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to add transaction. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    // Culturally relevant categories for Dombivli/India
    const categories = [
        'Food', 'Groceries', 'Transport', 'Utilities', 'Rent', 'Shopping',
        'Entertainment', 'Health', 'Education', 'Investment', 'Salary', 'Side Income', 'Other'
    ];

    return (
        <div className={styles.pageContainer}>
            <div className={styles.header}>
                <button onClick={() => navigate(-1)} className={styles.backButton}>
                    <FiArrowLeft /> Back
                </button>
                <h1 className={styles.title}>Add New Transaction</h1>
            </div>

            <div className={styles.formContainer}>
                <form onSubmit={onSubmit}>
                    {error && <p className={styles.errorMessage}>{error}</p>}

                    <div className={styles.inputGroup}>
                        <label htmlFor="description">Description</label>
                        <input
                            type="text"
                            id="description"
                            name="description"
                            value={description}
                            onChange={onChange}
                            placeholder="e.g., Lunch at Modern Cafe"
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="amount">Amount (₹)</label>
                        <input
                            type="number"
                            id="amount"
                            name="amount"
                            value={amount}
                            onChange={onChange}
                            placeholder="e.g., 150.00"
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="category">Category</label>
                        <select id="category" name="category" value={category} onChange={onChange}>
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Transaction Type</label>
                        <div className={styles.radioGroup}>
                            <label>
                                <input
                                    type="radio"
                                    name="transaction_type"
                                    value="expense"
                                    checked={transaction_type === 'expense'}
                                    onChange={onChange}
                                />
                                Expense
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="transaction_type"
                                    value="income"
                                    checked={transaction_type === 'income'}
                                    onChange={onChange}
                                />
                                Income
                            </label>
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="date">Date</label>
                        <input
                            type="date"
                            id="date"
                            name="date"
                            value={date}
                            onChange={onChange}
                            required
                        />
                    </div>

                    <button type="submit" className={styles.submitButton} disabled={isLoading}>
                        {isLoading ? 'Saving...' : 'Save Transaction'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AddTransactionPage;
