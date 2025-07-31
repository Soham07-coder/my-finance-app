// src/pages/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from '../styles/Sidebar.module.css';
import { FiGrid, FiRepeat, FiBarChart2, FiSettings, FiUsers } from 'react-icons/fi';

const Sidebar = ({ isOpen, toggleSidebar }) => {

    const handleLinkClick = () => {
        // This function ensures the sidebar closes on mobile after a navigation event.
        if (window.innerWidth <= 768 && isOpen) {
            toggleSidebar();
        }
    };

    return (
        <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
            <div className={styles.logoSection}>
                <h2 className={styles.logo}>MyFinance</h2>
            </div>
            <nav className={styles.navSection}>
                <h3 className={styles.sectionTitle}>Menu</h3>
                <ul className={styles.navList}>
                    <li>
                        <NavLink to="/dashboard" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`} onClick={handleLinkClick}>
                            <FiGrid className={styles.navIcon} /> Dashboard
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/transactions" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`} onClick={handleLinkClick}>
                            <FiRepeat className={styles.navIcon} /> Transactions
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/family" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`} onClick={handleLinkClick}>
                            <FiUsers className={styles.navIcon} /> My Family
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/analytics" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`} onClick={handleLinkClick}>
                            <FiBarChart2 className={styles.navIcon} /> Analytics
                        </NavLink>
                    </li>
                </ul>
            </nav>
            <nav className={styles.navSection} style={{ marginTop: 'auto' }}>
                <h3 className={styles.sectionTitle}>Account</h3>
                <ul className={styles.navList}>
                    <li>
                        {/* Corrected this link to point to /account */}
                        <NavLink to="/account" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`} onClick={handleLinkClick}>
                            <FiSettings className={styles.navIcon} /> Settings
                        </NavLink>
                    </li>
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;
