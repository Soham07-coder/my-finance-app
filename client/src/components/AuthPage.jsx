import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, AlertCircle, DollarSign, Loader2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from './ui/button.jsx';
import { Input } from './ui/input.jsx';
import { Label } from './ui/label.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.jsx';
import { Separator } from './ui/separator.jsx';
import { cn } from '../lib/utils.js';
import { auth } from '../firebase'; // Import the Firebase auth instance
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from 'firebase/auth';
import axios from 'axios'; // Still needed for the Google Sign-In backend call

export function AuthPage({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [firebaseError, setFirebaseError] = useState('');
  const navigate = useNavigate();

  const [resetPasswordMessage, setResetPasswordMessage] = useState('');
  const [resetPasswordError, setResetPasswordError] = useState('');

  const handleForgotPassword = async () => {
    setResetPasswordMessage('');
    setResetPasswordError('');

    if (!formData.email) {
      setResetPasswordError('Please enter your email to reset password.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, formData.email);
      setResetPasswordMessage('Password reset email sent! Please check your inbox.');
    } catch (error) {
      console.error('Password reset error:', error);
      let message = 'Failed to send reset email. Please try again.';
      if (error.code === 'auth/user-not-found') {
        message = 'No user found with this email.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address.';
      }
      setResetPasswordError(message);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!isLogin) {
      if (!formData.name) {
        newErrors.name = 'Full name is required';
      }
      if (!formData.phone) {
        newErrors.phone = 'Phone number is required';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAuthSuccess = async (user) => {
    try {
      const idToken = await user.getIdToken();
      const postData = { idToken };
      if (!isLogin) {
        postData.name = formData.name;
        postData.phone = formData.phone;
      }
      const res = await axios.post('http://localhost:5000/api/auth/verify-token', postData);
      localStorage.setItem('token', idToken);
      console.log("Logged in user data from backend:", res.data);
      onAuthSuccess();
      navigate('/dashboard');
    } catch (backendError) {
      console.error("Backend Verification Error:", backendError);
      setFirebaseError('Failed to verify user with backend. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailPasswordAuth = async () => {
    setIsLoading(true);
    setFirebaseError('');

    try {
      let userCredential;
      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
        console.log('User signed in successfully with email/password!');
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        console.log('User created successfully with email/password!');
      }
      await handleAuthSuccess(userCredential.user);
    } catch (error) {
      console.error('Firebase Auth Error:', error.code, error.message);
      let errorMessage = 'An unexpected error occurred. Please try again.';
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Your account has been disabled.';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No user found with this email.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password.';
          break;
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already in use.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Please use a stronger password.';
          break;
        default:
          errorMessage = error.message;
      }
      setFirebaseError(errorMessage);
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setFirebaseError('');

    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      console.log('Google Sign-In successful with Firebase!');
      await handleAuthSuccess(userCredential.user);
    } catch (error) {
      console.error('Google Sign-In Error:', error.code, error.message);
      let errorMessage = 'Failed to sign in with Google. Please try again.';
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Google sign-in window was closed.';
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = 'Another sign-in popup was already open.';
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'An account with this email already exists using a different sign-in method.';
      }
      setFirebaseError(errorMessage);
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      await handleEmailPasswordAuth();
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className={cn(
      "min-h-screen bg-background flex items-center justify-center text-base leading-relaxed",
      "p-4 sm:p-6 lg:p-8"
    )}>
      {/* Right Side - Auth Form (now centered) */}
      <div className="w-full max-w-md mx-auto">
        <Card className={cn(
          "border border-border shadow-sm bg-card",
          "w-full"
        )}>
          <CardHeader className="space-y-1 pb-4 text-center">
            <div className="flex items-center justify-center lg:hidden mb-4">
              <div className={cn(
                "w-8 h-8 bg-primary rounded-lg flex items-center justify-center",
                "shadow-md"
              )}>
                <DollarSign className="w-4 h-4 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="font-semibold text-center text-card-foreground" style={{ fontSize: '20px' }}>
              {isLogin ? 'Welcome back' : 'Create your account'}
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground" style={{ fontSize: '12px' }}>
              {isLogin
                ? 'Sign in to manage your family finances'
                : 'Start your journey to financial wellness'
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="auth-form-field">
                  <Label htmlFor="name" className="font-medium text-foreground" style={{ fontSize: '12px' }}>
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={cn(
                        "pl-9 auth-form-input",
                        errors.name && 'border-destructive focus-visible:ring-destructive/20'
                      )}
                      style={{ fontSize: '12px' }}
                    />
                  </div>
                  {errors.name && (
                    <div className="flex items-center gap-1 text-destructive" style={{ fontSize: '11px' }}>
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.name}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="auth-form-field">
                <Label htmlFor="email" className="font-medium text-foreground" style={{ fontSize: '12px' }}>
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={cn(
                      "pl-9 auth-form-input",
                      errors.email && 'border-destructive focus-visible:ring-destructive/20'
                    )}
                    style={{ fontSize: '12px' }}
                  />
                </div>
                {errors.email && (
                  <div className="flex items-center gap-1 text-destructive" style={{ fontSize: '11px' }}>
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.email}</span>
                  </div>
                )}
              </div>

              {!isLogin && (
                <div className="auth-form-field">
                  <Label htmlFor="phone" className="font-medium text-foreground" style={{ fontSize: '12px' }}>
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={cn(
                        "pl-9 auth-form-input",
                        errors.phone && 'border-destructive focus-visible:ring-destructive/20'
                      )}
                      style={{ fontSize: '12px' }}
                    />
                  </div>
                  {errors.phone && (
                    <div className="flex items-center gap-1 text-destructive" style={{ fontSize: '11px' }}>
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.phone}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="auth-form-field">
                <Label htmlFor="password" className="font-medium text-foreground" style={{ fontSize: '12px' }}>
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={isLogin ? 'Enter your password' : 'Create a password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={cn(
                      "pl-9 pr-9 auth-form-input",
                      errors.password && 'border-destructive focus-visible:ring-destructive/20'
                    )}
                    style={{ fontSize: '12px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <div className="flex items-center gap-1 text-destructive" style={{ fontSize: '11px' }}>
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.password}</span>
                  </div>
                )}
              </div>

              {!isLogin && (
                <div className="auth-form-field">
                  <Label htmlFor="confirmPassword" className="font-medium text-foreground" style={{ fontSize: '12px' }}>
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className={cn(
                        "pl-9 pr-9 auth-form-input",
                        errors.confirmPassword && 'border-destructive focus-visible:ring-destructive/20'
                      )}
                      style={{ fontSize: '12px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <div className="flex items-center gap-1 text-destructive" style={{ fontSize: '11px' }}>
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.confirmPassword}</span>
                    </div>
                  )}
                </div>
              )}

              {isLogin && (
                <div className="flex flex-col items-start py-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      id="remember"
                      type="checkbox"
                      className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
                    />
                    <Label htmlFor="remember" className="cursor-pointer text-foreground" style={{ fontSize: '12px' }}>
                      Remember me
                    </Label>
                  </div>
                  <Button
                    type="button"
                    variant="link"
                    className="text-primary hover:underline p-0 h-auto text-[12px]"
                    onClick={handleForgotPassword}
                  >
                    Forgot password?
                  </Button>
                  {resetPasswordMessage && (
                    <p className="text-green-600 text-[11px] mt-1">{resetPasswordMessage}</p>
                  )}
                  {resetPasswordError && (
                    <p className="text-destructive text-[11px] mt-1">{resetPasswordError}</p>
                  )}
                </div>
              )}
              <Button
                type="submit"
                disabled={isLoading}
                className={cn(
                  "w-full h-10 font-medium",
                  "bg-primary text-primary-foreground hover:bg-primary/90",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
                style={{ fontSize: '12px' }}
                size="lg"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin" />
                    <span style={{ fontSize: '12px' }}>{isLogin ? 'Signing in...' : 'Creating account...'}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: '12px' }}>{isLogin ? 'Sign In' : 'Create Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </Button>
            </form>

            <Separator className="my-4" />

            <div className="text-center">
              <span className="text-muted-foreground" style={{ fontSize: '12px' }}>
                {isLogin ? "Don't have an account?" : "Already have an account?"}
              </span>
              <Button
                variant="link"
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary hover:underline ml-1 p-0 h-auto"
                style={{ fontSize: '12px' }}
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </Button>
            </div>


            {/* Google Sign-In Button */}
            <Button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className={cn(
                "w-full h-10 font-medium rounded-md",
                "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              style={{ fontSize: '12px' }}
              size="lg"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span style={{ fontSize: '12px' }}>Signing in with Google...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {/* Google Icon SVG */}
                  <svg className="w-4 h-4" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M44.5 20H24V28.5H35.5C34.7 32.2 32.1 35.1 28.5 37.1V42.6C37.1 40.1 43.1 32.2 44.5 20Z" fill="#4285F4" />
                    <path d="M24 44C30.6 44 36.2 41.8 40.4 37.9L35.5 32.4C32.1 34.6 28.5 36.1 24 36.1C18.6 36.1 13.9 32.6 12.1 27.8L7.1 31.6C9.9 37.3 16.4 44 24 44Z" fill="#34A853" />
                    <path d="M12.1 27.8C11.6 26.4 11.3 25.1 11.3 24C11.3 22.9 11.6 21.6 12.1 20.2L7.1 16.4C5.3 19.8 4.3 21.9 4.3 24C4.3 26.1 5.3 28.2 7.1 31.6L12.1 27.8Z" fill="#FBBC05" />
                    <path d="M24 11.9C27.2 11.9 30 13.1 32.2 15.1L37.1 10.2C33.9 7.3 29.3 4 24 4C16.4 4 9.9 10.7 7.1 16.4L12.1 20.2C13.9 15.4 18.6 11.9 24 11.9Z" fill="#EA4335" />
                  </svg>
                  <span style={{ fontSize: '12px' }}>Sign in with Google</span>
                </div>
              )}
            </Button>

            {!isLogin && (
              <p className="text-muted-foreground text-center leading-relaxed" style={{ fontSize: '11px' }}>
                By creating an account, you agree to our{' '}
                <Button variant="link" className="text-primary hover:underline p-0 h-auto" style={{ fontSize: '11px' }}>
                  Terms of Service
                </Button>
                {' '}and{' '}
                <Button variant="link" className="text-primary hover:underline p-0 h-auto" style={{ fontSize: '11px' }}>
                  Privacy Policy
                </Button>
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}