import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card.jsx';
import { Button } from './ui/button.jsx';
import { Input } from './ui/input.jsx';
import { Separator } from './ui/separator.jsx';
import { Label } from './ui/label.jsx';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar.jsx';
import { Badge } from './ui/badge.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select.jsx';
import {
    User,
    Users,
    Camera,
    Mail,
    Phone,
    MapPin,
    Shield,
    Plus,
    Crown,
    Copy,
    Check,
    MoreVertical,
} from 'lucide-react';
import { cn } from '../lib/utils.js';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu.jsx';

// Reusable Confirmation Modal Component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, isProcessing }) => {
    if (!isOpen) return null;
    
    return (
        <div className={cn(
            "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm",
            "p-4 sm:p-6 lg:p-8"
        )}>
            <div className={cn("w-full max-w-md rounded-lg bg-card p-6 shadow-lg space-y-4")}>
                <h3 className="text-xl font-semibold">{title}</h3>
                <p className="text-muted-foreground">{message}</p>
                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose} disabled={isProcessing}>Cancel</Button>
                    <Button variant="destructive" onClick={onConfirm} disabled={isProcessing}>
                        {isProcessing ? 'Processing...' : 'Confirm'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

// Password Change Modal Component
const PasswordChangeModal = ({ onClose }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'Authorization': `Bearer ${token}` } };
            await axios.put('http://localhost:5000/api/auth/password', { newPassword }, config);
            setSuccess('Password changed successfully!');
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (err) {
            console.error("Failed to change password", err);
            setError(err.response?.data?.msg || 'Failed to change password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className={cn(
            "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm",
            "p-4 sm:p-6 lg:p-8"
        )}>
            <div className={cn("w-full max-w-md rounded-lg bg-card p-6 shadow-lg space-y-4")}>
                <h3 className="text-xl font-semibold">Change Password</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input
                            id="new-password"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input
                            id="confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    {success && <p className="text-sm text-green-500">{success}</p>}
                    <div className="flex justify-end gap-3">
                        <Button type="button" onClick={onClose} variant="outline" disabled={isLoading}>Cancel</Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Changing...' : 'Change Password'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Notification Preferences Component
const NotificationPreferences = ({ user, setUser }) => {
    const [notifications, setNotifications] = useState(user?.preferences?.notifications || {
        budgetAlerts: true,
        transactionNotifications: true,
        weeklyReports: false,
        cashPaymentAlerts: true,
    });
    const [isSaving, setIsSaving] = useState(false);
    const handleToggle = async (setting) => {
        const updatedNotifications = { ...notifications, [setting]: !notifications[setting] };
        setNotifications(updatedNotifications);
        setIsSaving(true);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'Authorization': `Bearer ${token}` } };
            await axios.put('http://localhost:5000/api/alerts/notifications', { notifications: updatedNotifications }, config);
            setUser(prevUser => ({
                ...prevUser,
                preferences: {
                    ...prevUser.preferences,
                    notifications: updatedNotifications
                }
            }));
        } catch (error) {
            console.error("Failed to update notification preferences", error);
            setNotifications(notifications);
        } finally {
            setIsSaving(false);
        }
    };
    return (
        <Card className="shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-4">
                <CardTitle style={{ fontSize: '18px', fontWeight: '600' }}>Notification Preferences</CardTitle>
                <CardDescription style={{ fontSize: '12px' }}>Manage email and push notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <Label className="text-sm font-medium">Budget Alerts</Label>
                        <p className="text-xs text-muted-foreground">Get notified when budgets are exceeded</p>
                    </div>
                    <input type="checkbox" checked={notifications.budgetAlerts} onChange={() => handleToggle('budgetAlerts')} className="toggle" />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                    <div>
                        <Label className="text-sm font-medium">Transaction Notifications</Label>
                        <p className="text-xs text-muted-foreground">Real-time updates on family expenses</p>
                    </div>
                    <input type="checkbox" checked={notifications.transactionNotifications} onChange={() => handleToggle('transactionNotifications')} className="toggle" />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                    <div>
                        <Label className="text-sm font-medium">Weekly Reports</Label>
                        <p className="text-xs text-muted-foreground">Receive weekly spending summaries</p>
                    </div>
                    <input type="checkbox" checked={notifications.weeklyReports} onChange={() => handleToggle('weeklyReports')} className="toggle" />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                    <div>
                        <Label className="text-sm font-medium">Cash Payment Alerts</Label>
                        <p className="text-xs text-muted-foreground">Alert when spending cash away from home</p>
                    </div>
                    <input type="checkbox" checked={notifications.cashPaymentAlerts} onChange={() => handleToggle('cashPaymentAlerts')} className="toggle" />
                </div>
                {isSaving && <p className="text-sm text-right text-muted-foreground">Saving preferences...</p>}
            </CardContent>
        </Card>
    );
};

