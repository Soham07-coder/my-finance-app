// src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/Navbar.module.css';
import { FiMenu, FiX, FiUser, FiLogOut, FiPlus, FiSearch, FiBell } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ isSidebarOpen, toggleSidebar }) => {
    const [user, setUser] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [alertsOpen, setAlertsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    const alertsRef = useRef(null);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const fetchCurrentUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const config = { headers: { 'Authorization': `Bearer ${token}` } };
                    const res = await axios.get('http://localhost:5000/api/auth/me', config);
                    setUser(res.data);
                } catch (error) {
                    console.error('Failed to fetch user', error);
                    handleLogout();
                }
            } else {
                handleLogout();
            }
        };
        fetchCurrentUser();
    }, []);

    // Fetch notifications
    useEffect(() => {
        const fetchNotifications = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const config = { headers: { 'Authorization': `Bearer ${token}` } };
                    // Assume a new endpoint for fetching alerts
                    const res = await axios.get('http://localhost:5000/api/alerts', config);
                    setNotifications(res.data);
                } catch (error) {
                    console.error('Failed to fetch notifications', error);
                }
            }
        };
        fetchNotifications();
        // Poll for new notifications every minute
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
            // Close alerts dropdown if click is outside
            if (alertsRef.current && !alertsRef.current.contains(event.target)) {
                setAlertsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            // Navigate to the transactions page with the search term as a URL parameter
            navigate(`/transactions?search=${searchQuery}`);
            setSearchQuery(''); // Clear search query after navigation
        }
    };

    const userInitial = user ? user.username.charAt(0).toUpperCase() : 'U';

    const dropdownVariants = {
        hidden: { opacity: 0, y: -10, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25 } }
    };

    return (
        <nav className={styles.navbar}>
            <div className={styles.hamburger} onClick={toggleSidebar}>
                {isSidebarOpen ? <FiX /> : <FiMenu />}
            </div>

            {/* Global Search and Add Expense Button */}
            <div className={styles.globalActions}>
                <form onSubmit={handleSearch} className={styles.searchForm}>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search transactions..."
                        className={styles.searchInput}
                    />
                    <button type="submit" className={styles.searchButton}>
                        <FiSearch />
                    </button>
                </form>
                <button onClick={() => navigate('/addtransactions')} className={styles.addButton}>
                    <FiPlus />
                    <span className={styles.addButtonText}>Add Expense</span>
                </button>
            </div>

            <div style={{ flexGrow: 1 }}></div>

            {/* Notification Bell and User Profile */}
            <div className={styles.userSection}>
                {/* Alerts/Notifications Menu */}
                <div className={styles.alertsMenu} ref={alertsRef}>
                    <button className={styles.alertsButton} onClick={() => setAlertsOpen(!alertsOpen)}>
                        <FiBell />
                        {notifications.length > 0 && (
                            <span className={styles.notificationBadge}>{notifications.length}</span>
                        )}
                    </button>
                    <AnimatePresence>
                        {alertsOpen && (
                            <motion.div
                                className={styles.alertsDropdown}
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                                variants={dropdownVariants}
                            >
                                <h4 className={styles.alertsTitle}>Notifications</h4>
                                {notifications.length > 0 ? (
                                    notifications.map((alert, index) => (
                                        <div key={index} className={styles.alertItem}>
                                            <p>{alert.message}</p>
                                            <span className={styles.alertDate}>{new Date(alert.date).toLocaleDateString()}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className={styles.noAlerts}>No new notifications.</p>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* User Profile Dropdown */}
                <div className={styles.userMenu} ref={dropdownRef}>
                    <button className={styles.userButton} onClick={() => setDropdownOpen(!dropdownOpen)}>
                        <span className={styles.userName}>{user?.username}</span>
                        <div className={styles.avatar}>{userInitial}</div>
                    </button>
                    <AnimatePresence>
                        {dropdownOpen && (
                            <motion.div
                                className={styles.dropdown}
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                                variants={dropdownVariants}
                            >
                                {user && (
                                    <div className={styles.dropdownHeader}>
                                        <p className={styles.dropdownUsername}>{user.username}</p>
                                        <p className={styles.dropdownEmail}>{user.email}</p>
                                    </div>
                                )}
                                <Link to="/account" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                                    <FiUser />
                                    <span>Account</span>
                                </Link>
                                <button onClick={handleLogout} className={styles.dropdownItem}>
                                    <FiLogOut />
                                    <span>Logout</span>
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;