import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'; // Import useNavigate
import { getAuth, onAuthStateChanged } from 'firebase/auth'; // Import for auth state listener
import { auth } from './firebase'; // Import the Firebase auth instance

// Import your page components
import { Layout } from './components/Layout.jsx';
import { AuthPage } from './components/AuthPage.jsx';
import { DashboardPage } from './components/DashboardPage.jsx';
import { TransactionsPage } from './components/TransactionsPage.jsx';
import { MyFamilyPage } from './components/MyFamilyPage.jsx';
import { AnalyticsPage } from './components/AnalyticsPage.jsx';
import { SettingsPage } from './components/SettingsPage.jsx';
import { AddTransactionPage } from './components/AddTransactionPage.jsx';

// Create a context for sharing authentication and user data
const AuthContext = createContext(null);

// A custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// A component that provides the AuthContext and manages global state
const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [viewMode, setViewMode] = useState('family'); // 'personal' or 'family'
  const [loadingAuthInitial, setLoadingAuthInitial] = useState(true); // New state for initial Firebase auth loading

  // Initialize app state and listen to Firebase Auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in with Firebase
        // Here, you might want to fetch the full user data from your backend
        // using the firebaseUser.uid or firebaseUser.getIdToken()
        // For now, we'll use a placeholder or the data from localStorage if available
        const savedUser = localStorage.getItem('familyfin_user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        } else {
          // If no saved user, use basic Firebase user info
          setUser({
            id: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email,
            email: firebaseUser.email,
            profilePicture: firebaseUser.photoURL,
            role: 'member' // Default role
          });
        }
        setIsAuthenticated(true);
      } else {
        // User is signed out
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('familyfin_auth');
        localStorage.removeItem('familyfin_user');
        localStorage.removeItem('token'); // Clear the backend token too
      }
      setLoadingAuthInitial(false); // Initial auth check complete
    });

    // Clean up the listener on component unmount
    return () => unsubscribe();
  }, []);

  // This function is called by AuthPage upon successful login/registration and backend verification
  const handleAuthSuccess = (userDataFromBackend = null) => {
    // The userDataFromBackend should contain the user object returned by your /api/auth/verify-token endpoint
    const defaultUser = { id: 'unknown', name: 'Guest', email: 'guest@example.com', role: 'member' };
    const userToSet = userDataFromBackend || defaultUser;
    
    setIsAuthenticated(true);
    setUser(userToSet);
    
    // Store authentication status and user data in local storage
    localStorage.setItem('familyfin_auth', 'true');
    localStorage.setItem('familyfin_user', JSON.stringify(userToSet));
    // The 'token' is already set by AuthPage.jsx after backend verification
  };

  const handleLogout = async () => {
    try {
      await auth.signOut(); // Sign out from Firebase
      // The onAuthStateChanged listener will handle updating isAuthenticated and user state
      console.log("User signed out from Firebase.");
    } catch (error) {
      console.error("Error signing out from Firebase:", error);
    }
  };

  const value = {
    isAuthenticated,
    user,
    viewMode,
    setViewMode,
    handleAuthSuccess, // This is the function passed to AuthPage
    handleLogout,
    loadingAuthInitial, // Expose loading state
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// A wrapper for authenticated routes
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loadingAuthInitial } = useAuth();

  if (loadingAuthInitial) {
    // Show a loading indicator while Firebase auth is being initialized
    return <div className="min-h-screen flex items-center justify-center text-lg">Loading authentication...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Main App component that defines the routes
export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // The main layout component that wraps protected routes
  const AppLayout = () => {
    const { handleLogout, viewMode, setViewMode, user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate(); // Get the navigate function from React Router
    
    // currentPage is now derived from the URL path
    const currentPage = location.pathname.split('/')[1] || 'dashboard';

    // Function to handle navigation within the Layout and other pages
    const handleNavigate = (path) => {
      navigate(`/${path}`); // Use navigate to change the route
      setSidebarOpen(false); // Close sidebar on navigation (for mobile)
    };

    return (
      <Layout
        currentPage={currentPage}
        onNavigate={handleNavigate} // Pass the handleNavigate function as onNavigate prop to Layout
        onLogout={handleLogout}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        user={user}
      >
        <Routes>
          {/* Pass onNavigate to each page component that needs it */}
          <Route path="dashboard" element={<DashboardPage onNavigate={handleNavigate} />} />
          <Route path="transactions" element={<TransactionsPage onNavigate={handleNavigate} />} />
          <Route path="my-family" element={<MyFamilyPage onNavigate={handleNavigate} />} />
          <Route path="analytics" element={<AnalyticsPage onNavigate={handleNavigate} />} />
          <Route path="settings" element={<SettingsPage onNavigate={handleNavigate} />} />
          <Route path="add-transaction" element={<AddTransactionPage onNavigate={handleNavigate} />} />
          {/* Default route to redirect to dashboard if path is not found */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
    );
  };
  
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Route - for login/authentication */}
          {/* We now use a wrapper to pass the handleAuthSuccess from AuthProvider */}
          <Route path="/login" element={<AuthRouteWrapper />} />

          {/* Protected Routes - rendered inside the Layout */}
          <Route path="/*" element={<PrivateRoute><AppLayout /></PrivateRoute>} />

          {/* Redirect from root URL to the login page */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

// New wrapper component to provide handleAuthSuccess to AuthPage
const AuthRouteWrapper = () => {
  const { handleAuthSuccess } = useAuth();
  return <AuthPage onAuthSuccess={handleAuthSuccess} />;
};