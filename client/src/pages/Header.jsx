// src/pages/Header.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
    const handleLogout = () => {
        localStorage.removeItem('token');
        // This will force a refresh and redirect to the login page via the PrivateRoute
        window.location.href = '/login';
    };

    const token = localStorage.getItem('token');

    return (
        <header className="bg-white border-b border-gray-200">
            <div className="container mx-auto flex justify-between items-center p-4">
                <h1 className="text-2xl font-bold text-gray-800">
                    <Link to={token ? "/dashboard" : "/login"}>Finance Tracker</Link>
                </h1>
                {token && (
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                    >
                        Logout
                    </button>
                )}
            </div>
        </header>
    );
}

export default Header;