// Mock Financial Data
export const mockFinancialData = {
  personal: {
    totalBalance: 85000,
    monthlyIncome: 75000,
    monthlyExpense: 18000,
    savingsGoal: 50000,
    currentSavings: 35000,
  },
  family: {
    totalBalance: 125000,
    monthlyIncome: 95000,
    monthlyExpense: 32000,
    savingsGoal: 75000,
    currentSavings: 45000,
  }
};

// Mock Family Members
export const mockFamilyMembers = [
  { 
    id: '1', 
    name: 'Priya Sharma', 
    email: 'priya.sharma@example.com',
    phone: '+91 98765 43210',
    role: 'admin', 
    expenses: 15000, 
    avatar: 'PS',
    color: 'from-blue-500 to-indigo-500',
    status: 'active',
    lastSeen: 'now',
    joinedAt: new Date('2023-01-15')
  },
  { 
    id: '2', 
    name: 'Rajesh Sharma', 
    email: 'rajesh.sharma@example.com',
    phone: '+91 98765 43211',
    role: 'member', 
    expenses: 12000,
    avatar: 'RS',
    color: 'from-emerald-500 to-green-500',
    status: 'active',
    lastSeen: '2h ago',
    joinedAt: new Date('2023-01-15')
  },
  { 
    id: '3', 
    name: 'Aarav Sharma', 
    email: 'aarav.sharma@example.com',
    phone: '+91 98765 43212',
    role: 'member', 
    expenses: 5000,
    avatar: 'AS',
    color: 'from-purple-500 to-pink-500',
    status: 'away',
    lastSeen: '1d ago',
    joinedAt: new Date('2023-02-01')
  }
];

// Mock Transactions
export const mockTransactions = [
  {
    id: '1',
    amount: -2500,
    description: 'Weekly Groceries - Big Bazaar',
    category: 'Food & Dining',
    categoryIcon: '🛒',
    paymentMethod: 'UPI',
    type: 'expense',
    date: new Date(),
    userId: '1',
    userName: 'Priya Sharma',
    isPersonal: false,
    location: 'Andheri East, Mumbai',
    notes: 'Monthly household shopping'
  },
  {
    id: '2',
    amount: 75000,
    description: 'Monthly Salary - Tech Solutions Pvt Ltd',
    category: 'Salary',
    categoryIcon: '💼',
    paymentMethod: 'Bank Transfer',
    type: 'income',
    date: new Date(Date.now() - 86400000),
    userId: '1',
    userName: 'Priya Sharma',
    isPersonal: true,
    location: null,
    notes: 'October 2024 salary'
  },
  {
    id: '3',
    amount: -1800,
    description: 'Electricity Bill - MSEB',
    category: 'Bills & Utilities',
    categoryIcon: '⚡',
    paymentMethod: 'UPI',
    type: 'expense',
    date: new Date(Date.now() - 172800000),
    userId: '2',
    userName: 'Rajesh Sharma',
    isPersonal: false,
    location: 'Mumbai, Maharashtra',
    notes: 'October electricity bill'
  }
];

// Mock Budget Data
export const mockBudgets = [
  { category: 'Food & Dining', spent: 18000, budget: 25000, color: 'emerald' },
  { category: 'Transportation', spent: 8000, budget: 12000, color: 'blue' },
  { category: 'Entertainment', spent: 5000, budget: 8000, color: 'purple' },
  { category: 'Bills & Utilities', spent: 6000, budget: 7000, color: 'orange' }
];

// Mock Notifications
export const mockNotifications = [
  { id: 1, type: 'expense', message: 'Large cash expense detected', unread: true, timestamp: new Date() },
  { id: 2, type: 'family', message: 'Rajesh added a new transaction', unread: true, timestamp: new Date(Date.now() - 3600000) },
  { id: 3, type: 'budget', message: 'Monthly budget 80% reached', unread: false, timestamp: new Date(Date.now() - 86400000) },
];