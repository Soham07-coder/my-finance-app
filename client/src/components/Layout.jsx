import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, DollarSign, Receipt, Users, BarChart3, Menu, X, Home, ChevronRight, LogOut, UserCircle, Settings, TrendingUp } from 'lucide-react';
import { Button } from './ui/button.jsx';
import { Input } from './ui/input.jsx';
import { Badge } from './ui/badge.jsx';
import { Avatar, AvatarFallback } from './ui/avatar.jsx';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu.jsx';
import { cn } from '../lib/utils.js';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { 
    id: 'dashboard', 
    label: 'Dashboard', 
    icon: Home, 
    description: 'Financial overview',
    shortcut: '⌘D'
  },
  { 
    id: 'transactions', 
    label: 'Transactions', 
    icon: Receipt, 
    description: 'All transactions',
    shortcut: '⌘T'
  },
  { 
    id: 'my-family', 
    label: 'My Family', 
    icon: Users, 
    description: 'Family members',
    shortcut: '⌘F'
  },
  { 
    id: 'analytics', 
    label: 'Analytics', 
    icon: BarChart3, 
    description: 'Insights & trends',
    shortcut: '⌘A'
  },
  { 
    id: 'settings', 
    label: 'Settings', 
    icon: Settings, 
    description: 'App preferences',
    shortcut: '⌘S'
  },
];

