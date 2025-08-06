// Transaction Categories
export const transactionCategories = {
  income: [
    { id: 'salary', name: 'Salary', icon: '💼', color: '#10b981' },
    { id: 'business', name: 'Business', icon: '🏢', color: '#3b82f6' },
    { id: 'investment', name: 'Investment Returns', icon: '📈', color: '#8b5cf6' },
    { id: 'freelance', name: 'Freelance', icon: '💻', color: '#f59e0b' },
    { id: 'rental', name: 'Rental Income', icon: '🏠', color: '#06b6d4' },
    { id: 'other-income', name: 'Other Income', icon: '💰', color: '#84cc16' },
  ],
  expense: [
    { id: 'food', name: 'Food & Dining', icon: '🍽️', color: '#ef4444' },
    { id: 'transport', name: 'Transportation', icon: '🚗', color: '#3b82f6' },
    { id: 'shopping', name: 'Shopping', icon: '🛒', color: '#8b5cf6' },
    { id: 'entertainment', name: 'Entertainment', icon: '🎬', color: '#f59e0b' },
    { id: 'bills', name: 'Bills & Utilities', icon: '⚡', color: '#10b981' },
    { id: 'healthcare', name: 'Healthcare', icon: '🏥', color: '#ef4444' },
    { id: 'education', name: 'Education', icon: '📚', color: '#3b82f6' },
    { id: 'travel', name: 'Travel', icon: '✈️', color: '#06b6d4' },
    { id: 'insurance', name: 'Insurance', icon: '🛡️', color: '#64748b' },
    { id: 'investment', name: 'Investments', icon: '📊', color: '#8b5cf6' },
    { id: 'gifts', name: 'Gifts & Donations', icon: '🎁', color: '#ec4899' },
    { id: 'other-expense', name: 'Other Expense', icon: '📦', color: '#6b7280' },
  ],
};

// Payment Methods
export const paymentMethods = [
  { id: 'upi', name: 'UPI', icon: '📱', description: 'PhonePe, GPay, Paytm' },
  { id: 'cash', name: 'Cash', icon: '💵', description: 'Physical currency' },
  { id: 'credit_card', name: 'Credit Card', icon: '💳', description: 'Credit card payment' },
  { id: 'debit_card', name: 'Debit Card', icon: '💳', description: 'Debit card payment' },
  { id: 'bank_transfer', name: 'Bank Transfer', icon: '🏦', description: 'Direct bank transfer' },
  { id: 'auto_debit', name: 'Auto Debit', icon: '🔄', description: 'Automatic payment' },
];

// Navigation Items
export const navItems = [
  { 
    id: 'dashboard', 
    label: 'Dashboard', 
    icon: 'Home', 
    description: 'Financial overview',
    shortcut: '⌘D'
  },
  { 
    id: 'transactions', 
    label: 'Transactions', 
    icon: 'Receipt', 
    description: 'All transactions',
    shortcut: '⌘T'
  },
  { 
    id: 'my-family', 
    label: 'My Family', 
    icon: 'Users', 
    description: 'Family members',
    shortcut: '⌘F'
  },
  { 
    id: 'analytics', 
    label: 'Analytics', 
    icon: 'BarChart3', 
    description: 'Insights & trends',
    shortcut: '⌘A'
  },
  { 
    id: 'settings', 
    label: 'Settings', 
    icon: 'Settings', 
    description: 'App preferences',
    shortcut: '⌘S'
  },
];

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  MEMBER: 'member'
};

// Transaction Types
export const TRANSACTION_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense'
};

// Status Types
export const STATUS_TYPES = {
  ACTIVE: 'active',
  AWAY: 'away',
  OFFLINE: 'offline'
};