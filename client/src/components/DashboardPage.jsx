import React, { useState, useEffect } from 'react';
import { Plus, TrendingUp, TrendingDown, Wallet, Users, ArrowUpRight, ArrowDownRight, Eye, EyeOff, Target, Calendar, Clock, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.jsx';
import { Button } from './ui/button.jsx';
import { Avatar, AvatarFallback } from './ui/avatar.jsx';
import { Badge } from './ui/badge.jsx';
import { formatCurrency, formatDateShort, cn } from '../lib/utils.js';

const mockBudgets = [
  { category: 'Food & Dining', spent: 18000, budget: 25000, color: 'emerald' },
  { category: 'Transportation', spent: 8000, budget: 12000, color: 'blue' },
  { category: 'Entertainment', spent: 5000, budget: 8000, color: 'purple' },
  { category: 'Bills & Utilities', spent: 6000, budget: 7000, color: 'orange' }
];

export function DashboardPage({ onNavigate, viewMode, user, dashboardData, familyMembers }) {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [timeOfDay, setTimeOfDay] = useState('');
  
  // Add defensive checks for dashboardData and its properties
  const currentData = dashboardData?.[viewMode] || {
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpense: 0,
    savingsGoal: 0,
    currentSavings: 0,
    recentTransactions: [],
  };
  const currentTransactions = currentData.recentTransactions;

  // Set time-based greeting
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay('Morning');
    else if (hour < 17) setTimeOfDay('Afternoon');
    else setTimeOfDay('Evening');
  }, []);
  const savingsPercentage = currentData.savingsGoal > 0 ? (currentData.currentSavings / currentData.savingsGoal) * 100 : 0;
  const netBalance = currentData.monthlyIncome - currentData.monthlyExpense;

  // Corrected: Use user?.username instead of user?.name
  const userName = user?.username ? user.username.split(' ')[0] : 'User';
  return (
    <div className="space-y-6 animate-fade-in">
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
              {balanceVisible ? formatCurrency(currentData.totalBalance) : '••••••'}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="w-3 h-3" />
                <span style={{ fontSize: '11px', fontWeight: '500' }}>+2.1%</span>
              </div>
              <span style={{ fontSize: '11px' }} className="text-muted-foreground">from last month</span>
            </div>
          </CardContent>
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-200/20 dark:bg-blue-800/20 rounded-full"></div>
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
              {formatCurrency(currentData.monthlyIncome)}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="w-3 h-3" />
                <span style={{ fontSize: '11px', fontWeight: '500' }}>+5.4%</span>
              </div>
              <span style={{ fontSize: '11px' }} className="text-muted-foreground">from last month</span>
            </div>
          </CardContent>
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-emerald-200/20 dark:bg-emerald-800/20 rounded-full"></div>
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
              {formatCurrency(currentData.monthlyExpense)}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <TrendingDown className="w-3 h-3 rotate-180" />
                <span style={{ fontSize: '11px', fontWeight: '500' }}>-3.2%</span>
              </div>
              <span style={{ fontSize: '11px' }} className="text-muted-foreground">from last month</span>
            </div>
          </CardContent>
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-red-200/20 dark:bg-red-800/20 rounded-full"></div>
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
              {Math.round(savingsPercentage)}%
            </div>
            <div className="space-y-2">
              <div className="w-full bg-purple-200/50 dark:bg-purple-800/30 rounded-full h-2.5">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-violet-500 h-2.5 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min(savingsPercentage, 100)}%` }}
                ></div>
              </div>
              <p style={{ fontSize: '11px' }} className="text-purple-600 dark:text-purple-400">
                {formatCurrency(currentData.currentSavings)} of {formatCurrency(currentData.savingsGoal)}
              </p>
            </div>
          </CardContent>
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-purple-200/20 dark:bg-purple-800/20 rounded-full"></div>
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
                  {formatCurrency(Math.abs(netBalance))}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p style={{ fontSize: '11px' }} className="text-muted-foreground">
                {netBalance >= 0 ? 'Great job on saving!' : 'Consider reducing expenses'}
              </p>
              <p style={{ fontSize: '11px' }} className="text-muted-foreground">
                Income: {formatCurrency(currentData.monthlyIncome)} • Expenses: {formatCurrency(currentData.monthlyExpense)}
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
                    {transaction.categoryIcon}
                  </div>
                  <div className="space-y-1">
                    <p style={{ fontSize: '12px', fontWeight: '500', lineHeight: '1.3' }} className="text-foreground group-hover:text-foreground/80 transition-colors">
                      {transaction.description}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" style={{ fontSize: '10px' }} className="px-2 py-0">
                        {transaction.category}
                      </Badge>
                      <Badge variant="outline" style={{ fontSize: '10px' }} className="px-2 py-0">
                        {transaction.paymentMethod}
                      </Badge>
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
                    {formatCurrency(Math.abs(transaction.amount))}
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

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Family Members (only show in family view) */}
          {viewMode === 'family' && (
            <Card className="shadow-sm hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle style={{ fontSize: '18px', fontWeight: '600' }}>Family Overview</CardTitle>
                <CardDescription style={{ fontSize: '12px' }}>Monthly spending by member</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {familyMembers.map((member, index) => (
                  <div 
                    key={member.id} 
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl border transition-all duration-300",
                      "hover:bg-accent/20 cursor-pointer border-border/50 group"
                    )}
                    onClick={() => onNavigate('my-family')}
                    style={{ 
                      animationDelay: `${index * 150}ms`,
                      animation: 'fadeIn 0.6s ease-out forwards'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className={cn("w-10 h-10 shadow-md bg-gradient-to-br", member.color)}>
                          <AvatarFallback className="text-white font-medium bg-transparent" style={{ fontSize: '10px' }}>
                            {member.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className={cn(
                          "absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background",
                          member.status === 'active' ? "bg-emerald-500" : "bg-gray-400"
                        )}></div>
                      </div>
                      <div className="space-y-1">
                        <p style={{ fontSize: '12px', fontWeight: '500', lineHeight: '1.3' }} className="text-foreground">
                          {member.name}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={member.role === 'Admin' ? 'default' : 'outline'} 
                            style={{ fontSize: '9px' }}
                            className="px-1.5 py-0"
                          >
                            {member.role}
                          </Badge>
                          <span style={{ fontSize: '9px' }} className="text-muted-foreground">
                            {member.lastSeen}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <p style={{ fontSize: '12px', fontWeight: '600' }} className="text-foreground">
                        {formatCurrency(member.expenses)}
                      </p>
                      <p style={{ fontSize: '10px' }} className="text-muted-foreground">This month</p>
                    </div>
                  </div>
                ))}
                
                <div className="pt-2">
                  <Button
                    variant="ghost"
                    onClick={() => onNavigate('my-family')}
                    className="w-full justify-center text-muted-foreground hover:text-foreground transition-colors"
                    style={{ fontSize: '11px' }}
                >
                  Manage family →
                </Button>
              </div>
            </CardContent>
          </Card>
          )}

          {/* Budget Overview */}
          <Card className="shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle style={{ fontSize: '18px', fontWeight: '600' }}>Budget Overview</CardTitle>
              <CardDescription style={{ fontSize: '12px' }}>Current month progress</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockBudgets.map((budget, index) => {
                const percentage = (budget.spent / budget.budget) * 100;
                const isOverBudget = percentage > 100;
                
                return (
                  <div 
                    key={budget.category} 
                    className="space-y-2"
                    style={{ 
                      animationDelay: `${index * 100}ms`,
                      animation: 'slideUp 0.5s ease-out forwards'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span style={{ fontSize: '11px', fontWeight: '500' }} className="text-foreground">
                        {budget.category}
                      </span>
                      <span style={{ fontSize: '10px' }} className={cn(
                        "font-medium",
                        isOverBudget ? "text-red-600" : "text-muted-foreground"
                      )}>
                        {formatCurrency(budget.spent)} / {formatCurrency(budget.budget)}
                      </span>
                    </div>
                    <div className="w-full bg-muted/50 rounded-full h-2">
                      <div 
                        className={cn(
                          "h-2 rounded-full transition-all duration-1000 ease-out",
                          isOverBudget 
                            ? "bg-gradient-to-r from-red-500 to-red-600" 
                            : `bg-gradient-to-r from-${budget.color}-400 to-${budget.color}-500`
                        )}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span style={{ fontSize: '10px' }} className={cn(
                        isOverBudget ? "text-red-600" : "text-muted-foreground"
                      )}>
                        {Math.round(percentage)}% used
                      </span>
                      {isOverBudget && (
                        <Badge variant="destructive" style={{ fontSize: '8px' }} className="px-1.5 py-0">
                          Over budget
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
              
              <div className="pt-2">
                <Button
                  variant="ghost"
                  onClick={() => onNavigate('analytics')}
                  className="w-full justify-center text-muted-foreground hover:text-foreground transition-colors"
                  style={{ fontSize: '11px' }}
              >
                View detailed budgets →
              </Button>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}