// src/pages/AccountPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../styles/AccountPage.module.css'; // Make sure this path is correct
import { FiUser, FiUsers, FiShield, FiTag, FiTrash2, FiPlus } from 'react-icons/fi';

// --- Reusable Component for Info Rows ---
const InfoRow = ({ label, value }) => (
    <div className={styles.infoRow}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>{value}</span>
    </div>
);

// --- Component to Manage Categories ---
const CategoryManager = () => {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState({ name: '', type: 'expense' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const fetchCategories = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'Authorization': `Bearer ${token}` } };
            const res = await axios.get('http://localhost:5000/api/categories', config);
            setCategories(res.data);
        } catch (err) {
            console.error("Failed to fetch categories", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleAddCategory = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'Authorization': `Bearer ${token}` } };
            await axios.post('http://localhost:5000/api/categories', { name: newCategory.name, type: newCategory.type });
            setNewCategory({ name: '', type: 'expense' }); // Reset form
            fetchCategories(); // Refresh list
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to add category.');
        }
    };

    const handleDeleteCategory = async (id) => {
        if (window.confirm('Are you sure you want to delete this category? This cannot be undone.')) {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { 'Authorization': `Bearer ${token}` } };
                await axios.delete(`http://localhost:5000/api/categories/${id}`, config);
                fetchCategories(); // Refresh list
            } catch (err) {
                alert(err.response?.data?.msg || 'Failed to delete category.');
            }
        }
    };

    return (
        <div>
            <form onSubmit={handleAddCategory} className={styles.addCategoryForm}>
                <input
                    type="text"
                    placeholder="New category name"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    required
                />
                <select value={newCategory.type} onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value })}>
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                </select>
                <button type="submit"><FiPlus /> Add</button>
            </form>
            {error && <p className={styles.errorMessage}>{error}</p>}

            {isLoading ? <p>Loading categories...</p> : (
                <ul className={styles.categoryList}>
                    {categories.map(cat => (
                        <li key={cat.id} className={styles.categoryItem}>
                            <span className={`${styles.categoryType} ${styles[cat.type]}`}>{cat.type}</span>
                            <span className={styles.categoryName}>{cat.name}</span>
                            {!cat.is_default ? (
                                <button onClick={() => handleDeleteCategory(cat.id)} className={styles.deleteButton} title="Delete Category">
                                    <FiTrash2 />
                                </button>
                            ) : (
                                <span className={styles.defaultTag}>Default</span>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

// --- Main Account Page Component ---
function AccountPage() {
    const [user, setUser] = useState(null);
    const [family, setFamily] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('profile');

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { 'Authorization': `Bearer ${token}` } };
                const userRes = await axios.get('http://localhost:5000/api/auth/me', config);
                setUser(userRes.data);
                if (userRes.data.family_id) {
                    const familyRes = await axios.get('http://localhost:5000/api/families/my-family', config);
                    setFamily(familyRes.data);
                }
            } catch (error) {
                console.error("Failed to fetch account data", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const renderContent = () => {
        if (isLoading) {
            return <div className={styles.loading}>Loading...</div>;
        }
        switch (activeTab) {
            case 'profile':
                return (
                    <div className={styles.content}>
                        <h2 className={styles.contentTitle}>Profile Information</h2>
                        <InfoRow label="Username" value={user?.username} />
                        <InfoRow label="Email Address" value={user?.email} />
                    </div>
                );
            case 'family':
                return (
                    <div className={styles.content}>
                        <h2 className={styles.contentTitle}>Family Details</h2>
                        {family ? (
                            <>
                                <InfoRow label="Family Name" value={family.name} />
                                <InfoRow label="Invite Code" value={family.invite_code} />
                                <h3 className={styles.membersTitle}>Members ({family.members.length})</h3>
                                <ul className={styles.membersList}>
                                    {family.members.map(member => (
                                        <li key={member.id}>{member.username} ({member.role})</li>
                                    ))}
                                </ul>
                            </>
                        ) : <p>You are not currently in a family.</p>}
                    </div>
                );
            case 'categories':
                return (
                    <div className={styles.content}>
                        <h2 className={styles.contentTitle}>Manage Categories</h2>
                        <p className={styles.contentSubtitle}>Add or remove your custom income and expense categories.</p>
                        <CategoryManager />
                    </div>
                );
            case 'security':
                return (
                    <div className={styles.content}>
                        <h2 className={styles.contentTitle}>Security Settings</h2>
                        <p>Password change functionality will be available in a future update.</p>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className={styles.accountPage}>
            <header className={styles.header}>
                <h1>Account Settings</h1>
                <p>Manage your profile, family, categories, and security settings.</p>
            </header>
            <div className={styles.mainLayout}>
                <aside className={styles.sidebar}>
                    <nav>
                        <button onClick={() => setActiveTab('profile')} className={activeTab === 'profile' ? styles.active : ''}><FiUser /> Profile</button>
                        <button onClick={() => setActiveTab('family')} className={activeTab === 'family' ? styles.active : ''}><FiUsers /> Family</button>
                        <button onClick={() => setActiveTab('categories')} className={activeTab === 'categories' ? styles.active : ''}><FiTag /> Categories</button>
                        <button onClick={() => setActiveTab('security')} className={activeTab === 'security' ? styles.active : ''}><FiShield /> Security</button>
                    </nav>
                </aside>
                <main className={styles.contentContainer}>
                    {renderContent()}
                </main>
            </div>
        </div>
    );
}

export default AccountPage;
