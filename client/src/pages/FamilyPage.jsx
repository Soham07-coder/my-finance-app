// src/pages/FamilyPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../styles/FamilyPage.module.css';
import { FiUsers, FiPlus, FiLogIn, FiCopy, FiCheck } from 'react-icons/fi';

// Component to show when a user is already in a family
const FamilyDashboard = ({ familyData }) => {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
        // Copy the family ID to the clipboard
        navigator.clipboard.writeText(familyData.id);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    };

    return (
        <div>
            <h2 className={styles.familyTitle}>{familyData.name}</h2>
            <div className={styles.inviteSection}>
                <p>Invite others with this Family ID:</p>
                <div className={styles.inviteCodeBox}>
                    <strong>{familyData.id}</strong>
                    <button onClick={copyToClipboard} className={styles.copyButton}>
                        {copied ? <FiCheck color="green" /> : <FiCopy />}
                    </button>
                </div>
                {copied && <span className={styles.copiedMessage}>Copied!</span>}
            </div>
            <h3 className={styles.membersTitle}>Family Members</h3>
            <ul className={styles.memberList}>
                {familyData.members.map(member => (
                    <li key={member.id} className={styles.memberItem}>
                        <div className={styles.avatar}>{member.username.charAt(0).toUpperCase()}</div>
                        <div>
                            <p className={styles.memberName}>{member.username}</p>
                            <p className={styles.memberRole}>{member.role}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

// Component to show when a user is NOT in a family
const NoFamilyDashboard = ({ onFamilyJoined }) => {
    const [familyName, setFamilyName] = useState('');
    const [familyId, setFamilyId] = useState(''); // Updated to use familyId
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleCreateFamily = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'Authorization': `Bearer ${token}` } };
            await axios.post('http://localhost:5000/api/families/create', { name: familyName }, config);
            onFamilyJoined();
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to create family.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleJoinFamily = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'Authorization': `Bearer ${token}` } };
            // Send familyId instead of invite_code
            await axios.post('http://localhost:5000/api/families/join', { familyId: familyId }, config);
            onFamilyJoined();
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to join family.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.noFamilyGrid}>
            <div className={styles.formCard}>
                <h3 className={styles.formTitle}><FiPlus /> Create a New Family</h3>
                <p className={styles.formDescription}>Start a new shared space for your family's finances.</p>
                <form onSubmit={handleCreateFamily}>
                    <input
                        type="text"
                        placeholder="e.g., The Joshi Family"
                        value={familyName}
                        onChange={(e) => setFamilyName(e.target.value)}
                        className={styles.input}
                        required
                    />
                    <button type="submit" className={styles.button} disabled={isLoading}>
                        {isLoading ? 'Creating...' : 'Create'}
                    </button>
                </form>
            </div>
            <div className={styles.formCard}>
                <h3 className={styles.formTitle}><FiLogIn /> Join a Family</h3>
                <p className={styles.formDescription}>Enter a Family ID from a family member to join their space.</p>
                <form onSubmit={handleJoinFamily}>
                    <input
                        type="text"
                        placeholder="Enter Family ID"
                        value={familyId}
                        onChange={(e) => setFamilyId(e.target.value)}
                        className={styles.input}
                        required
                    />
                    <button type="submit" className={styles.button} disabled={isLoading}>
                        {isLoading ? 'Joining...' : 'Join'}
                    </button>
                </form>
            </div>
            {error && <p className={styles.errorMessage}>{error}</p>}
        </div>
    );
};

function FamilyPage() {
    const [familyData, setFamilyData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchFamilyData = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'Authorization': `Bearer ${token}` } };
            // The backend route is now a GET request
            const res = await axios.get('http://localhost:5000/api/families/my-family', config);
            setFamilyData(res.data);
        } catch (error) {
            console.error("Failed to fetch family data", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFamilyData();
    }, []);

    if (isLoading) {
        return <div className={styles.centeredMessage}>Loading family details...</div>;
    }

    return (
        <div className={styles.pageContainer}>
            <div className={styles.header}>
                <FiUsers className={styles.headerIcon} />
                <h1 className={styles.title}>My Family</h1>
            </div>
            <div className={styles.contentBox}>
                {familyData ? (
                    <FamilyDashboard familyData={familyData} />
                ) : (
                    <NoFamilyDashboard onFamilyJoined={fetchFamilyData} />
                )}
            </div>
        </div>
    );
}
export default FamilyPage;