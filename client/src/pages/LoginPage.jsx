// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import styles from '../styles/LoginPage.module.css'
import { GoogleLogin } from '@react-oauth/google';

function LoginPage() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState(''); // State to hold error messages
    const [isLoading, setIsLoading] = useState(false); // State for loading indicator
    const navigate = useNavigate();

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setIsLoading(true); // Start loading
        setError(''); // Clear previous errors

        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', formData);
            localStorage.setItem('token', res.data.token);
            navigate('/dashboard');
        } catch (err) {
            const errorMessage = err.response?.data?.msg || 'An unexpected error occurred. Please try again.';
            setError(errorMessage); // Set the error message to be displayed
            console.error(err.response?.data);
        } finally {
            setIsLoading(false); // Stop loading
        }
    };

    // --- NEW: Google Sign-In Success Handler ---
    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            // Send the Google token to your backend
            const res = await axios.post('http://localhost:5000/api/auth/google', {
                token: credentialResponse.credential,
            });
            // On success, your backend returns your app's JWT
            localStorage.setItem('token', res.data.token);
            navigate('/dashboard');
        } catch (err) {
            setError('Google Sign-In failed. Please try again.');
            console.error(err);
        }
    };

    const handleGoogleError = () => {
        setError('Google Sign-In was unsuccessful. Please try again.');
    };

    return (
        <div className={styles.container}>
            <div className={styles.formWrapper}>
                <h2 className={styles.title}>Welcome Back</h2>
                <form className={styles.form} onSubmit={onSubmit}>
                    {error && <p className={styles.errorMessage}>{error}</p>}
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Email</label>
                        <input
                            type="email"
                            name="email"
                            onChange={onChange}
                            required
                            className={styles.input}
                            placeholder="you@example.com"
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Password</label>
                        <input
                            type="password"
                            name="password"
                            onChange={onChange}
                            required
                            className={styles.input}
                            placeholder="••••••••"
                        />
                    </div>
                    <button type="submit" className={styles.button} disabled={isLoading}>
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>

                    {/* --- NEW: Separator and Google Button --- */}
                    <div className={styles.separator}>
                        <span>OR</span>
                    </div>

                    <div className={styles.googleButtonContainer}>
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                            useOneTap
                            theme="outline"
                            shape="rectangular"
                            width="300px" // Adjust width as needed
                        />
                    </div>
                </form>
                <p className={styles.linkText}>
                    Don't have an account? <Link to="/register" className={styles.link}>Register</Link>
                </p>
            </div>
        </div>
    );
}

export default LoginPage;
