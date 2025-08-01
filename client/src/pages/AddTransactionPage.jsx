// src/pages/AddTransactionPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/AddTransactionPage.module.css';
import { FiArrowLeft } from 'react-icons/fi';

function AddTransactionPage() {
    const [formData, setFormData] = useState({
        description: '', amount: '', category: '',
        transaction_type: 'expense', date: new Date().toISOString().split('T')[0],
    });
    const [isFamilyExpense, setIsFamilyExpense] = useState(false);
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // NEW: State for "Paid with Cash"
    const [isCashPayment, setIsCashPayment] = useState(false);

    // This state will hold all categories fetched from the API
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { 'Authorization': `Bearer ${token}` } };

                const userRes = await axios.get('http://localhost:5000/api/auth/me', config);
                setUser(userRes.data);

                const categoriesRes = await axios.get('http://localhost:5000/api/categories', config);
                setCategories(categoriesRes.data);

                const defaultExpenseCat = categoriesRes.data.find(c => c.type === 'expense' && c.is_default);
                if (defaultExpenseCat) {
                    setFormData(prev => ({ ...prev, category: defaultExpenseCat.name }));
                }
            } catch (error) {
                console.error("Could not fetch initial data", error);
            }
        };
        fetchData();
    }, []);

    const { description, amount, category, transaction_type, date } = formData;
    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleTypeChange = e => {
        const newType = e.target.value;
        const firstCatOfType = categories.find(c => c.type === newType);
        setFormData({
            ...formData,
            transaction_type: newType,
            category: firstCatOfType ? firstCatOfType.name : ''
        });
    };

    const onSubmit = async e => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } };
            const finalAmount = transaction_type === 'expense' ? -Math.abs(amount) : Math.abs(amount);

            const body = {
                ...formData,
                amount: finalAmount,
                family_id: isFamilyExpense && user?.family_id ? user.family_id : null,
                // NEW: Add isCashPayment to the body
                isCashPayment: isCashPayment
            };
            await axios.post('http://localhost:5000/api/transactions', body, config);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to add transaction.');
        } finally {
            setIsLoading(false);
        }
    };

    const availableCategories = categories.filter(cat => cat.type === transaction_type);

    return (
        <div className={styles.pageContainer}>
            <div className={styles.header}>
                <button onClick={() => navigate(-1)} className={styles.backButton}><FiArrowLeft /> Back</button>
                <h1 className={styles.title}>Add New Transaction</h1>
            </div>
            <div className={styles.formContainer}>
                <form onSubmit={onSubmit}>
                    {error && <p className={styles.errorMessage}>{error}</p>}
                    {user?.family_id && (
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
                    <div className={styles.inputGroup}>
                        <label>Transaction Type</label>
                        <div className={styles.radioGroup}>
                            <label><input type="radio" name="transaction_type" value="expense" checked={transaction_type === 'expense'} onChange={handleTypeChange} /> Expense</label>
                            <label><input type="radio" name="transaction_type" value="income" checked={transaction_type === 'income'} onChange={handleTypeChange} /> Income</label>
                        </div>
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="category">Category</label>
                        <select id="category" name="category" value={category} onChange={onChange} required>
                            {availableCategories.length === 0 && <option disabled>Loading...</option>}
                            {availableCategories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                        </select>
                    </div>
                    <div className={styles.inputGroup}><label htmlFor="date">Date</label><input type="date" id="date" name="date" value={date} onChange={onChange} required /></div>

                    {/* NEW: "Paid with Cash?" checkbox */}
                    <div className={styles.inputGroup}>
                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                checked={isCashPayment}
                                onChange={(e) => setIsCashPayment(e.target.checked)}
                            />
                            Paid with Cash?
                        </label>
                    </div>
                    <button type="submit" className={styles.submitButton} disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Transaction'}</button>
                </form>
            </div>
        </div>
    );
}

export default AddTransactionPage;