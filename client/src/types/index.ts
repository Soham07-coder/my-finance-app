export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'member';
}

export interface FamilyMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'member';
  joinedAt: Date;
}

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  paymentMethod: 'upi' | 'cash' | 'card' | 'bank_transfer';
  type: 'income' | 'expense';
  date: Date;
  location?: string;
  userId: string;
  familyId?: string;
  isPersonal: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense';
}

export type Page = 'dashboard' | 'transactions' | 'my-family' | 'analytics' | 'settings' | 'add-transaction';

export interface NavigationProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export interface AuthProps {
  onAuthSuccess: () => void;
}

export interface LayoutProps extends NavigationProps {
  children: React.ReactNode;
  onLogout: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}