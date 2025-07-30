// src/pages/Navbar.jsx
import React, { useState, useEffect } from 'react';
import styles from './Navbar.module.css';
import { FiMenu, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ isSidebarOpen, toggleSidebar }) => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // In a real app, you'd get user info from context or an API after login
        const mockUser = { name: 'Alex' };
        setUser(mockUser);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const userInitial = user ? user.name.charAt(0) : '';

    return (
        <nav className={styles.navbar}>
            <div className={styles.hamburger} onClick={toggleSidebar}>
                {isSidebarOpen ? <FiX /> : <FiMenu />}
            </div>
            <div style={{ flexGrow: 1 }}></div>
            <div className={styles.userProfile}>
                <span className={styles.userName}>{user?.name}</span>
                <div className={styles.avatar}>{userInitial}</div>
                <button onClick={handleLogout} style={{ marginLeft: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default Navbar;