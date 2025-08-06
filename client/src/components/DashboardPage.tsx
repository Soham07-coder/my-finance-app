// import React from 'react';
// import { Plus, TrendingUp, TrendingDown, Wallet, Users, ArrowUpRight, ArrowDownRight } from 'lucide-react';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
// import { Button } from './ui/button';
// import { Avatar, AvatarFallback } from './ui/avatar';
// import { Badge } from './ui/badge';
// import { formatCurrency, formatDateShort } from '../lib/utils';
// import type { NavigationProps } from '../types';

// interface DashboardData {
//   totalBalance: number;
//   monthlyIncome: number;
//   monthlyExpense: number;
//   recentTransactions: Array<{
//     id: string;
//     description: string;
//     amount: number;
//     type: 'income' | 'expense';
//     category: string;
//     date: Date;
//     user: string;
//   }>;
//   familyMembers: Array<{
//     id: string;
//     name: string;
//     role: string;
//     expenses: number;
//   }>;
// }

// const mockData: DashboardData = {
//   totalBalance: 125000,
//   monthlyIncome: 85000,
//   monthlyExpense: 32000,
//   recentTransactions: [
//     {
//       id: '1',
//       description: 'Grocery Shopping',
//       amount: -2500,
//       type: 'expense',
//       category: 'Food & Dining',
//       date: new Date(),
//       user: 'Priya Sharma'
//     },
//     {
//       id: '2',
//       description: 'Salary Credit',
//       amount: 75000,
//       type: 'income',
//       category: 'Salary',
//       date: new Date(Date.now() - 86400000),
//       user: 'Priya Sharma'
//     },
//     {
//       id: '3',
//       description: 'Electricity Bill',
//       amount: -1800,
//       type: 'expense',
//       category: 'Bills & Utilities',
//       date: new Date(Date.now() - 172800000),
//       user: 'Rajesh Sharma'
//     }
//   ],
//   familyMembers: [
//     { id: '1', name: 'Priya Sharma', role: 'Admin', expenses: 15000 },
//     { id: '2', name: 'Rajesh Sharma', role: 'Member', expenses: 12000 },
//     { id: '3', name: 'Aarav Sharma', role: 'Member', expenses: 5000 }
//   ]
// };

// export function DashboardPage({ onNavigate }: NavigationProps) {
//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div>
//           <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
//           <p className="text-muted-foreground">
//             Welcome back, Priya! Here's your family financial overview.
//           </p>
//         </div>
//         <Button onClick={() => onNavigate('add-transaction')} className="gap-2 w-fit">
//           <Plus className="w-4 h-4" />
//           Add Transaction
//         </Button>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
//             <Wallet className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{formatCurrency(mockData.totalBalance)}</div>
//             <p className="text-xs text-muted-foreground">+2.1% from last month</p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
//             <TrendingUp className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{formatCurrency(mockData.monthlyIncome)}</div>
//             <p className="text-xs text-muted-foreground">+5.4% from last month</p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
//             <TrendingDown className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{formatCurrency(mockData.monthlyExpense)}</div>
//             <p className="text-xs text-muted-foreground">-3.2% from last month</p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Family Members</CardTitle>
//             <Users className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{mockData.familyMembers.length}</div>
//             <p className="text-xs text-muted-foreground">Active members</p>
//           </CardContent>
//         </Card>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Recent Transactions */}
//         <Card className="lg:col-span-2">
//           <CardHeader className="flex flex-row items-center justify-between">
//             <div>
//               <CardTitle>Recent Transactions</CardTitle>
//               <CardDescription>Your latest financial activities</CardDescription>
//             </div>
//             <Button variant="outline" size="sm" onClick={() => onNavigate('transactions')}>
//               View All
//             </Button>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             {mockData.recentTransactions.map((transaction) => (
//               <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
//                 <div className="flex items-center gap-3">
//                   <div className={`p-2 rounded-lg ${
//                     transaction.type === 'income' 
//                       ? 'bg-emerald-100 text-emerald-600' 
//                       : 'bg-red-100 text-red-600'
//                   }`}>
//                     {transaction.type === 'income' ? (
//                       <ArrowUpRight className="w-4 h-4" />
//                     ) : (
//                       <ArrowDownRight className="w-4 h-4" />
//                     )}
//                   </div>
//                   <div>
//                     <p className="font-medium text-foreground">{transaction.description}</p>
//                     <p className="text-sm text-muted-foreground">{transaction.category}</p>
//                   </div>
//                 </div>
//                 <div className="text-right">
//                   <p className={`font-semibold ${
//                     transaction.type === 'income' 
//                       ? 'text-emerald-600' 
//                       : 'text-red-600'
//                   }`}>
//                     {formatCurrency(Math.abs(transaction.amount))}
//                   </p>
//                   <p className="text-sm text-muted-foreground">
//                     {formatDateShort(transaction.date)}
//                   </p>
//                 </div>
//               </div>
//             ))}
//           </CardContent>
//         </Card>

//         {/* Family Members */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Family Overview</CardTitle>
//             <CardDescription>Monthly spending by member</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             {mockData.familyMembers.map((member) => (
//               <div key={member.id} className="flex items-center justify-between">
//                 <div className="flex items-center gap-3">
//                   <Avatar className="w-8 h-8">
//                     <AvatarFallback className="text-xs">
//                       {member.name.split(' ').map(n => n[0]).join('')}
//                     </AvatarFallback>
//                   </Avatar>
//                   <div>
//                     <p className="text-sm font-medium text-foreground">{member.name}</p>
//                     <Badge variant="outline" className="text-xs">
//                       {member.role}
//                     </Badge>
//                   </div>
//                 </div>
//                 <div className="text-right">
//                   <p className="text-sm font-medium text-foreground">
//                     {formatCurrency(member.expenses)}
//                   </p>
//                   <p className="text-xs text-muted-foreground">This month</p>
//                 </div>
//               </div>
//             ))}
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }