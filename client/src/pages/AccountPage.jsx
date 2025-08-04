// src/pages/AccountPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../styles/AccountPage.module.css';
import { FiUser, FiUsers, FiShield, FiTag, FiTrash2, FiPlus, FiLogOut, FiDownload, FiAlertTriangle } from 'react-icons/fi';
import {
    User,
    Crown,
    Copy,
    Mail,
    Phone,
    MapPin,
    Bell,
    Lock,
    CreditCard,
    ArrowUpFromLine,
    ArrowDownToLine,
    Shield
} from 'lucide-react';

// --- Reusable Component for Info Rows ---
const InfoRow = ({ label, value }) => (
    <div className={styles.infoRow}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>{value}</span>
    </div>
);

// --- Component to Manage Categories (now accepts user as a prop) ---
const CategoryManager = ({ user }) => {
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
            
            // Dynamic logic: If the user is in a family, set the category to be a family category
            // This flag is handled by the backend to determine if the category should have a familyId or userId
            const isFamilyCategory = !!user?.familyId;
            
            await axios.post('http://localhost:5000/api/categories', { name: newCategory.name, type: newCategory.type, isFamilyCategory }, config);
            setNewCategory({ name: '', type: 'expense' });
            fetchCategories();
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
                fetchCategories();
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
                            {!cat.isDefault ? (
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

// --- New Password Change Modal Component ---
const PasswordChangeModal = ({ onClose }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'Authorization': `Bearer ${token}` } };
            // Make a PUT request to the backend route to change the password
            await axios.put('http://localhost:5000/api/auth/password', { newPassword }, config);
            setSuccess('Password changed successfully!');
            // Automatically close the modal after a short delay
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (err) {
            console.error("Failed to change password", err);
            setError(err.response?.data?.msg || 'Failed to change password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContent}>
                <h3 className={styles.modalTitle}>Change Password</h3>
                <form onSubmit={handleSubmit} className={styles.passwordForm}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className={styles.input}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Confirm New Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={styles.input}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    {error && <p className={styles.errorMessage}>{error}</p>}
                    {success && <p className={styles.successMessage}>{success}</p>}
                    <div className={styles.modalButtons}>
                        <button type="button" onClick={onClose} className={styles.buttonOutline} disabled={isLoading}>Cancel</button>
                        <button type="submit" className={styles.buttonPrimary} disabled={isLoading}>
                            {isLoading ? 'Changing...' : 'Change Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- New Component for Notification Preferences ---
const NotificationPreferences = ({ user, setUser }) => {
    // State to manage notification settings
    const [notifications, setNotifications] = useState(user?.preferences?.notifications || {
        budgetAlerts: true,
        transactionNotifications: true,
        weeklyReports: false,
        cashPaymentAlerts: true,
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleToggle = async (setting) => {
        const updatedNotifications = { ...notifications, [setting]: !notifications[setting] };
        setNotifications(updatedNotifications);
        setIsSaving(true);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'Authorization': `Bearer ${token}` } };
            // Make a PUT request to the backend route to update notification preferences
            await axios.put('http://localhost:5000/api/alerts/notifications', { notifications: updatedNotifications }, config);
            
            // Optimistically update the user state
            setUser(prevUser => ({
            ...prevUser,
            preferences: {
                ...prevUser.preferences,
                notifications: updatedNotifications
            }
        }));
        } catch (error) {
            console.error("Failed to update notification preferences", error);
            // Revert the change if the API call fails
            setNotifications(notifications);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className={styles.card}>
            <div className={styles.cardHeader}>
                <Bell className={styles.icon} />
                <h2 className={styles.cardTitle}>Notification Preferences</h2>
            </div>
            <div className={styles.cardContent}>
                <div className={styles.notificationItem}>
                    <div className={styles.notificationDetails}>
                        <p className={styles.notificationTitle}>Budget Alerts</p>
                        <p className={styles.notificationDescription}>Get notified when budgets are exceeded</p>
                    </div>
                    <label className={styles.switch}>
                        <input type="checkbox" checked={notifications.budgetAlerts} onChange={() => handleToggle('budgetAlerts')} />
                        <span className={styles.slider} />
                    </label>
                </div>
                <div className={styles.notificationItem}>
                    <div className={styles.notificationDetails}>
                        <p className={styles.notificationTitle}>Transaction Notifications</p>
                        <p className={styles.notificationDescription}>Real-time updates on family expenses</p>
                    </div>
                    <label className={styles.switch}>
                        <input type="checkbox" checked={notifications.transactionNotifications} onChange={() => handleToggle('transactionNotifications')} />
                        <span className={styles.slider} />
                    </label>
                </div>
                <div className={styles.notificationItem}>
                    <div className={styles.notificationDetails}>
                        <p className={styles.notificationTitle}>Weekly Reports</p>
                        <p className={styles.notificationDescription}>Receive weekly spending summaries</p>
                    </div>
                    <label className={styles.switch}>
                        <input type="checkbox" checked={notifications.weeklyReports} onChange={() => handleToggle('weeklyReports')} />
                        <span className={styles.slider} />
                    </label>
                </div>
                <div className={styles.notificationItem}>
                    <div className={styles.notificationDetails}>
                        <p className={styles.notificationTitle}>Cash Payment Alerts</p>
                        <p className={styles.notificationDescription}>Alert when spending cash away from home</p>
                    </div>
                    <label className={styles.switch}>
                        <input type="checkbox" checked={notifications.cashPaymentAlerts} onChange={() => handleToggle('cashPaymentAlerts')} />
                        <span className={styles.slider} />
                    </label>
                </div>
                {isSaving && <p className={styles.savingMessage}>Saving preferences...</p>}
            </div>
        </div>
    );
};

// --- New Confirmation Modal Component (Reusable) ---
const ConfirmationModal = ({ onClose, onConfirm, title, message }) => {
    const [isProcessing, setIsProcessing] = useState(false);

    const handleConfirm = async () => {
        setIsProcessing(true);
        await onConfirm();
        setIsProcessing(false);
    };

    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContent}>
                <h3 className={styles.modalTitle}>{title}</h3>
                <p>{message}</p>
                <div className={styles.modalButtons}>
                    <button type="button" onClick={onClose} className={styles.buttonOutline} disabled={isProcessing}>Cancel</button>
                    <button type="button" onClick={handleConfirm} className={styles.buttonDestructive} disabled={isProcessing}>
                        {isProcessing ? 'Processing...' : 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Main Account Page Component ---
function AccountPage() {
    const [user, setUser] = useState(null);
    const [family, setFamily] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('profile');
    const [copied, setCopied] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showLeaveFamilyModal, setShowLeaveFamilyModal] = useState(false);
    const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);


    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { 'Authorization': `Bearer ${token}` } };
                const userRes = await axios.post('http://localhost:5000/api/auth/verify-token', { idToken: token }, config);
                setUser(userRes.data);
                if (userRes.data.familyId) {
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
    // Fallback for when data is loading or there's an error
    if (isLoading) {
        return <div className={styles.loading}>Loading settings...</div>;
    }
    if (error) {
        return <div className={`${styles.loading} ${styles.error}`}>{error}</div>;
    }

    const handleLeaveFamily = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'Authorization': `Bearer ${token}` } };
            await axios.post('http://localhost:5000/api/families/leave', {}, config);
            
            // On success, reset the family state and show a success message
            setFamily(null);
            setUser(prevUser => ({ ...prevUser, familyId: null }));
            // Optionally, show a toast notification for success
            alert('Successfully left the family.');
        } catch (error) {
            console.error("Failed to leave family", error);
            const errorMsg = error.response?.data?.msg || 'An error occurred while trying to leave the family.';
            alert(errorMsg);
        } finally {
            setShowLeaveFamilyModal(false);
        }
    };


    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <FiUser className={styles.icon} />
                            <h2 className={styles.cardTitle}>Personal Information</h2>
                        </div>
                        <div className={styles.cardContent}>
                            <div className={styles.profileHeader}>
                                <div className={styles.profileInfo}>
                                    <h3 className={styles.profileName}>{user?.username} <span className={styles.badgeOutline}>{user?.role}</span></h3>
                                    <p className={styles.profileEmail}>{user?.email}</p>
                                </div>
                            </div>
                            <button className={styles.buttonOutline}>Edit Profile</button>
                            <hr className={styles.separator} />
                            <div className={styles.formGrid}>
                                <div className={styles.inputGroup}>
                                    <label htmlFor="name" className={styles.label}>Full Name</label>
                                    <input id="name" value={user?.username} disabled className={styles.input} />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label htmlFor="email" className={styles.label}>Email Address</label>
                                    <div className={styles.inputWithIcon}>
                                        <Mail />
                                        <input id="email" value={user?.email} disabled className={styles.input} />
                                    </div>
                                </div>
                                <div className={styles.inputGroup}>
                                    <label htmlFor="phone" className={styles.label}>Phone Number</label>
                                    <div className={styles.inputWithIcon}>
                                        <Phone />
                                        <input id="phone" value={user?.phone || 'N/A'} disabled className={styles.input} />
                                    </div>
                                </div>
                                <div className={styles.inputGroup}>
                                    <label htmlFor="location" className={styles.label}>Location</label>
                                    <div className={styles.inputWithIcon}>
                                        <MapPin />
                                        <input id="location" value={user?.location || 'N/A'} disabled className={styles.input} />
                                    </div>
                                </div>
                                <div className={styles.inputGroup}>
                                    <label htmlFor="user-id" className={styles.label}>User ID</label>
                                    <div className={styles.inputWithButton}>
                                        <input id="user-id" value={user?.uid} disabled className={styles.input} />
                                        <button className={styles.iconButton} onClick={() => handleCopyId(user?.uid)}>
                                            <Copy />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'family':
                return (
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <FiUsers className={styles.icon} />
                            <h2 className={styles.cardTitle}>Family Information</h2>
                        </div>
                        <div className={styles.cardContent}>
                            {family ? (
                                <>
                                    <div className={styles.formGrid}>
                                        <div className={styles.inputGroup}>
                                            <label htmlFor="family-name" className={styles.label}>Family Name</label>
                                            <input id="family-name" value={family.name} disabled className={styles.input} />
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label htmlFor="family-id" className={styles.label}>Family ID</label>
                                            <div className={styles.inputWithButton}>
                                                <input id="family-id" value={family.id} disabled className={styles.input} />
                                                <button className={styles.iconButton} onClick={() => handleCopyId(family.id)}>
                                                    <Copy />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <hr className={styles.separator} />
                                    <div>
                                        <h4 className={styles.membersTitle}>Members ({family.members.length})</h4>
                                        <ul className={styles.membersList}>
                                            {family.members.map(member => (
                                                <li key={member.id} className={styles.memberItem}>
                                                    <span>{member.username} ({member.role})</span>
                                                    <span className={styles.memberStatus}>{member.status}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <hr className={styles.separator} />
                                    <div className={styles.dangerAction}>
                                        <button className={styles.buttonDestructive}>Leave Family</button>
                                    </div>
                                </>
                            ) : <p className="text-center">You are not currently in a family.</p>}
                        </div>
                    </div>
                );
            case 'categories':
                return (
                    <div className={styles.content}>
                        <h2 className={styles.contentTitle}>Manage Categories</h2>
                        <p className={styles.contentSubtitle}>Add or remove your custom income and expense categories.</p>
                        {/* Pass the user object to the CategoryManager */}
                        <CategoryManager user={user} />
                    </div>
                );
            case 'security':
                return (
                    <div className={styles.securityLayout}>
                        {/* Security Card */}
                        <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <Lock className={styles.icon} />
                                <h2 className={styles.cardTitle}>Security</h2>
                            </div>
                            <div className={styles.cardContent}>
                                <div className={styles.securityAction}>
                                    <div>
                                        <p className={styles.securityTitle}>Two-Factor Authentication</p>
                                        <p className={styles.securityDescription}>Add extra security to your account</p>
                                    </div>
                                    <label className={styles.switch}>
                                        <input type="checkbox" disabled />
                                        <span className={styles.slider} />
                                    </label>
                                </div>
                               <div className={styles.securityAction}>
                                    <div>
                                        <p className={styles.securityTitle}>Change Password</p>
                                        <p className={styles.securityDescription}>Update your account password</p>
                                    </div>
                                     <button
                                        onClick={() => {
                                            console.log('Change Password button clicked. Setting showPasswordModal to true.');
                                            setShowPasswordModal(true);
                                        }}
                                        className={styles.buttonOutline}
                                    >
                                        Change
                                    </button>
                                </div>
                                <div className={styles.securityAction}>
                                    <div>
                                        <p className={styles.securityTitle}>Login Sessions</p>
                                        <p className={styles.securityDescription}>Manage your active sessions</p>
                                    </div>
                                    <button className={styles.buttonOutline}>View</button>
                                </div>
                            </div>
                        </div>

                        {/* Notification Preferences Card */}
                        <NotificationPreferences user={user} setUser={setUser} />
                        
                        {/* Data Management Card */}
                        <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <ArrowDownToLine className={styles.icon} />
                                <h2 className={styles.cardTitle}>Data Management</h2>
                            </div>
                            <div className={styles.cardContent}>
                                <div className={styles.dataAction}>
                                    <div>
                                        <p className={styles.dataTitle}>Export Data</p>
                                        <p className={styles.dataDescription}>Download your financial data</p>
                                    </div>
                                    <button className={styles.buttonOutline}>Export</button>
                                </div>
                                <div className={styles.dataAction}>
                                    <div>
                                        <p className={styles.dataTitle}>Data Retention</p>
                                        <p className={styles.dataDescription}>Manage how long data is stored</p>
                                    </div>
                                    <select className={styles.select}>
                                        <option>1 year</option>
                                        <option>3 years</option>
                                        <option>5 years</option>
                                        <option>Forever</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Danger Zone Card */}
                        <div className={styles.dangerZoneCard}>
                            <div className={styles.dangerZoneHeader}>
                                <FiAlertTriangle className={styles.icon} />
                                <h2 className={styles.cardTitle}>Danger Zone</h2>
                            </div>
                            <div className={styles.dangerZoneContent}>
                                <div className={styles.dangerAction}>
                                    <div>
                                        <p className={styles.dangerTitle}>Leave Family</p>
                                        <p className={styles.dangerDescription}>Remove yourself from this family</p>
                                    </div>
                                    <button onClick={() => setShowLeaveFamilyModal(true)} className={styles.buttonDestructive}>Leave</button>
                                </div>
                                <div className={styles.dangerAction}>
                                    <div>
                                        <p className={styles.dangerTitle}>Delete Account</p>
                                        <p className={styles.dangerDescription}>Permanently delete your account</p>
                                    </div>
                                    <button className={styles.buttonDestructive}>Delete</button>
                                </div>
                            </div>
                        </div>
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
            {showPasswordModal && (
                <PasswordChangeModal onClose={() => setShowPasswordModal(false)} />
            )}

            {/* New Leave Family Confirmation Modal */}
            {showLeaveFamilyModal && (
                <ConfirmationModal 
                    onClose={() => setShowLeaveFamilyModal(false)}
                    onConfirm={handleLeaveFamily}
                    title="Leave Family"
                    message="Are you sure you want to leave this family? This action cannot be undone."
                />
            )}
        </div>
    );
}

export default AccountPage;