import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatDateShort(date: Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
  }).format(date);
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export const transactionCategories = {
  income: [
    { id: 'salary', name: 'Salary', icon: '💼', color: '#10b981' },
    { id: 'business', name: 'Business', icon: '🏢', color: '#3b82f6' },
    { id: 'investment', name: 'Investment', icon: '📈', color: '#8b5cf6' },
    { id: 'other-income', name: 'Other Income', icon: '💰', color: '#f59e0b' },
  ],
  expense: [
    { id: 'food', name: 'Food & Dining', icon: '🍽️', color: '#ef4444' },
    { id: 'transport', name: 'Transportation', icon: '🚗', color: '#3b82f6' },
    { id: 'shopping', name: 'Shopping', icon: '🛒', color: '#8b5cf6' },
    { id: 'entertainment', name: 'Entertainment', icon: '🎬', color: '#f59e0b' },
    { id: 'bills', name: 'Bills & Utilities', icon: '⚡', color: '#10b981' },
    { id: 'healthcare', name: 'Healthcare', icon: '🏥', color: '#ef4444' },
    { id: 'education', name: 'Education', icon: '📚', color: '#3b82f6' },
    { id: 'other-expense', name: 'Other Expense', icon: '📦', color: '#6b7280' },
  ],
};

export const paymentMethods = [
  { id: 'upi', name: 'UPI', icon: '📱' },
  { id: 'cash', name: 'Cash', icon: '💵' },
  { id: 'card', name: 'Card', icon: '💳' },
  { id: 'bank_transfer', name: 'Bank Transfer', icon: '🏦' },
];