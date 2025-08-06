// src/pages/MyFamilyPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Users,
  UserPlus,
  Crown,
  Mail,
  Phone,
  Shield,
  MoreVertical,
  Copy,
  Check,
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

export function MyFamilyPage({ user }) {
  const [familyMembers, setFamilyMembers] = useState([]);
  const [invitationHistory, setInvitationHistory] = useState([]);
  const [familyId, setFamilyId] = useState('');
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [familyIdCopied, setFamilyIdCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState('');

  // Fetch family data and invitations from backend
  useEffect(() => {
    const fetchFamilyData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get('http://localhost:5000/api/families/my-family', config);
        setFamilyMembers(res.data.members || []);
        setInvitationHistory(res.data.invitations || []);
        setFamilyId(res.data.id || '');
      } catch (e) {
        setFamilyMembers([]);
        setInvitationHistory([]);
        setFamilyId('');
        // Optionally, handle fetch error
      } finally {
        setIsLoading(false);
      }
    };

    fetchFamilyData();
  }, []);

  const totalMembers = familyMembers.length;
  const totalSpending = familyMembers.reduce(
    (sum, member) => sum + (member.monthlySpending || 0),
    0
  );
  const activeMembers = familyMembers.filter((m) => m.status === 'active').length;

  // Handle inviting member by email, calls backend
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

      // Refresh invitations
      const res = await axios.get('http://localhost:5000/api/families/my-family', config);
      setInvitationHistory(res.data.invitations || []);
    } catch (err) {
      setInviteError(err.response?.data?.msg || 'Failed to send invitation.');
    } finally {
      setInviteLoading(false);
    }
  };

  // Copy Family ID to clipboard with feedback
  const copyFamilyId = () => {
    if (familyId) {
      navigator.clipboard.writeText(familyId);
      setFamilyIdCopied(true);
      setTimeout(() => setFamilyIdCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-lg">
        Loading family details...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
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

      {/* Family Stats */}
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
                  Family ID
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

      {/* Invite Form */}
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
              {familyMembers.map((member, index) => (
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
                          {member.name}
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
                        <DropdownMenuItem style={{ fontSize: '12px' }}>View Details</DropdownMenuItem>
                        <DropdownMenuItem style={{ fontSize: '12px' }}>Edit Permissions</DropdownMenuItem>
                        {member.role !== 'admin' && (
                          <DropdownMenuItem className="text-destructive" style={{ fontSize: '12px' }}>
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
                  <Button variant="outline" size="sm" style={{ fontSize: '10px' }} disabled>
                    Configure
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: '500' }} className="text-foreground">
                      Expense Notifications
                    </p>
                    <p style={{ fontSize: '10px' }} className="text-muted-foreground">
                      Get notified of family expenses
                    </p>
                  </div>
                  <Button variant="outline" size="sm" style={{ fontSize: '10px' }} disabled>
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
                  <Button variant="outline" size="sm" style={{ fontSize: '10px' }} disabled>
                    Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
