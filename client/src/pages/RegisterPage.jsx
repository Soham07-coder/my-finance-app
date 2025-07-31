// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import styles from '../styles/RegisterPage.module.css'; // Import the CSS module

function RegisterPage() {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const navigate = useNavigate();

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/auth/register', formData);
            alert('Registration successful! Please log in.');
            navigate('/login');
        } catch (err) {
            console.error(err.response?.data);
            alert('Registration Failed: ' + (err.response?.data.msg || 'Server Error'));
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.formWrapper}>
                <h2 className={styles.title}>Create an Account</h2>
                <form className={styles.form} onSubmit={onSubmit}>
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
                    <button type="submit" className={styles.button}>
                        Register
                    </button>
                </form>
                <p className={styles.linkText}>
                    Already have an account? <Link to="/login" className={styles.link}>Login</Link>
                </p>
            </div>
        </div>
    );
}

export default RegisterPage;