export function Layout({ 
  children, 
  currentPage, 
  onNavigate, 
  onLogout, 
  sidebarOpen, 
  setSidebarOpen,
  viewMode,
  onViewModeChange
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(null);
  const dropdownRef = useRef(null);
  const alertsRef = useRef(null);
  const [alertsOpen, setAlertsOpen] = useState(false);

  // Fetch current user data
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const config = { headers: { 'Authorization': `Bearer ${token}` } };
          const res = await axios.post('http://localhost:5000/api/auth/verify-token', { idToken: token }, config);
          
          // Log the response from the backend to check for user data
          console.log('Backend response for user:', res.data);
          
          setUser(res.data.user);
        } catch (error) {
          console.error('Failed to fetch user', error);
          onLogout();
        }
      } else {
        onLogout();
      }
    };
    fetchCurrentUser();
  }, []);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const config = { headers: { 'Authorization': `Bearer ${token}` } };
          const res = await axios.get('http://localhost:5000/api/alerts', config);
          setNotifications(res.data);
        } catch (error) {
          console.error('Failed to fetch notifications', error);
        }
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  // Handle clicks outside of dropdowns to close them
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (alertsRef.current && !alertsRef.current.contains(event.target)) {
        setAlertsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadNotifications = notifications.filter(n => n.unread).length;

  const getPageTitle = (pageId) => {
    const page = navItems.find(item => item.id === pageId);
    return page ? page.label : 'Dashboard';
  };

  const handleProfileMenuAction = (action) => {
    if (action === 'account') {
      onNavigate('settings');
    } else if (action === 'logout') {
      onLogout();
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('transactions');
    }
  };

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case 'd':
            e.preventDefault();
            onNavigate('dashboard');
            break;
          case 't':
            e.preventDefault();
            onNavigate('transactions');
            break;
          case 'f':
            e.preventDefault();
            onNavigate('my-family');
            break;
          case 'a':
            e.preventDefault();
            onNavigate('analytics');
            break;
          case 's':
            e.preventDefault();
            onNavigate('settings');
            break;
          case 'n':
            e.preventDefault();
            onNavigate('add-transaction');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNavigate]);
  
  const userInitials = user?.username?.split(' ').map(n => n[0]).join('') || 'S';
  const userFirstName = user?.username?.split(' ')[0] || 'User';

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border",
        "transform transition-transform duration-300 ease-out lg:translate-x-0",
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        "shadow-xl lg:shadow-none custom-scrollbar"
      )}>
        <div className="flex flex-col h-full">
          {/* Brand Header */}
          <div className={cn(
            "flex items-center justify-between h-16 px-6 border-b border-border",
            "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20"
          )}>
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl",
                "flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-200"
              )}>
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 style={{ fontSize: '16px', fontWeight: '600', lineHeight: '1.3' }} className="text-foreground">
                  FamilyFin
                </h1>
                <p style={{ fontSize: '11px', lineHeight: '1.5' }} className="text-muted-foreground">
                  Finance Manager
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="lg:hidden h-8 w-8 p-0"
              onClick={() => setSidebarOpen(false)}
              style={{ fontSize: '12px' }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="px-4 py-4 border-b border-border bg-muted/20">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg">
                <div style={{ fontSize: '16px', fontWeight: '700', lineHeight: '1.3' }} className="text-emerald-600 dark:text-emerald-400">
                  ₹1,25,000
                </div>
                <div style={{ fontSize: '10px', lineHeight: '1.5' }} className="text-emerald-700 dark:text-emerald-500">
                  Balance
                </div>
              </div>
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div style={{ fontSize: '16px', fontWeight: '700', lineHeight: '1.3' }} className="text-blue-600 dark:text-blue-400">
                  ₹32,000
                </div>
                <div style={{ fontSize: '10px', lineHeight: '1.5' }} className="text-blue-700 dark:text-blue-500">
                  This Month
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 group",
                    isActive 
                      ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg transform scale-[1.02]" 
                      : "text-muted-foreground hover:bg-accent hover:text-foreground hover:scale-[1.01]"
                  )}
                  style={{ fontSize: '12px', lineHeight: '1.5' }}
                >
                  <div className={cn(
                    "p-2 rounded-lg transition-all duration-200",
                    isActive 
                      ? "bg-white/20 text-white shadow-md" 
                      : "bg-muted/50 text-muted-foreground group-hover:bg-accent group-hover:text-foreground"
                  )}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 text-left">
                    <div style={{ fontSize: '12px', fontWeight: '500', lineHeight: '1.3' }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: '10px', lineHeight: '1.5' }} className={cn(
                      "opacity-70",
                      isActive ? "text-white/80" : "text-muted-foreground"
                    )}>
                      {item.description}
                    </div>
                  </div>
                  <div style={{ fontSize: '10px', lineHeight: '1.5' }} className={cn(
                    "opacity-50 font-mono",
                    isActive ? "text-white/60" : "text-muted-foreground"
                  )}>
                    {item.shortcut}
                  </div>
              </button>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className={cn(
            "p-4 border-t border-border bg-gradient-to-r from-gray-50 to-gray-100",
            "dark:from-gray-900/20 dark:to-gray-800/20"
          )}>
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 ring-2 ring-border shadow-md">
                <AvatarFallback 
                  className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-medium"
                  style={{ fontSize: '12px' }}
                >
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p style={{ fontSize: '12px', fontWeight: '500', lineHeight: '1.3' }} className="text-foreground truncate">
                  {user?.username || 'Priya Sharma'}
                </p>
                <div className="flex items-center gap-2">
                  <p style={{ fontSize: '10px', lineHeight: '1.5' }} className="text-muted-foreground truncate">
                    {user?.role || 'Family Admin'}
                  </p>
                  <Badge variant="outline" style={{ fontSize: '9px' }} className="px-1.5 py-0">
                    Pro
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Header */}
        <header className={cn(
          "sticky top-0 z-40 w-full border-b border-border",
          "bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl shadow-sm",
          "supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-950/60"
        )}>
          <div className="flex h-16 items-center justify-between px-4 lg:px-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden h-9 w-9 p-0"
                onClick={() => setSidebarOpen(true)}
                style={{ fontSize: '12px' }}
              >
                <Menu className="w-5 h-5" />
              </Button>
              
              {/* Page Title */}
              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2" style={{ fontSize: '12px' }}>
                  <span className="text-muted-foreground">Dashboard</span>
                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                  <span className="font-medium text-foreground">{getPageTitle(currentPage)}</span>
                </div>
                
                <div className="md:hidden">
                  <h1 style={{ fontSize: '16px', fontWeight: '600', lineHeight: '1.3' }} className="text-foreground">
                    {getPageTitle(currentPage)}
                  </h1>
                </div>
              </div>
              
              {/* Search */}
              <form onSubmit={handleSearch} className="relative w-80 hidden lg:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search transactions, members..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    "pl-9 h-9 bg-muted/50 border-border/50",
                    "focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-ring"
                  )}
                  style={{ fontSize: '12px' }}
                />
              </form>
            </div>

            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className={cn(
                "hidden sm:flex items-center bg-muted/50 rounded-lg p-1 border border-border/50"
              )}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onViewModeChange('personal')}
                  className={cn(
                    "h-7 px-3 transition-all duration-200",
                    viewMode === 'personal' 
                      ? "bg-background shadow-sm border border-border text-foreground" 
                      : "text-muted-foreground hover:text-foreground"
                  )} 
                  style={{ fontSize: '11px', fontWeight: '500' }}
                >
                  Personal
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onViewModeChange('family')}
                  className={cn(
                    "h-7 px-3 transition-all duration-200",
                    viewMode === 'family' 
                      ? "bg-background shadow-sm border border-border text-foreground" 
                      : "text-muted-foreground hover:text-foreground"
                  )} 
                  style={{ fontSize: '11px', fontWeight: '500' }}
                >
                  Family
                </Button>
              </div>

              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative h-9 w-9 p-0">
                    <Bell className="w-4 h-4" />
                    {unreadNotifications > 0 && (
                      <div className={cn(
                        "absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full",
                        "flex items-center justify-center ring-2 ring-background"
                      )} style={{ fontSize: '10px', fontWeight: '500' }}>
                        {unreadNotifications}
                      </div>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="p-3 border-b">
                    <h4 style={{ fontSize: '12px', fontWeight: '600' }}>Notifications</h4>
                    <p style={{ fontSize: '11px' }} className="text-muted-foreground">
                      {unreadNotifications} unread notifications
                    </p>
                  </div>
                  {notifications.map((notification) => (
                    <DropdownMenuItem key={notification.id} className="p-3 cursor-pointer">
                      <div className="flex items-start gap-3 w-full">
                        <div className={cn(
                          "w-2 h-2 rounded-full mt-2 shrink-0",
                          notification.unread ? "bg-blue-500" : "bg-muted"
                        )} />
                        <div className="flex-1">
                          <p style={{ fontSize: '12px', fontWeight: '500' }} className="text-foreground">
                            {notification.message}
                          </p>
                          <p style={{ fontSize: '11px' }} className="text-muted-foreground">
                            2 minutes ago
                          </p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Profile */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2 h-9 px-2">
                    <Avatar className="w-7 h-7">
                      <AvatarFallback 
                        className="bg-gradient-to-br from-purple-500 to-pink-500 text-white"
                        style={{ fontSize: '10px' }}
                      >
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:block" style={{ fontSize: '12px', fontWeight: '500' }}>
                      {userFirstName}
                    </span>
                    <ChevronRight className="w-3 h-3 rotate-90 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback 
                          className="bg-gradient-to-br from-purple-500 to-pink-500 text-white"
                          style={{ fontSize: '10px' }}
                        >
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p style={{ fontSize: '12px', fontWeight: '500', lineHeight: '1.3' }}>
                          {user?.username || 'Priya Sharma'}
                        </p>
                        <p style={{ fontSize: '11px', lineHeight: '1.5' }} className="text-muted-foreground">
                          {user?.email || 'priya.sharma@example.com'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => handleProfileMenuAction('account')}
                    className="cursor-pointer"
                    style={{ fontSize: '12px' }}
                  >
                    <UserCircle className="w-4 h-4 mr-2" />
                    Account Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onNavigate('analytics')}
                    className="cursor-pointer"
                    style={{ fontSize: '12px' }}
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View Analytics
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => handleProfileMenuAction('logout')}
                    className="cursor-pointer text-destructive focus:text-destructive"
                    style={{ fontSize: '12px' }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className={cn(
            "fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden",
            "transition-opacity duration-300 animate-fade-in"
          )}
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}