// src/pages/AccountPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../styles/AccountPage.module.css';

function AccountPage() {
    const [user, setUser] = useState(null);
    const [family, setFamily] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { 'Authorization': `Bearer ${token}` } };

                // Fetch user data first
                const userRes = await axios.get('http://localhost:5000/api/auth/me', config);
                setUser(userRes.data);

                // If user has a family, fetch family data
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

    if (isLoading) {
        return <div className={styles.loading}>Loading Account...</div>;
    }

    return (
        <div className={styles.accountPage}>
            <h1>My Account</h1>
            <div className={styles.card}>
                <h2 className={styles.cardTitle}>Profile Information</h2>
                <div className={styles.infoRow}>
                    <span className={styles.label}>Username</span>
                    <span className={styles.value}>{user?.username}</span>
                </div>
                <div className={styles.infoRow}>
                    <span className={styles.label}>Email</span>
                    <span className={styles.value}>{user?.email}</span>
                </div>
            </div>

            {family && (
                <div className={styles.card}>
                    <h2 className={styles.cardTitle}>Family Details</h2>
                    <div className={styles.infoRow}>
                        <span className={styles.label}>Family Name</span>
                        <span className={styles.value}>{family.name}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.label}>Invite Code</span>
                        <span className={`${styles.value} ${styles.code}`}>{family.invite_code}</span>
                    </div>
                    <h3 className={styles.membersTitle}>Members</h3>
                    <ul className={styles.membersList}>
                        {family.members.map(member => (
                            <li key={member.id}>{member.username} ({member.role})</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default AccountPage;
