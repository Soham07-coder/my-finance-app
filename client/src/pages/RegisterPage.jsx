// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import styles from '../styles/RegisterPage.module.css'; // Import the CSS module
import { GoogleLogin } from '@react-oauth/google';
import { auth } from '../firebase'; // Import the Firebase auth instance
import { createUserWithEmailAndPassword } from 'firebase/auth'; // Firebase function for email/password registration

function RegisterPage() {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState(''); // State to hold error messages
    const [isLoading, setIsLoading] = useState(false); // State for loading indicator
    const navigate = useNavigate();

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setIsLoading(true); // Start loading
        setError(''); // Clear previous errors

        try {
            // Use Firebase SDK to create a new user with email and password
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;

            // After successful registration, get the Firebase ID token
            const idToken = await user.getIdToken();

            // Call your new backend endpoint to verify the token and create/update user data in Firestore
            // This ensures the user's profile is created in your Firestore 'users' collection
            await axios.post('http://localhost:5000/api/auth/verify-token', { idToken });

            // Store the Firebase token in local storage and navigate to dashboard
            localStorage.setItem('token', idToken);
            alert('Registration successful! You are now logged in.'); // Changed from "Please log in."
            navigate('/dashboard'); // Navigate directly to dashboard after registration and auto-login
        } catch (err) {
            console.error("Firebase Registration Error:", err.message);
            // Handle Firebase-specific errors (e.g., "auth/email-already-in-use")
            let errorMessage = 'Registration failed. Please try again.';
            if (err.code === 'auth/email-already-in-use') {
                errorMessage = 'This email is already in use. Please try logging in or use a different email.';
            } else if (err.code === 'auth/weak-password') {
                errorMessage = 'Password is too weak. Please choose a stronger password.';
            }
            setError(errorMessage);
        } finally {
            setIsLoading(false); // Stop loading
        }
    };

    // --- NEW: Google Sign-In Success Handler ---
    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            // Get the Firebase ID token from the Google credential
            const idToken = credentialResponse.credential;

            // Call your new backend endpoint to verify the token and get/create user data
            const res = await axios.post('http://localhost:5000/api/auth/verify-token', { idToken });

            // On success, your backend returns your app's JWT (or simply confirms the user data in Firestore)
            localStorage.setItem('token', idToken); // Store the Firebase token
            navigate('/dashboard');
        } catch (err) {
            setError('Google Sign-In failed. Please try again.');
            console.error("Google Sign-In Error:", err.message);
        }
    };

    const handleGoogleError = () => {
        setError('Google Sign-In was unsuccessful. Please try again.');
    };


    return (
        <div className={styles.container}>
            <div className={styles.formWrapper}>
                <h2 className={styles.title}>Create an Account</h2>
                <form className={styles.form} onSubmit={onSubmit}>
                    {error && <p className={styles.errorMessage}>{error}</p>} {/* Display error message */}
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Username</label>
                        <input
                            type="text"
                            name="username"
                            onChange={onChange}
                            required
                            className={styles.input}
                            placeholder="your_username"
                        />
                    </div>
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
                            minLength="6"
                            onChange={onChange}
                            required
                            className={styles.input}
                            placeholder="••••••••"
                        />
                    </div>
                    <button type="submit" className={styles.button} disabled={isLoading}>
                        {isLoading ? 'Registering...' : 'Register'} {/* Add loading state to button */}
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
                    Already have an account? <Link to="/login" className={styles.link}>Login</Link>
                </p>
            </div>
        </div>
    );
}

export default RegisterPage;