const CategoryManager = ({ user }) => {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState({ name: '', type: 'expense' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleteProcessing, setIsDeleteProcessing] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const fetchCategories = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.get('http://localhost:5000/api/categories', config);
            setCategories(res.data);
        } catch (err) {
            console.error("Failed to fetch categories", err);
            setError('Failed to load categories.');
        } finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        fetchCategories();
    }, []);
    const handleAddCategory = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const isFamilyCategory = !!user?.familyId;
            await axios.post(
                'http://localhost:5000/api/categories',
                { name: newCategory.name, type: newCategory.type, isFamilyCategory },
                config
            );
            setNewCategory({ name: '', type: 'expense' });
            fetchCategories();
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to add category.');
        }
    };
    const confirmDeleteCategory = (id) => {
        setCategoryToDelete(id);
        setShowDeleteConfirm(true);
    };
    const handleDeleteCategory = async () => {
        if (!categoryToDelete) return;
        setIsDeleteProcessing(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.delete(`http://localhost:5000/api/categories/${categoryToDelete}`, config);
            fetchCategories();
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to delete category.');
        } finally {
            setIsDeleteProcessing(false);
            setShowDeleteConfirm(false);
            setCategoryToDelete(null);
        }
    };
    return (
        <>
            <ConfirmationModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDeleteCategory}
                title="Delete Category"
                message="Are you sure you want to delete this category? This action cannot be undone."
                isProcessing={isDeleteProcessing}
            />
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Users className="h-5 w-5" />
                        <span>Manage Categories</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAddCategory} className="flex flex-col space-y-3 mb-4">
                        <Input
                            type="text"
                            placeholder="New category name"
                            value={newCategory.name}
                            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                            required
                        />
                        <Select
                            value={newCategory.type}
                            onValueChange={(value) => setNewCategory({ ...newCategory, type: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select category type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="expense">Expense</SelectItem>
                                <SelectItem value="income">Income</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button type="submit" className="inline-flex items-center gap-2 justify-center">
                            <FiPlus />
                            Add Category
                        </Button>
                        {error && <p className="text-sm text-red-600 flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</p>}
                    </form>
                    {isLoading ? (
                        <p>Loading categories...</p>
                    ) : (
                        <ul className="divide-y divide-border border rounded-md overflow-hidden">
                            {categories.map((cat) => (
                                <li key={cat.id} className="flex items-center justify-between p-3">
                                    <div>
                                        <span
                                            className={cn(
                                                'px-2 py-0.5 rounded text-xs font-semibold',
                                                cat.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            )}
                                        >
                                            {cat.type}
                                        </span>
                                        <span className="ml-3 text-sm font-medium">{cat.name}</span>
                                    </div>
                                    {!cat.isDefault ? (
                                        <button
                                            onClick={() => confirmDeleteCategory(cat.id)}
                                            className="text-red-500 hover:text-red-700 p-1"
                                            title="Delete Category"
                                            type="button"
                                        >
                                            <FiTrash2 size={16} />
                                        </button>
                                    ) : (
                                        <span className="text-xs text-muted-foreground italic">Default</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </>
    );
};

export function SettingsPage({ onLogout, onNavigate }) {
    const [activeTab, setActiveTab] = useState('profile');
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [copied, setCopied] = useState(false);
    const [user, setUser] = useState(null);
    const [familyMembers, setFamilyMembers] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editableProfile, setEditableProfile] = useState({
        username: '',
        phone: '',
        location: '',
    });
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showLeaveFamilyModal, setShowLeaveFamilyModal] = useState(false);
    const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
    const [isLeaveProcessing, setIsLeaveProcessing] = useState(false);
    const [isDeleteAccProcessing, setIsDeleteAccProcessing] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Authentication token not found. Please log in again.');
                setIsLoading(false);
                return;
            }
            try {
                const config = { headers: { 'Authorization': `Bearer ${token}` } };
                const userRes = await axios.post('http://localhost:5000/api/auth/verify-token', { idToken: token }, config);
                const fetchedUser = userRes.data.user;
                setUser(fetchedUser);

                setEditableProfile({
                    username: fetchedUser.username || '',
                    phone: fetchedUser.phone || '',
                    location: fetchedUser.location || '',
                });
                if (fetchedUser.familyId) {
                    const familyRes = await axios.get('http://localhost:5000/api/families/my-family', config);
                    setFamilyMembers(familyRes.data.members);
                } else {
                    setFamilyMembers([]);
                }
            } catch (err) {
                console.error("Failed to fetch account data", err);
                setError(err.response?.data?.msg || 'Failed to load user and family data.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const currentUser = user;
    const memberCount = familyMembers ? familyMembers.length : 0;
    const totalFamilyMembers = memberCount + (currentUser ? 1 : 0);
    const userJoinedDate = currentUser?.createdAt ? new Date(parseInt(currentUser.createdAt)).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
    const userInitials = currentUser?.email?.charAt(0).toUpperCase() || 'S';
    const userNameDisplay = currentUser?.username || currentUser?.email || 'User Name';
    const userIdDisplay = currentUser?.localId || '';
    const userPhone = currentUser?.phone || 'N/A';
    const userLocation = currentUser?.location || 'N/A';
    const userRole = currentUser?.role || 'Member';

    const handleCopyUserId = () => {
        if (userIdDisplay) {
            navigator.clipboard.writeText(userIdDisplay);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };
    const handleCopyFamilyId = () => {
        if (currentUser?.familyId) {
            navigator.clipboard.writeText(currentUser.familyId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };
    const getRoleIcon = (role) => {
        switch (role) {
            case 'Family Admin': return <Crown className="h-4 w-4 text-yellow-600" />;
            case 'Member': return <User className="h-4 w-4 text-blue-600" />;
            default: return <User className="h-4 w-4" />;
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'inactive': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    const handleLeaveFamily = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'Authorization': `Bearer ${token}` } };
            await axios.post('http://localhost:5000/api/families/leave', {}, config);
            onNavigate('dashboard');
        } catch (error) {
            console.error("Failed to leave family", error);
            alert(error.response?.data?.msg || 'An error occurred while trying to leave the family.');
        } finally {
            setShowLeaveFamilyModal(false);
        }
    };
     const handleAccountDeletion = async () => {
        setIsDeleteAccProcessing(true);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'Authorization': `Bearer ${token}` } };
            await axios.delete('http://localhost:5000/api/user/delete', config);
            onLogout();
        } catch (error) {
            console.error("Failed to delete account", error);
            alert(error.response?.data?.msg || 'An error occurred while trying to delete your account.');
        } finally {
            setShowDeleteAccountModal(false);
            setIsDeleteAccProcessing(false);
        }
    };
    const handleProfileSubmit = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'Authorization': `Bearer ${token}` } };
            const res = await axios.put('http://localhost:5000/api/user/profile', editableProfile, config);
            setUser(res.data.user);
            setIsEditingProfile(false);
        } catch (err) {
            console.error("Failed to update profile", err);
            alert(err.response?.data?.msg || 'Failed to update profile. Please try again.');
        }
    };
    if (isLoading) {
        return <div>Loading settings...</div>;
    }
    if (error) {
        return <div>Error: {error}</div>;
    }
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1>Profile & Settings</h1>
                <p className="text-muted-foreground">Manage your account and family settings</p>
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="flex w-full gap-2 border-b">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="family">Family</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                    <TabsTrigger value="categories">Categories</TabsTrigger>
                </TabsList>
                <TabsContent value="profile" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <User className="h-5 w-5" />
                                <span>Personal Information</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
                                <div className="relative">
                                    <Avatar className="h-24 w-24">
                                        <AvatarImage src={currentUser?.profilePicture} alt={userNameDisplay} />
                                        <AvatarFallback className="text-2xl">
                                            {userInitials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="absolute bottom-0 right-0 h-8 w-8 rounded-full p-0"
                                    >
                                        <Camera className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center space-x-2">
                                        <h3 className="text-xl font-semibold">{editableProfile.username || userNameDisplay}</h3>
                                        <div className="flex items-center space-x-1">
                                            {getRoleIcon(userRole)}
                                            <Badge variant="outline">{userRole}</Badge>
                                        </div>
                                    </div>
                                    <p className="text-muted-foreground">{currentUser?.email || 'N/A'}</p>
                                    <p className="text-sm text-muted-foreground">
                                        Member since {userJoinedDate}
                                    </p>
                                </div>
                                <Button
                                    variant={isEditingProfile ? "default" : "outline"}
                                    onClick={isEditingProfile ? handleProfileSubmit : () => setIsEditingProfile(true)}
                                >
                                    {isEditingProfile ? 'Save Changes' : 'Edit Profile'}
                                </Button>
                            </div>
                            <Separator />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input
                                            id="name"
                                            value={editableProfile.username}
                                            onChange={(e) => setEditableProfile({ ...editableProfile, username: e.target.value })}
                                            disabled={!isEditingProfile}
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="email">Email Address</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="email"
                                                value={currentUser?.email || ''}
                                                disabled={true}
                                                className="pl-10 mt-1"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="phone"
                                                value={editableProfile.phone}
                                                onChange={(e) => setEditableProfile({ ...editableProfile, phone: e.target.value })}
                                                disabled={!isEditingProfile}
                                                className="pl-10 mt-1"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="location">Location</Label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="location"
                                                value={editableProfile.location}
                                                onChange={(e) => setEditableProfile({ ...editableProfile, location: e.target.value })}
                                                disabled={!isEditingProfile}
                                                className="pl-10 mt-1"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="user-id">User ID</Label>
                                        <div className="flex space-x-2 mt-1">
                                            <Input
                                                id="user-id"
                                                value={userIdDisplay}
                                                disabled
                                                className="flex-1"
                                            />
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleCopyUserId}
                                            >
                                                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            This is your unique identifier for account management
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="family" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="flex items-center space-x-2">
                                    <Users className="h-5 w-5" />
                                    <span>Family Management</span>
                                </CardTitle>
                                <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
                                    <DialogTrigger asChild>
                                        <Button className="flex items-center space-x-2">
                                            <Plus className="h-4 w-4" />
                                            <span>Invite Member</span>
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Invite Family Member</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="invite-email">Email Address</Label>
                                                <Input
                                                    id="invite-email"
                                                    placeholder="member@example.com"
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="invite-role">Role</Label>
                                                <Select>
                                                    <SelectTrigger className="mt-1">
                                                        <SelectValue placeholder="Select role" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="member">Member</SelectItem>
                                                        <SelectItem value="admin">Admin</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="flex space-x-2 pt-4">
                                                <Button className="flex-1">Send Invitation</Button>
                                                <Button variant="outline" onClick={() => setShowInviteModal(false)} className="flex-1">
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="p-4 bg-muted rounded-lg">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-medium">Family ID</p>
                                        <p className="text-sm text-muted-foreground">Share this ID to invite members</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <code className="bg-background px-2 py-1 rounded text-sm">{currentUser?.familyId || 'Not Set'}</code>
                                        {currentUser?.familyId && (
                                            <Button variant="outline" size="sm" onClick={handleCopyFamilyId}>
                                                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h4 className="font-medium">Family Members ({totalFamilyMembers})</h4>
                                <div className="flex items-center justify-between p-4 border rounded-lg bg-accent/50">
                                    <div className="flex items-center space-x-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={currentUser?.profilePicture} alt={userNameDisplay} />
                                            <AvatarFallback>
                                                {userInitials}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <p className="font-medium">{userNameDisplay}</p>
                                                <Badge variant="outline">You</Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{currentUser?.email || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {getRoleIcon(userRole)}
                                        <Badge className="bg-blue-100 text-blue-800">{userRole}</Badge>
                                    </div>
                                </div>
                                {familyMembers && familyMembers.map((member) => (
                                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={member.avatar} alt={member.name} />
                                                <AvatarFallback>
                                                    {(member.name || '').split(' ').map(n => n[0]).join('')}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="flex items-center space-x-2">
                                                    <p className="font-medium">{member.name}</p>
                                                </div>
                                                <p className="text-sm text-muted-foreground">{member.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {getRoleIcon(member.role)}
                                            <Badge className={getStatusColor(member.status)}>
                                                {member.status}
                                            </Badge>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        Edit Permissions
                                                    </DropdownMenuItem>
                                                    {member.role !== 'admin' && (
                                                        <DropdownMenuItem className="text-destructive">
                                                            Remove Member
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="categories" className='space-y-6'>
                    <CategoryManager user={user} />
                </TabsContent>
                <TabsContent value="settings" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Shield className="h-5 w-5" />
                                    <span>Privacy & Security</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">Two-Factor Authentication</p>
                                        <p className="text-sm text-muted-foreground">Add extra security to your account</p>
                                    </div>
                                    <Button variant="outline" size="sm">Enable</Button>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">Change Password</p>
                                        <p className="text-sm text-muted-foreground">Update your account password</p>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={() => setShowPasswordModal(true)}>Change</Button>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">Login Sessions</p>
                                        <p className="text-sm text-muted-foreground">Manage your active sessions</p>
                                    </div>
                                    <Button variant="outline" size="sm">View</Button>
                                </div>
                            </CardContent>
                        </Card>
                        <NotificationPreferences user={user} setUser={setUser} />
                        <Card className="border-destructive">
                            <CardHeader>
                                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {currentUser?.familyId && (
                                    <>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">Leave Family</p>
                                                <p className="text-sm text-muted-foreground">Remove yourself from this family</p>
                                            </div>
                                            <Button variant="destructive" size="sm" onClick={() => setShowLeaveFamilyModal(true)}>Leave</Button>
                                        </div>
                                        <Separator />
                                    </>
                                )}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">Delete Account</p>
                                        <p className="text-sm text-muted-foreground">Permanently delete your account</p>
                                    </div>
                                    <Button variant="destructive" size="sm" onClick={() => setShowDeleteAccountModal(true)}>Delete</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
            {showPasswordModal && <PasswordChangeModal onClose={() => setShowPasswordModal(false)} />}
            {showLeaveFamilyModal && (
                <ConfirmationModal
                    isOpen={showLeaveFamilyModal}
                    onClose={() => setShowLeaveFamilyModal(false)}
                    onConfirm={handleLeaveFamily}
                    title="Leave Family"
                    message="Are you sure you want to leave this family? This action cannot be undone."
                    isProcessing={isLeaveProcessing}
                />
            )}
            {showDeleteAccountModal && (
                <ConfirmationModal
                    isOpen={showDeleteAccountModal}
                    onClose={() => setShowDeleteAccountModal(false)}
                    onConfirm={handleAccountDeletion}
                    title="Delete Account"
                    message="Are you sure you want to permanently delete your account? This action cannot be undone."
                    isProcessing={isDeleteAccProcessing}
                />
            )}
        </div>
    )
}