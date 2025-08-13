// src/pages/MyFamilyPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Users,
  UserPlus,
  Crown,
  Mail,
  Phone,
  Shield,
  MoreVertical,
  Eye,
  Copy,
  Check,
  Download,
  Settings,
  Home,
  LogIn,
  AlertCircle
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card.jsx';
import { Button } from './ui/button.jsx';
import { Avatar, AvatarFallback } from './ui/avatar.jsx';
import { Badge } from './ui/badge.jsx';
import { Input } from './ui/input.jsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu.jsx';
import { formatCurrency, cn } from '../lib/utils.js';

export function MyFamilyPage() {
  const [familyMembers, setFamilyMembers] = useState([]);
  const [invitationHistory, setInvitationHistory] = useState([]);
  const [familyId, setFamilyId] = useState('');
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [familyIdCopied, setFamilyIdCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [newSpendingLimit, setNewSpendingLimit] = useState('');
  const [showSpendingLimitInput, setShowSpendingLimitInput] = useState(false);

  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');
  const [exportScope, setExportScope] = useState('family');

  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [viewedMember, setViewedMember] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState('member');
  
  // New state for joining or creating a family
  const [newFamilyName, setNewFamilyName] = useState('');
  const [joinFamilyId, setJoinFamilyId] = useState('');
  const [actionError, setActionError] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);


  const isCurrentUserAdmin = () => currentUserRole === 'admin';

  const fetchFamilyData = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const res = await axios.get('http://localhost:5000/api/families/my-family', config);
      const familyData = res.data;

      if (familyData) {
        setFamilyMembers(familyData.members || []);
        setFamilyId(familyData.id || '');
        setInvitationHistory(familyData.invitations || []);

        const currentUserId = JSON.parse(atob(token.split('.')[1])).uid;
        const userMember = familyData.members.find(m => m.id === currentUserId);
        if (userMember) {
          setCurrentUserRole(userMember.role);
        }
      } else {
        setFamilyMembers([]);
        setInvitationHistory([]);
        setFamilyId('');
        setCurrentUserRole('member');
      }
    } catch (e) {
      console.error('Failed to fetch family data', e);
      setFamilyMembers([]);
      setInvitationHistory([]);
      setFamilyId('');
      setCurrentUserRole('member');
    } finally {
      setIsLoading(false);
    }
  }, []);


  useEffect(() => {
    fetchFamilyData();
  }, [fetchFamilyData]);

  const handleCreateFamily = async (e) => {
    e.preventDefault();
    if (!newFamilyName.trim()) {
      setActionError('Please enter a family name.');
      return;
    }
    setIsActionLoading(true);
    setActionError('');
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post('http://localhost:5000/api/families/create', { name: newFamilyName }, config);
      await fetchFamilyData(); // Re-fetch data to show the new family view
    } catch (err) {
      setActionError(err.response?.data?.msg || 'Failed to create family.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleJoinFamily = async (e) => {
    e.preventDefault();
    if (!joinFamilyId.trim()) {
      setActionError('Please enter a family ID to join.');
      return;
    }
    setIsActionLoading(true);
    setActionError('');
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post('http://localhost:5000/api/families/join', { familyId: joinFamilyId }, config);
      await fetchFamilyData(); // Re-fetch data to show the joined family view
    } catch (err) {
      setActionError(err.response?.data?.msg || 'Failed to join family. Check the ID and try again.');
    } finally {
      setIsActionLoading(false);
    }
  };


  const totalMembers = familyMembers.length;
  const totalSpending = familyMembers.reduce(
    (sum, member) => sum + (member.monthlySpending || 0),
    0
  );
  const activeMembers = familyMembers.filter((m) => m.status === 'active').length;

  const handleInviteMember = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setInviteLoading(true);
    setInviteError('');
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(
        'http://localhost:5000/api/families/invite',
        { email: inviteEmail.trim() },
        config
      );
      setInviteEmail('');
      setShowInviteForm(false);
      const res = await axios.get('http://localhost:5000/api/families/my-family', config);
      const familyData = res.data;
      if (familyData) {
        setInvitationHistory(familyData.invitations || []);
      }
    } catch (err) {
      setInviteError(err.response?.data?.msg || 'Failed to send invitation.');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleUpdateSpendingLimit = async () => {
    if (!newSpendingLimit || isNaN(newSpendingLimit) || Number(newSpendingLimit) <= 0) {
      alert('Please enter a valid spending limit.');
      return;
    }
    setIsButtonLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.put(
        'http://localhost:5000/api/families/settings/spending-limit',
        { newLimit: Number(newSpendingLimit) },
        config
      );
      alert(res.data.msg);
      setShowSpendingLimitInput(false);
      setNewSpendingLimit('');
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to update spending limit.');
    } finally {
      setIsButtonLoading(false);
    }
  };

  const handleConfigureClick = () => {
    setShowSpendingLimitInput(!showSpendingLimitInput);
  };

  const handleManageClick = () => {
    setIsButtonLoading(true);
    setTimeout(() => {
      alert('Manage Expense Notifications feature coming soon!');
      setIsButtonLoading(false);
    }, 1000);
  };

  const handleExportClick = async () => {
    setIsButtonLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      let url;
      let fileName;
      let contentType;
      let isBinary = false;
  
      if (exportFormat === 'csv') {
        url = 'http://localhost:5000/api/transactions/export-csv';
        fileName = `${exportScope}_transactions.csv`;
        contentType = 'text/csv;charset=utf-8;';
      } else if (exportFormat === 'pdf') {
        url = 'http://localhost:5000/api/transactions/export-pdf';
        fileName = `${exportScope}_transactions.pdf`;
        contentType = 'application/pdf';
        isBinary = true;
      }
      
      const payload = { scope: exportScope };
      const axiosConfig = isBinary ? { ...config, responseType: 'blob' } : config;
      
      const res = await axios.post(url, payload, axiosConfig);
      
      if (res.data.msg && !isBinary) {
        alert(res.data.msg);
      }
      
      if (res.data && res.status === 200) {
        const blob = new Blob([res.data], { type: contentType });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      } else if (res.status === 404) {
        alert(res.data.msg);
      }
      
      setShowExportModal(false);

    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to export data.');
    } finally {
      setIsButtonLoading(false);
    }
  };

  const copyFamilyId = () => {
    if (familyId) {
      navigator.clipboard.writeText(familyId);
      setFamilyIdCopied(true);
      setTimeout(() => setFamilyIdCopied(false), 2000);
    }
  };

  const handleViewDetailsClick = async (member) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(`http://localhost:5000/api/families/members/${member.id}/details`, config);
      setViewedMember(res.data);
      setShowDetailsModal(true);
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to fetch member details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditPermissionsClick = (member) => {
    setSelectedMember(member);
    setSelectedRole(member.role);
    setShowPermissionsModal(true);
  };

  const handleUpdatePermission = async () => {
    if (!selectedMember || !selectedRole) return;
    setIsButtonLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.put(
        `http://localhost:5000/api/families/members/${selectedMember.id}/permissions`,
        { newRole: selectedRole },
        config
      );
      alert(res.data.msg);
      setShowPermissionsModal(false);
      const updatedRes = await axios.get('http://localhost:5000/api/families/my-family', config);
      setFamilyMembers(updatedRes.data.members || []);
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to update member role.');
    } finally {
      setIsButtonLoading(false);
    }
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-lg">
        Loading family details...
      </div>
    );
  }

  // Render this view if the user is NOT in a family
  if (!familyId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 text-center animate-fade-in space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Welcome!</h1>
          <p className="text-muted-foreground">You are not part of a family yet. Create one or join with an invite code.</p>
        </div>
        
        {actionError && (
          <div className="bg-destructive/10 text-destructive border border-destructive/30 p-3 rounded-lg flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4" /> {actionError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-4xl">
          {/* Create Family Card */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Home className="w-5 h-5 text-primary" /> Create a New Family</CardTitle>
              <CardDescription>Start a new financial group and invite your family members.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateFamily} className="space-y-4">
                <Input
                  type="text"
                  placeholder="Enter your family's name"
                  value={newFamilyName}
                  onChange={(e) => setNewFamilyName(e.target.value)}
                  disabled={isActionLoading}
                  required
                />
                <Button type="submit" className="w-full" disabled={isActionLoading}>
                  {isActionLoading ? 'Creating...' : 'Create Family'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Join Family Card */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><LogIn className="w-5 h-5 text-primary" /> Join an Existing Family</CardTitle>
              <CardDescription>Enter the invite code you received from a family member.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJoinFamily} className="space-y-4">
                <Input
                  type="text"
                  placeholder="Enter Family ID (Invite Code)"
                  value={joinFamilyId}
                  onChange={(e) => setJoinFamilyId(e.target.value)}
                  disabled={isActionLoading}
                  required
                />
                <Button type="submit" variant="secondary" className="w-full" disabled={isActionLoading}>
                  {isActionLoading ? 'Joining...' : 'Join Family'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Render this view if the user IS in a family
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <h1
            style={{ fontSize: '28px', fontWeight: '700', lineHeight: '1.2' }}
            className="text-foreground"
          >
            My Family
          </h1>
          <p style={{ fontSize: '14px', lineHeight: '1.5' }} className="text-muted-foreground">
            Manage your family members and their financial access
          </p>
        </div>
        <Button
          onClick={() => setShowInviteForm(!showInviteForm)}
          className={cn(
            'gap-2 h-11 px-6 bg-gradient-to-r from-emerald-500 to-green-500',
            'hover:from-emerald-600 hover:to-green-600 text-white shadow-lg hover:shadow-xl',
            'transform hover:scale-105 transition-all duration-200'
          )}
          style={{ fontSize: '12px', fontWeight: '500' }}
        >
          <UserPlus className="w-4 h-4" />
          Invite Member
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p style={{ fontSize: '12px', fontWeight: '500' }} className="text-blue-700 dark:text-blue-300">
                  Total Members
                </p>
                <p style={{ fontSize: '24px', fontWeight: '800', lineHeight: '1.2' }} className="text-blue-900 dark:text-blue-100">
                  {totalMembers}
                </p>
                <p style={{ fontSize: '11px' }} className="text-blue-600 dark:text-blue-400">
                  {activeMembers} active
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-blue-200/20 dark:bg-blue-800/20 rounded-full"></div>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p style={{ fontSize: '12px', fontWeight: '500' }} className="text-purple-700 dark:text-purple-300">
                  Family ID (Invite Code)
                </p>
                <p
                  style={{ fontSize: '16px', fontWeight: '700', fontFamily: 'monospace' }}
                  className="text-purple-900 dark:text-purple-100"
                >
                  {familyId}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyFamilyId}
                  className="h-6 px-2 text-purple-600 hover:text-purple-700 hover:bg-purple-100"
                  style={{ fontSize: '10px' }}
                >
                  {familyIdCopied ? (
                    <>
                      <Check className="w-3 h-3 mr-1" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-purple-200/20 dark:bg-purple-800/20 rounded-full"></div>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p style={{ fontSize: '12px', fontWeight: '500' }} className="text-emerald-700 dark:text-emerald-300">
                  Total Spending
                </p>
                <p style={{ fontSize: '24px', fontWeight: '800', lineHeight: '1.2' }} className="text-emerald-900 dark:text-emerald-100">
                  {formatCurrency(totalSpending)}
                </p>
                <p style={{ fontSize: '11px' }} className="text-emerald-600 dark:text-emerald-400">
                  This month
                </p>
              </div>
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                <Crown className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-emerald-200/20 dark:bg-emerald-800/20 rounded-full"></div>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p style={{ fontSize: '12px', fontWeight: '500' }} className="text-orange-700 dark:text-orange-300">
                  Avg per Member
                </p>
                <p style={{ fontSize: '24px', fontWeight: '800', lineHeight: '1.2' }} className="text-orange-900 dark:text-orange-100">
                  {totalMembers > 0 ? formatCurrency(Math.round(totalSpending / totalMembers)) : '—'}
                </p>
                <p style={{ fontSize: '11px' }} className="text-orange-600 dark:text-orange-400">
                  Monthly average
                </p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-orange-200/20 dark:bg-orange-800/20 rounded-full"></div>
        </Card>
      </div>

      {showInviteForm && (
        <Card className="shadow-lg border-2 border-emerald-200 dark:border-emerald-800 animate-slide-up">
          <CardHeader className="pb-4 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20">
            <CardTitle style={{ fontSize: '16px', fontWeight: '600' }}>Invite Family Member</CardTitle>
            <CardDescription style={{ fontSize: '12px' }}>
              Send an invitation to join your family's financial management
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleInviteMember} className="space-y-4">
              <div className="space-y-2">
                <label style={{ fontSize: '12px', fontWeight: '500' }} className="text-foreground">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  style={{ fontSize: '12px' }}
                />
              </div>
              <div className="flex gap-3 items-center">
                <Button
                  type="submit"
                  className="gap-2 bg-emerald-500 hover:bg-emerald-600"
                  style={{ fontSize: '12px' }}
                  disabled={inviteLoading}
                >
                  <Mail className="w-4 h-4" />
                  {inviteLoading ? 'Sending...' : 'Send Invitation'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowInviteForm(false)}
                  style={{ fontSize: '12px' }}
                >
                  Cancel
                </Button>
                {inviteError && (
                  <span className="text-destructive text-xs">{inviteError}</span>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Family Members */}
        <Card className="lg:col-span-2 shadow-sm hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle style={{ fontSize: '18px', fontWeight: '600' }}>Family Members</CardTitle>
            <CardDescription style={{ fontSize: '12px' }}>
              Manage roles and permissions for your family members
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {familyMembers.length > 0 ? (
                familyMembers.map((member, index) => (
                  <div
                    key={member.id}
                    className={cn(
                      'flex items-center justify-between p-4 rounded-xl border border-border/50',
                      'hover:bg-accent/20 transition-all duration-200'
                    )}
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animation: 'fadeIn 0.5s ease-out forwards',
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar
                          className={cn('w-12 h-12 shadow-md bg-gradient-to-br', member.color)}
                        >
                          <AvatarFallback
                            className="text-white font-medium bg-transparent"
                            style={{ fontSize: '12px' }}
                          >
                            {member.avatar || (member.name ? member.name[0] : 'M')}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={cn(
                            'absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background',
                            member.status === 'active'
                              ? 'bg-emerald-500'
                              : member.status === 'away'
                              ? 'bg-yellow-500'
                              : 'bg-gray-400'
                          )}
                        ></div>
                        {member.role === 'admin' && (
                          <div className="absolute -top-1 -left-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                            <Crown className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div>
                          <h4
                            style={{ fontSize: '14px', fontWeight: '600', lineHeight: '1.3' }}
                            className="text-foreground"
                          >
                            {member.username}
                          </h4>
                          <div className="flex items-center gap-1 mt-1">
                            <Mail className="w-3 h-3 text-muted-foreground" />
                            <span style={{ fontSize: '11px' }} className="text-muted-foreground">
                              {member.email}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <Phone className="w-3 h-3 text-muted-foreground" />
                            <span style={{ fontSize: '11px' }} className="text-muted-foreground">
                              {member.phone}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant={member.role === 'admin' ? 'default' : 'outline'}
                            style={{ fontSize: '10px' }}
                            className="px-2 py-0"
                          >
                            {member.role === 'admin' ? 'Admin' : 'Member'}
                          </Badge>
                          <Badge
                            variant="outline"
                            style={{ fontSize: '10px' }}
                            className={cn(
                              'px-2 py-0',
                              member.status === 'active'
                                ? 'text-emerald-600 border-emerald-200'
                                : member.status === 'away'
                                ? 'text-yellow-600 border-yellow-200'
                                : 'text-gray-600 border-gray-200'
                            )}
                          >
                            {member.status}
                          </Badge>
                          <span style={{ fontSize: '10px' }} className="text-muted-foreground">
                            Last seen {member.lastSeen}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right space-y-1">
                        <p style={{ fontSize: '14px', fontWeight: '600' }} className="text-foreground">
                          {member.monthlySpending ? formatCurrency(member.monthlySpending) : '—'}
                        </p>
                        <p style={{ fontSize: '10px' }} className="text-muted-foreground">
                          This month
                        </p>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetailsClick(member)} style={{ fontSize: '12px' }}>
                            <Eye className="w-4 h-4 mr-2" /> View Details
                          </DropdownMenuItem>
                          {isCurrentUserAdmin() && member.role !== 'admin' && (
                            <DropdownMenuItem onClick={() => handleEditPermissionsClick(member)} style={{ fontSize: '12px' }}>
                              <Settings className="w-4 h-4 mr-2" /> Edit Permissions
                            </DropdownMenuItem>
                          )}
                          {isCurrentUserAdmin() && member.role !== 'admin' && (
                            <DropdownMenuItem className="text-destructive" style={{ fontSize: '12px' }}>
                              Remove Member
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <p style={{ fontSize: '14px' }} className="text-muted-foreground">
                    No family members found.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Invitation History & Family Settings */}
        <div className="space-y-6">
          {/* Pending Invitations */}
          <Card className="shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle style={{ fontSize: '16px', fontWeight: '600' }}>Pending Invitations</CardTitle>
              <CardDescription style={{ fontSize: '12px' }}>
                Track sent invitations and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {invitationHistory.length === 0 ? (
                <div className="text-center py-6">
                  <Mail className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p style={{ fontSize: '12px' }} className="text-muted-foreground">
                    No pending invitations
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {invitationHistory.map((invitation, index) => (
                    <div
                      key={invitation.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border/50"
                      style={{
                        animationDelay: `${index * 100}ms`,
                        animation: 'slideUp 0.5s ease-out forwards',
                      }}
                    >
                      <div>
                        <p style={{ fontSize: '12px', fontWeight: '500' }} className="text-foreground">
                          {invitation.email}
                        </p>
                        <p style={{ fontSize: '10px' }} className="text-muted-foreground">
                          Sent {invitation.sentAt ? new Date(invitation.sentAt).toLocaleDateString() : '—'}
                        </p>
                      </div>
                      <Badge
                        variant={invitation.status === 'pending' ? 'outline' : 'destructive'}
                        style={{ fontSize: '10px' }}
                      >
                        {invitation.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Family Settings */}
          <Card className="shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle style={{ fontSize: '16px', fontWeight: '600' }}>Family Settings</CardTitle>
              <CardDescription style={{ fontSize: '12px' }}>
                Configure family-wide preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: '500' }} className="text-foreground">
                      Monthly Spending Limit
                    </p>
                    <p style={{ fontSize: '10px' }} className="text-muted-foreground">
                      Set a family spending limit
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleConfigureClick} disabled={isButtonLoading}>
                    {showSpendingLimitInput ? 'Cancel' : 'Configure'}
                  </Button>
                </div>
                {showSpendingLimitInput && (
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Enter new limit"
                      value={newSpendingLimit}
                      onChange={(e) => setNewSpendingLimit(e.target.value)}
                      className="w-full"
                    />
                    <Button onClick={handleUpdateSpendingLimit} disabled={isButtonLoading}>
                      Set
                    </Button>
                  </div>
                )}

                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: '500' }} className="text-foreground">
                      Expense Notifications
                    </p>
                    <p style={{ fontSize: '10px' }} className="text-muted-foreground">
                      Get notified of family expenses
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleManageClick} disabled={isButtonLoading}>
                    Manage
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: '500' }} className="text-foreground">
                      Data Export
                    </p>
                    <p style={{ fontSize: '10px' }} className="text-muted-foreground">
                      Download family financial data
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setShowExportModal(true)} disabled={isButtonLoading}>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {showPermissionsModal && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>Edit Permissions</CardTitle>
              <CardDescription>
                Change the role for {selectedMember.username}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="role-select" className="text-sm font-medium">
                    Select Role
                  </label>
                  <select
                    id="role-select"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="p-2 border rounded-md"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowPermissionsModal(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdatePermission} disabled={isButtonLoading}>
                    Save
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showDetailsModal && viewedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>{viewedMember.username}'s Details</CardTitle>
              <CardDescription>
                Overview of this family member's financial activity.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{viewedMember.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Monthly Spending</p>
                  <p className="text-sm text-muted-foreground">{formatCurrency(viewedMember.monthlySpending)}</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Spending Breakdown</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {viewedMember.spendingBreakdown.map((item, index) => (
                    <li key={index}>
                      {item.category}: {formatCurrency(item.amount)}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Recent Transactions</p>
                <ul className="divide-y divide-border">
                  {viewedMember.transactionHistory.map((item) => (
                    <li key={item.id} className="flex justify-between py-2">
                      <span className="text-sm">{item.description} ({item.date})</span>
                      <span className="text-sm font-medium text-destructive">{formatCurrency(item.amount)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setShowDetailsModal(false)}>Close</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>Export Data</CardTitle>
              <CardDescription>
                Select the format and scope to download your financial data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="export-format-select" className="text-sm font-medium">
                    Choose Format
                  </label>
                  <select
                    id="export-format-select"
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value)}
                    className="p-2 border rounded-md"
                  >
                    <option value="csv">CSV</option>
                    <option value="pdf">PDF</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="export-scope-select" className="text-sm font-medium">
                    Choose Scope
                  </label>
                  <select
                    id="export-scope-select"
                    value={exportScope}
                    onChange={(e) => setExportScope(e.target.value)}
                    className="p-2 border rounded-md"
                  >
                    <option value="family">Family Transactions</option>
                    <option value="personal">Personal Transactions</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowExportModal(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleExportClick} disabled={isButtonLoading}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}