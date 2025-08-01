// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from '../styles/LoginPage.module.css';
import { GoogleLogin } from '@react-oauth/google';
import { auth } from '../firebase'; // Import the Firebase auth instance
import { signInWithEmailAndPassword } from 'firebase/auth'; // Firebase function for email/password login
import axios from 'axios'; // Still needed for the Google Sign-In backend call

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
            // Use Firebase SDK to sign in with email and password
            const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;

            // After a successful sign-in, get the Firebase ID token
            const idToken = await user.getIdToken();

            // Call your new backend endpoint to verify the token and get/create user data
            // This is the new, single point of authentication for your app
            const res = await axios.post('http://localhost:5000/api/auth/verify-token', { idToken });

            // Store the Firebase token in local storage for future requests
            localStorage.setItem('token', idToken);
            console.log("Logged in user data:", res.data); // Log the user data from your backend
            navigate('/dashboard');
        } catch (err) {
            // Handle Firebase-specific errors
            console.error("Firebase Login Error:", err.message);
            setError('Invalid email or password. Please try again.');
        } finally {
            setIsLoading(false); // Stop loading
        }
    };

    // --- NEW: Google Sign-In Success Handler ---
    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            // Send the Google token to your backend
            // NOTE: This call should also be updated to use the Firebase flow if your backend is fully Firebase-centric
            // For now, let's keep the existing logic and assume your backend's /api/auth/google route
            // has been updated to return a Firebase token.
            const res = await axios.post('http://localhost:5000/api/auth/google', {
                token: credentialResponse.credential,
            });
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