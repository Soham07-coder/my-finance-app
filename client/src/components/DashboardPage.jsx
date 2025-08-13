import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Plus, TrendingUp, TrendingDown, Wallet, Users, Eye, EyeOff, Target, Clock, MapPin, Info
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.jsx';
import { Button } from './ui/button.jsx';
import { Avatar, AvatarFallback } from './ui/avatar.jsx';
import { Badge } from './ui/badge.jsx';
import { formatCurrency, formatDateShort, cn } from '../lib/utils.js';

// A simple, self-hiding alert component
const ViewModeAlert = ({ message }) => {
  if (!message) return null;
  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-background text-foreground border shadow-lg rounded-full px-6 py-3 flex items-center gap-2 animate-fade-in-down">
      <Info className="w-5 h-5 text-blue-500" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
};


export function DashboardPage({ onNavigate, viewMode, user, familyMembers }) {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [balanceVisible, setBalanceVisible] = useState(false); // Hide balance by default
  const [timeOfDay, setTimeOfDay] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  // Fetch transactions based on viewMode
  useEffect(() => {
    setIsLoading(true);
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const route = viewMode === 'family'
          ? '/api/transactions/family'
          : '/api/transactions/personal';
        const res = await axios.get(`http://localhost:5000${route}`, config);
        setTransactions(res.data || []);
      } catch (err) {
        setTransactions([]);
        // Optionally display an error state
      } finally {
        setIsLoading(false);
      }
    };
    fetchTransactions();
  }, [viewMode]);

  // Effect for showing view mode switch alert
  useEffect(() => {
    if (viewMode) {
      setAlertMessage(`Switched to ${viewMode} view`);
      const timer = setTimeout(() => {
        setAlertMessage('');
      }, 2500); // Alert disappears after 2.5 seconds
      return () => clearTimeout(timer);
    }
  }, [viewMode]);


  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay('Morning');
    else if (hour < 17) setTimeOfDay('Afternoon');
    else setTimeOfDay('Evening');
  }, []);

  // Calculate stats from transactions
  const income = transactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + (typeof tx.amount === 'number' ? tx.amount : 0), 0);
  const expenses = transactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + (typeof tx.amount === 'number' ? Math.abs(tx.amount) : 0), 0);
  const totalBalance = income - expenses;
  const savingsGoal = 0; // You can fetch/set this from user profile/family
  const currentSavings = totalBalance > 0 ? totalBalance : 0;
  const savingsPercentage = savingsGoal > 0 ? currentSavings / savingsGoal * 100 : 0;
  const netBalance = income - expenses;
  const currentTransactions = transactions.slice(0, 5); // latest 5

  // Compute budget overview (group by category)
  const budgetOverview = {};
  transactions.filter(tx => tx.type === 'expense').forEach(tx => {
    const cat = tx.category || 'Other';
    budgetOverview[cat] = (budgetOverview[cat] || 0) + Math.abs(tx.amount);
  });

  const userName = user?.username ? user.username.split(' ')[0] : 'User';

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[40vh] text-lg">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <ViewModeAlert message={alertMessage} />
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="text-3xl">
              {timeOfDay === 'Morning' ? '☀️' : timeOfDay === 'Afternoon' ? '🌤️' : '🌙'}
            </div>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: '700', lineHeight: '1.2' }} className="text-foreground">
                Good {timeOfDay}, {userName}!
              </h1>
              <p style={{ fontSize: '14px', lineHeight: '1.5' }} className="text-muted-foreground">
                Here's your {viewMode} financial overview for today
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => onNavigate('analytics')}
            className="gap-2 h-11 px-4 hover:bg-accent/80"
            style={{ fontSize: '12px', fontWeight: '500' }}
          >
            <TrendingUp className="w-4 h-4" />
            View Analytics
          </Button>
          <Button
            onClick={() => onNavigate('add-transaction')}
            className={cn(
              "gap-2 h-11 px-6 bg-gradient-to-r from-blue-600 to-indigo-600",
              "hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl",
              "transform hover:scale-105 transition-all duration-200"
            )}
            style={{ fontSize: '12px', fontWeight: '500' }}
          >
            <Plus className="w-4 h-4" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Balance */}
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle style={{ fontSize: '12px', fontWeight: '500' }} className="text-blue-700 dark:text-blue-300">
              Total Balance
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setBalanceVisible(!balanceVisible)}
                className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-100 transition-colors"
              >
                {balanceVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              </Button>
              <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Wallet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div style={{ fontSize: '24px', fontWeight: '800', lineHeight: '1.2' }} className="text-blue-900 dark:text-blue-100">
              {balanceVisible ? formatCurrency(totalBalance) : '••••••'}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="w-3 h-3" />
                {/* Placeholder: put real % difference if desired */}
                <span style={{ fontSize: '11px', fontWeight: '500' }}>+2.1%</span>
              </div>
              <span style={{ fontSize: '11px' }} className="text-muted-foreground">from last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Income */}
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle style={{ fontSize: '12px', fontWeight: '500' }} className="text-emerald-700 dark:text-emerald-300">
              Monthly Income
            </CardTitle>
            <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
              <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div style={{ fontSize: '24px', fontWeight: '800', lineHeight: '1.2' }} className="text-emerald-900 dark:text-emerald-100">
               {balanceVisible ? formatCurrency(income) : '••••••'}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="w-3 h-3" />
                <span style={{ fontSize: '11px', fontWeight: '500' }}>+5.4%</span>
              </div>
              <span style={{ fontSize: '11px' }} className="text-muted-foreground">from last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Expenses */}
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle style={{ fontSize: '12px', fontWeight: '500' }} className="text-red-700 dark:text-red-300">
              Monthly Expenses
            </CardTitle>
            <div className="p-2.5 bg-red-100 dark:bg-red-900/30 rounded-xl">
              <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div style={{ fontSize: '24px', fontWeight: '800', lineHeight: '1.2' }} className="text-red-900 dark:text-red-100">
              {balanceVisible ? formatCurrency(expenses) : '••••••'}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <TrendingDown className="w-3 h-3 rotate-180" />
                <span style={{ fontSize: '11px', fontWeight: '500' }}>-3.2%</span>
              </div>
              <span style={{ fontSize: '11px' }} className="text-muted-foreground">from last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Savings Progress */}
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle style={{ fontSize: '12px', fontWeight: '500' }} className="text-purple-700 dark:text-purple-300">
              Savings Goal
            </CardTitle>
            <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div style={{ fontSize: '24px', fontWeight: '800', lineHeight: '1.2' }} className="text-purple-900 dark:text-purple-100">
              {savingsGoal > 0 ? Math.round(savingsPercentage) : 0}%
            </div>
            <div className="space-y-2">
              <div className="w-full bg-purple-200/50 dark:bg-purple-800/30 rounded-full h-2.5">
                <div
                  className="bg-gradient-to-r from-purple-500 to-violet-500 h-2.5 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min(savingsPercentage, 100)}%` }}
                ></div>
              </div>
              <p style={{ fontSize: '11px' }} className="text-purple-600 dark:text-purple-400">
                {balanceVisible ? `${formatCurrency(currentSavings)} of ${formatCurrency(savingsGoal)}` : '••••••'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Net Balance Indicator */}
      <Card className={cn(
        "border-0 overflow-hidden",
        netBalance >= 0
          ? "bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20"
          : "bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20"
      )}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={cn(
                "p-3 rounded-xl",
                netBalance >= 0
                  ? "bg-emerald-100 dark:bg-emerald-900/30"
                  : "bg-orange-100 dark:bg-orange-900/30"
              )}>
                {netBalance >= 0 ? (
                  <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                )}
              </div>
              <div>
                <p style={{ fontSize: '12px', fontWeight: '500' }} className={cn(
                  netBalance >= 0
                    ? "text-emerald-700 dark:text-emerald-300"
                    : "text-orange-700 dark:text-orange-300"
                )}>
                  Monthly Net {netBalance >= 0 ? 'Surplus' : 'Deficit'}
                </p>
                <p style={{ fontSize: '24px', fontWeight: '800', lineHeight: '1.2' }} className={cn(
                  netBalance >= 0
                    ? "text-emerald-900 dark:text-emerald-100"
                    : "text-orange-900 dark:text-orange-100"
                )}>
                  {balanceVisible ? formatCurrency(Math.abs(netBalance)) : '••••••'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p style={{ fontSize: '11px' }} className="text-muted-foreground">
                {netBalance >= 0 ? 'Great job on saving!' : 'Consider reducing expenses'}
              </p>
              <p style={{ fontSize: '11px' }} className="text-muted-foreground">
                {balanceVisible ? `Income: ${formatCurrency(income)} • Expenses: ${formatCurrency(expenses)}` : '••••••'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <Card className="lg:col-span-2 shadow-sm hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle style={{ fontSize: '18px', fontWeight: '600' }}>Recent Transactions</CardTitle>
              <CardDescription style={{ fontSize: '12px' }}>
                Your latest {viewMode} activities • {currentTransactions.length} recent
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('transactions')}
              className="hover:bg-accent/80 transition-colors"
              style={{ fontSize: '11px' }}
            >
              View All
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentTransactions.map((transaction, index) => (
              <div
                key={transaction.id}
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl border transition-all duration-300",
                  "hover:bg-accent/30 hover:scale-[1.01] hover:shadow-md cursor-pointer",
                  "border-border/50 group"
                )}
                onClick={() => onNavigate('transactions')}
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'slideUp 0.5s ease-out forwards'
                }}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "p-3 rounded-xl text-xl shadow-sm transition-all duration-200 group-hover:scale-110",
                    transaction.type === 'income'
                      ? 'bg-emerald-100 dark:bg-emerald-900/30'
                      : 'bg-red-100 dark:bg-red-900/30'
                  )}>
                    {/* You can render an icon based on category if you have mapping */}
                    {transaction.category?.[0]?.toUpperCase() || "₹"}
                  </div>
                  <div className="space-y-1">
                    <p style={{ fontSize: '12px', fontWeight: '500', lineHeight: '1.3' }} className="text-foreground group-hover:text-foreground/80 transition-colors">
                      {transaction.description}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" style={{ fontSize: '10px' }} className="px-2 py-0">
                        {transaction.category}
                      </Badge>
                      {transaction.paymentMethod && (
                        <Badge variant="outline" style={{ fontSize: '10px' }} className="px-2 py-0">
                          {transaction.paymentMethod}
                        </Badge>
                      )}
                      {viewMode === 'family' && transaction.user && (
                        <Badge variant="secondary" style={{ fontSize: '10px' }} className="px-2 py-0">
                          {transaction.user === 'Family' ? '👨‍👩‍👧‍👦' : transaction.user.split(' ')[0]}
                        </Badge>
                      )}
                    </div>
                    {transaction.location && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span style={{ fontSize: '10px' }}>{transaction.location}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <p className={cn(
                    "font-semibold transition-colors duration-200",
                    transaction.type === 'income'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-red-600 dark:text-red-400'
                  )} style={{ fontSize: '14px', fontWeight: '600' }}>
                    {transaction.type === 'income' ? '+' : ''}
                     {balanceVisible ? formatCurrency(Math.abs(transaction.amount)) : '••••••'}
                  </p>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span style={{ fontSize: '10px' }}>{formatDateShort(transaction.date)}</span>
                  </div>
                </div>
              </div>
            ))}

            <div className="pt-2">
              <Button
                variant="ghost"
                onClick={() => onNavigate('transactions')}
                className="w-full justify-center text-muted-foreground hover:text-foreground transition-colors"
                style={{ fontSize: '11px' }}
              >
                View all transactions →
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right Sidebar: Down to you, e.g. budget by category */}
        <div className="space-y-6">
          <Card className="shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle style={{ fontSize: '18px', fontWeight: '600' }}>Budget Overview</CardTitle>
              <CardDescription style={{ fontSize: '12px' }}>Expenses by category this month</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(budgetOverview).length === 0 && <div className="text-muted-foreground text-sm">No expense data yet.</div>}
              {Object.entries(budgetOverview).map(([cat, spent]) => (
                <div key={cat} className="flex justify-between items-center">
                  <span className="text-foreground text-sm font-medium">{cat}</span>
                  <span className="text-muted-foreground text-sm">{balanceVisible ? formatCurrency(spent) : '••••••'}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}