// src/pages/AddTransactionPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/AddTransactionPage.module.css';
import { FiArrowLeft } from 'react-icons/fi';

function AddTransactionPage() {
    const [formData, setFormData] = useState({
        description: '', amount: '', category: '',
        type: 'expense',
        date: new Date().toISOString().split('T')[0],
    });
    const [isFamilyExpense, setIsFamilyExpense] = useState(false);
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const [isCashPayment, setIsCashPayment] = useState(false);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { 'Authorization': `Bearer ${token}` } };

                // Get user data from the new verify-token endpoint
                const userRes = await axios.post('http://localhost:5000/api/auth/verify-token', { idToken: token }, config);
                setUser(userRes.data);

                // Get categories from the new GET endpoint
                const categoriesRes = await axios.get('http://localhost:5000/api/categories', config);
                setCategories(categoriesRes.data);

                // Find and set the default expense category for initial state
                const defaultExpenseCat = categoriesRes.data.find(c => c.type === 'expense' && c.isDefault);
                if (defaultExpenseCat) {
                    setFormData(prev => ({ ...prev, category: defaultExpenseCat.name }));
                } else {
                    setFormData(prev => ({ ...prev, category: '' }));
                }
            } catch (error) {
                console.error("Could not fetch initial data", error);
            }
        };
        fetchData();
    }, []);

    const { description, amount, category, type, date } = formData;
    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleTypeChange = e => {
        const newType = e.target.value;
        // Filter categories based on the new type
        const newAvailableCategories = categories.filter(c => c.type === newType);
        // Set the new category to the first one in the filtered list, or an empty string
        const newCategory = newAvailableCategories.length > 0 ? newAvailableCategories[0].name : '';

        setFormData({
            ...formData,
            type: newType,
            category: newCategory
        });
    };

    const onSubmit = async e => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } };
            const finalAmount = type === 'expense' ? -Math.abs(amount) : Math.abs(amount);

            const body = {
                ...formData,
                amount: finalAmount,
                // The property is now familyId, not family_id
                familyId: isFamilyExpense && user?.familyId ? user.familyId : null,
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

    // Filter available categories based on the current transaction type
    const availableCategories = categories.filter(cat => cat.type === type);

    return (
        <div className={styles.pageContainer}>
            <div className={styles.header}>
                <button onClick={() => navigate(-1)} className={styles.backButton}><FiArrowLeft /> Back</button>
                <h1 className={styles.title}>Add New Transaction</h1>
            </div>
            <div className={styles.formContainer}>
                <form onSubmit={onSubmit}>
                    {error && <p className={styles.errorMessage}>{error}</p>}
                    {user?.familyId && ( // Check for familyId
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
                            <label><input type="radio" name="type" value="expense" checked={type === 'expense'} onChange={handleTypeChange} /> Expense</label>
                            <label><input type="radio" name="type" value="income" checked={type === 'income'} onChange={handleTypeChange} /> Income</label>
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