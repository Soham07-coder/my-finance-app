import React, { useState, useEffect } from 'react';
import styles from './Navbar.module.css';
import { FiMenu, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Make sure axios is imported

const Navbar = ({ isSidebarOpen, toggleSidebar }) => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Function to fetch the current user's data from the server
        const fetchCurrentUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const config = {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    };
                    // Call the new backend endpoint
                    const res = await axios.get('http://localhost:5000/api/auth/me', config);
                    setUser(res.data); // Set user state with data from the server
                } catch (error) {
                    console.error('Failed to fetch user', error);
                    // If token is invalid (e.g., expired), log the user out
                    handleLogout();
                }
            }
        };

        fetchCurrentUser();
    }, []); // Empty dependency array means this runs once when the component mounts

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null); // Clear the user state
        navigate('/login');
    };

    // Display the first letter of the username, or 'U' for User if not loaded yet
    const userInitial = user ? user.username.charAt(0) : 'U';

    return (
        <nav className={styles.navbar}>
            <div className={styles.hamburger} onClick={toggleSidebar}>
                {isSidebarOpen ? <FiX /> : <FiMenu />}
            </div>
            <div style={{ flexGrow: 1 }}></div>
            <div className={styles.userProfile}>
                <span className={styles.userName}>{user?.username}</span>
                <div className={styles.avatar}>{userInitial}</div>
                <button onClick={handleLogout} style={{ marginLeft: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default Navbar;