import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Search, Filter, Plus, ArrowUpRight, ArrowDownRight, SlidersHorizontal, MapPin, Clock, Download, Upload, AlertCircle, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.jsx';
import { Button } from './ui/button.jsx';
import { Input } from './ui/input.jsx';
import { Badge } from './ui/badge.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select.jsx';
import { formatCurrency, formatDate, formatDateShort, cn } from '../lib/utils.js';

const paymentMethods = [
  { id: 'upi', name: 'UPI', description: 'Google Pay, PhonePe, etc.', icon: '📱' },
  { id: 'cash', name: 'Cash', description: 'Physical currency', icon: '💵' },
  { id: 'credit_card', name: 'Credit Card', description: 'Visa, Mastercard, etc.', icon: '💳' },
  { id: 'debit_card', name: 'Debit Card', description: 'Bank card', icon: '💳' },
  { id: 'bank_transfer', name: 'Bank Transfer', description: 'NEFT, IMPS, RTGS', icon: '🏦' },
  { id: 'auto_debit', name: 'Auto Debit', description: 'Recurring payments', icon: '🔄' },
];

// A simple, self-hiding alert component
const ViewModeAlert = ({ message }) => {
  if (!message) return null;
  return (
    <>
      <style>
        {`
          @keyframes fade-in-down-alert {
            0% {
              opacity: 0;
              transform: translate(-50%, -20px);
            }
            100% {
              opacity: 1;
              transform: translate(-50%, 0);
            }
          }
          .animate-fade-in-down-alert {
            animation: fade-in-down-alert 0.5s ease-out forwards;
          }
        `}
      </style>
      <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-background text-foreground border shadow-lg rounded-full px-6 py-3 flex items-center gap-2 animate-fade-in-down-alert">
        <Info className="w-5 h-5 text-blue-500" />
        <span className="text-sm font-medium">{message}</span>
      </div>
    </>
  );
};

