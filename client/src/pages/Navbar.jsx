// src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/Navbar.module.css';
import { FiMenu, FiX, FiUser, FiLogOut } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ isSidebarOpen, toggleSidebar }) => {
    const [user, setUser] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

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

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
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

            <div style={{ flexGrow: 1 }}></div>

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
        </nav>
    );
};

export default Navbar;