export function TransactionsPage({ onNavigate, viewMode = 'all', user }) {
  const [transactions, setTransactions] = useState([]);
  const [fetchedCategories, setFetchedCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alertMessage, setAlertMessage] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [memberFilter, setMemberFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [dateRange, setDateRange] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Effect for showing view mode switch alert
  useEffect(() => {
    if (viewMode) {
      // Don't show the alert on initial load if viewMode is 'all'
      if(viewMode !== 'all') {
        setAlertMessage(`Switched to ${viewMode} view`);
        const timer = setTimeout(() => {
          setAlertMessage('');
        }, 2500); // Alert disappears after 2.5 seconds
        return () => clearTimeout(timer);
      }
    }
  }, [viewMode]);

  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please log in.');
        setIsLoading(false);
        return;
      }

      try {
        const config = { headers: { 'Authorization': `Bearer ${token}` } };
        
        const categoriesRes = await axios.get('http://localhost:5000/api/categories', config);
        setFetchedCategories(categoriesRes.data);
        
        // Determine the endpoint based on the viewMode prop
        let endpoint;
        if (viewMode === 'personal') {
          endpoint = '/api/transactions/personal';
        } else if (viewMode === 'family') {
          endpoint = '/api/transactions/family';
        } else {
          endpoint = '/api/transactions/all';
        }
        
        const transactionsRes = await axios.get(`http://localhost:5000${endpoint}`, config);
        
        const categoriesMap = new Map(categoriesRes.data.map(c => [c.name, c.icon]));
        const fetchedTransactions = transactionsRes.data.map(t => ({
          ...t,
          date: t.date ? new Date(t.date) : new Date(),
          categoryIcon: categoriesMap.get(t.category) || '❓',
          userName: t.userName || 'Unknown Member'
        }));
        
        setTransactions(fetchedTransactions);
      } catch (err) {
        console.error("Failed to fetch transactions:", err);
        setError('Failed to load transactions. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [viewMode]);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(transaction => {
        // Explicitly filter by viewMode on the client-side for robustness.
        // This ensures that even if the API returns mixed data, the UI only shows what's relevant.
        const isFamilyTransaction = !!transaction.familyId;
        if (viewMode === 'personal' && isFamilyTransaction) {
            return false;
        }
        if (viewMode === 'family' && !isFamilyTransaction) {
            return false;
        }

        const matchesSearch = (transaction.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                              (transaction.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                              (transaction.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                              (transaction.notes || '').toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesCategory = categoryFilter === 'all' || transaction.category === categoryFilter;
        const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
        const matchesMember = memberFilter === 'all' || transaction.userName === memberFilter;
        const matchesPayment = paymentFilter === 'all' || transaction.paymentMethod === paymentFilter;
        
        let matchesDate = true;
        if (dateRange !== 'all' && transaction.date) {
          const now = new Date();
          const transactionDate = transaction.date;
          
          switch (dateRange) {
            case 'today':
              matchesDate = transactionDate.toDateString() === now.toDateString();
              break;
            case 'week':
              const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
              matchesDate = transactionDate >= weekAgo;
              break;
            case 'month':
              const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
              matchesDate = transactionDate >= monthAgo;
              break;
            case 'year':
              const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
              matchesDate = transactionDate >= yearAgo;
              break;
            default:
              break;
          }
        }
        
        return matchesSearch && matchesCategory && matchesType && matchesMember && matchesPayment && matchesDate;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'date-desc':
            return (b.date?.getTime() || 0) - (a.date?.getTime() || 0);
          case 'date-asc':
            return (a.date?.getTime() || 0) - (b.date?.getTime() || 0);
          case 'amount-desc':
            return Math.abs(b.amount) - Math.abs(a.amount);
          case 'amount-asc':
            return Math.abs(a.amount) - Math.abs(b.amount);
          case 'category':
            return (a.category || '').localeCompare(b.category || '');
          default:
            return (b.date?.getTime() || 0) - (a.date?.getTime() || 0);
        }
      });
  }, [transactions, viewMode, searchTerm, categoryFilter, typeFilter, memberFilter, paymentFilter, sortBy, dateRange]);

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const netBalance = totalIncome - totalExpense;
  const activeFilters = [categoryFilter, typeFilter, memberFilter, paymentFilter, dateRange]
    .filter(f => f !== 'all').length;

  const uniqueMembers = [...new Set(transactions.map(t => t.userName))].filter(Boolean);

  const paymentMethodsMap = new Map(paymentMethods.map(pm => [pm.id, pm.name]));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-t-4 border-blue-500 rounded-full animate-spin"></div>
        <p className="ml-4 text-muted-foreground">Loading transactions...</p>
      </div>
    );
  }

  if (error) {
    return <div className="bg-destructive/10 text-destructive border border-destructive/30 p-4 rounded-lg flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <ViewModeAlert message={alertMessage} />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <h1 style={{ fontSize: '28px', fontWeight: '700', lineHeight: '1.2' }} className="text-foreground">
            Transactions
          </h1>
          <p style={{ fontSize: '14px', lineHeight: '1.5' }} className="text-muted-foreground">
            Track and manage all your {viewMode} transactions • {filteredTransactions.length} results
          </p>
        </div>
        <div className="flex items-center gap-3">
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p style={{ fontSize: '12px', fontWeight: '500' }} className="text-emerald-700 dark:text-emerald-300">
                  Total Income
                </p>
                <p style={{ fontSize: '24px', fontWeight: '800', lineHeight: '1.2' }} className="text-emerald-900 dark:text-emerald-100">
                  {formatCurrency(totalIncome)}
                </p>
                <p style={{ fontSize: '11px' }} className="text-emerald-600 dark:text-emerald-400">
                  From {filteredTransactions.filter(t => t.type === 'income').length} transactions
                </p>
              </div>
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                <ArrowUpRight className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-emerald-200/20 dark:bg-emerald-800/20 rounded-full"></div>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p style={{ fontSize: '12px', fontWeight: '500' }} className="text-red-700 dark:text-red-300">
                  Total Expenses
                </p>
                <p style={{ fontSize: '24px', fontWeight: '800', lineHeight: '1.2' }} className="text-red-900 dark:text-red-100">
                  {formatCurrency(totalExpense)}
                </p>
                <p style={{ fontSize: '11px' }} className="text-red-600 dark:text-red-400">
                  From {filteredTransactions.filter(t => t.type === 'expense').length} transactions
                </p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                <ArrowDownRight className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-red-200/20 dark:bg-red-800/20 rounded-full"></div>
        </Card>

        <Card className={cn(
          "relative overflow-hidden border-0 hover:shadow-lg transition-all duration-300",
          netBalance >= 0 
            ? "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20"
            : "bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20"
        )}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p style={{ fontSize: '12px', fontWeight: '500' }} className={cn(
                  netBalance >= 0 
                    ? "text-blue-700 dark:text-blue-300"
                    : "text-orange-700 dark:text-orange-300"
                )}>
                  Net Balance
                </p>
                <p style={{ fontSize: '24px', fontWeight: '800', lineHeight: '1.2' }} className={cn(
                  netBalance >= 0 
                    ? "text-blue-900 dark:text-blue-100"
                    : "text-orange-900 dark:text-orange-100"
                )}>
                  {netBalance >= 0 ? '+' : ''}{formatCurrency(netBalance)}
                </p>
                <p style={{ fontSize: '11px' }} className={cn(
                  netBalance >= 0 
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-orange-600 dark:text-orange-400"
                )}>
                  {netBalance >= 0 ? 'Surplus' : 'Deficit'} for filtered period
                </p>
              </div>
              <div className={cn(
                "p-3 rounded-xl",
                netBalance >= 0 
                  ? "bg-blue-100 dark:bg-blue-900/30"
                  : "bg-orange-100 dark:bg-orange-900/30"
              )}>
                {netBalance >= 0 ? (
                  <ArrowUpRight className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                ) : (
                  <ArrowDownRight className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                )}
              </div>
            </div>
          </CardContent>
          <div className={cn(
            "absolute -top-4 -right-4 w-20 h-20 rounded-full",
            netBalance >= 0 
              ? "bg-blue-200/20 dark:bg-blue-800/20"
              : "bg-orange-200/20 dark:bg-orange-800/20"
          )}></div>
        </Card>
      </div>

      {/* Filters and Transactions */}
      <Card className="shadow-sm hover:shadow-lg transition-all duration-300">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle style={{ fontSize: '18px', fontWeight: '600' }}>All Transactions</CardTitle>
              <CardDescription style={{ fontSize: '12px' }}>
                Search and filter your transactions with advanced options
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {activeFilters > 0 && (
                <Badge variant="outline" style={{ fontSize: '11px' }} className="px-2 py-1">
                  <Filter className="w-3 h-3 mr-1" />
                  {activeFilters} active
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="hover:bg-accent/80 transition-colors"
                style={{ fontSize: '11px' }}
              >
                <SlidersHorizontal className="w-4 h-4 mr-1" />
                Filters
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions, categories, notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-11"
              style={{ fontSize: '12px' }}
            />
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 p-4 bg-muted/20 rounded-lg animate-slide-up">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger style={{ fontSize: '12px' }}>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger style={{ fontSize: '12px' }}>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {fetchedCategories.map(category => (
                    <SelectItem key={category.id} value={category.name}>{category.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger style={{ fontSize: '12px' }}>
                  <SelectValue placeholder="Payment Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  {paymentMethods.map(method => (
                    <SelectItem key={method.id} value={method.id}>{method.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {viewMode === 'family' && (
                <Select value={memberFilter} onValueChange={setMemberFilter}>
                  <SelectTrigger style={{ fontSize: '12px' }}>
                    <SelectValue placeholder="Member" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Members</SelectItem>
                    {uniqueMembers.map(member => (
                      <SelectItem key={member} value={member}>{member}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger style={{ fontSize: '12px' }}>
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger style={{ fontSize: '12px' }}>
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Latest First</SelectItem>
                  <SelectItem value="date-asc">Oldest First</SelectItem>
                  <SelectItem value="amount-desc">Highest Amount</SelectItem>
                  <SelectItem value="amount-asc">Lowest Amount</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2 lg:col-span-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCategoryFilter('all');
                    setTypeFilter('all');
                    setMemberFilter('all');
                    setPaymentFilter('all');
                    setDateRange('all');
                    setSearchTerm('');
                  }}
                  style={{ fontSize: '11px' }}
                >
                  Clear All
                </Button>
              </div>
            </div>
          )}

          {/* Transactions List */}
          <div className="space-y-3">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 style={{ fontSize: '18px', fontWeight: '600' }} className="text-foreground mb-2">
                  No transactions found
                </h3>
                <p style={{ fontSize: '12px' }} className="text-muted-foreground mb-4">
                  Try adjusting your search criteria or filters
                </p>
                <Button
                  onClick={() => onNavigate('add-transaction')}
                  className="gap-2"
                  style={{ fontSize: '12px' }}
                >
                  <Plus className="w-4 h-4" />
                  Add Your First Transaction
                </Button>
              </div>
            ) : (
              filteredTransactions.map((transaction, index) => (
                <div
                  key={transaction.id}
                  className={cn(
                    "flex items-start justify-between p-4 rounded-xl border transition-all duration-300",
                    "hover:bg-accent/30 hover:scale-[1.01] hover:shadow-md cursor-pointer",
                    "border-border/50 group"
                  )}
                  style={{ 
                    animationDelay: `${index * 50}ms`,
                    animation: 'fadeIn 0.5s ease-out forwards'
                  }}
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className={cn(
                      "p-3 rounded-xl text-lg shadow-sm transition-all duration-200 group-hover:scale-110 shrink-0",
                      transaction.type === 'income' 
                        ? 'bg-emerald-100 dark:bg-emerald-900/30' 
                        : 'bg-red-100 dark:bg-red-900/30'
                    )}>
                      {transaction.categoryIcon}
                    </div>
                    
                    <div className="space-y-2 flex-1 min-w-0">
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: '600', lineHeight: '1.3' }} className="text-foreground group-hover:text-foreground/80 transition-colors">
                          {transaction.description}
                        </p>
                        {transaction.notes && (
                          <p style={{ fontSize: '11px', lineHeight: '1.5' }} className="text-muted-foreground mt-1">
                            {transaction.notes}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" style={{ fontSize: '10px' }} className="px-2 py-0">
                          {transaction.categoryIcon} {transaction.category}
                        </Badge>
                        <Badge variant="outline" style={{ fontSize: '10px' }} className="px-2 py-0">
                          {paymentMethodsMap.get(transaction.paymentMethod) || transaction.paymentMethod}
                        </Badge>
                        {viewMode === 'family' && transaction.userName && (
                          <Badge 
                            variant={transaction.isPersonal ? "secondary" : "outline"} 
                            style={{ fontSize: '10px' }} 
                            className="px-2 py-0"
                          >
                            {transaction.isPersonal ? 'Personal' : transaction.userName.split(' ')[0]}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span style={{ fontSize: '10px' }}>{formatDate(transaction.date)}</span>
                        </div>
                        {transaction.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span style={{ fontSize: '10px' }} className="truncate">{transaction.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right space-y-1 shrink-0 ml-4">
                    <p className={cn(
                      "font-bold transition-colors duration-200",
                      transaction.type === 'income' 
                        ? 'text-emerald-600 dark:text-emerald-400' 
                        : 'text-red-600 dark:text-red-400'
                    )} style={{ fontSize: '16px', fontWeight: '700' }}>
                      {transaction.type === 'income' ? '+' : ''}
                      {formatCurrency(Math.abs(transaction.amount))}
                    </p>
                    <p style={{ fontSize: '10px' }} className="text-muted-foreground">
                      {formatDateShort(transaction.date)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {filteredTransactions.length > 0 && (
            <div className="flex justify-center pt-6">
              <Button
                variant="outline"
                className="text-muted-foreground hover:text-foreground transition-colors"
                style={{ fontSize: '11px' }}
              >
                <Upload className="w-4 h-4 mr-2" />
                Load more transactions
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}