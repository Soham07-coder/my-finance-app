// import React from 'react';
// import { Search, Bell, DollarSign, Receipt, Users, BarChart3, Plus, Menu, X, Home, ChevronRight, LogOut, UserCircle, Settings } from 'lucide-react';
// import { Button } from './ui/button';
// import { Input } from './ui/input';
// import { Badge } from './ui/badge';
// import { Avatar, AvatarFallback } from './ui/avatar';
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
// import { cn } from '../lib/utils';
// import type { LayoutProps } from '../types';

// const navItems = [
//   { id: 'dashboard', label: 'Dashboard', icon: Home, description: 'Overview' },
//   { id: 'transactions', label: 'Transactions', icon: Receipt, description: 'All transactions' },
//   { id: 'my-family', label: 'My Family', icon: Users, description: 'Family members' },
//   { id: 'analytics', label: 'Analytics', icon: BarChart3, description: 'Insights' },
//   { id: 'settings', label: 'Settings', icon: Settings, description: 'Preferences' },
// ] as const;

// export function Layout({ children, currentPage, onNavigate, onLogout, sidebarOpen, setSidebarOpen }: LayoutProps) {
//   const getPageTitle = (pageId: string) => {
//     const page = navItems.find(item => item.id === pageId);
//     return page ? page.label : 'Dashboard';
//   };

//   const handleProfileMenuAction = (action: string) => {
//     if (action === 'account') {
//       onNavigate('settings');
//     } else if (action === 'logout') {
//       onLogout();
//     }
//   };

//   return (
//     <div className="min-h-screen bg-background">
//       {/* Sidebar */}
//       <aside className={cn(
//         "fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border",
//         "transform transition-transform duration-300 ease-out lg:translate-x-0",
//         sidebarOpen ? 'translate-x-0' : '-translate-x-full',
//         "shadow-lg lg:shadow-none"
//       )}>
//         <div className="flex flex-col h-full">
//           {/* Logo Section */}
//           <div className={cn(
//             "flex items-center justify-between h-16 px-6 border-b border-border",
//             "bg-card"
//           )}>
//             <div className="flex items-center gap-3">
//               <div className={cn(
//                 "w-8 h-8 bg-primary rounded-lg flex items-center justify-center",
//                 "shadow-sm"
//               )}>
//                 <DollarSign className="w-4 h-4 text-primary-foreground" />
//               </div>
//               <div>
//                 <h1 className="text-base font-semibold text-card-foreground leading-tight">FamilyFin</h1>
//                 <p className="text-xs text-muted-foreground leading-tight">Finance Manager</p>
//               </div>
//             </div>
//             <Button 
//               variant="ghost" 
//               size="sm" 
//               className="lg:hidden h-8 w-8 p-0"
//               onClick={() => setSidebarOpen(false)}
//             >
//               <X className="w-4 h-4" />
//             </Button>
//           </div>

//           {/* Navigation */}
//           <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
//             {navItems.map((item) => {
//               const Icon = item.icon;
//               const isActive = currentPage === item.id;
//               return (
//                 <button
//                   key={item.id}
//                   onClick={() => onNavigate(item.id as any)}
//                   className={cn(
//                     "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-200",
//                     "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
//                     isActive 
//                       ? "bg-accent text-accent-foreground shadow-sm" 
//                       : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
//                   )}
//                 >
//                   <div className={cn(
//                     "p-1.5 rounded-md transition-colors duration-200",
//                     isActive 
//                       ? "bg-primary/10 text-primary" 
//                       : "bg-muted/50 text-muted-foreground"
//                   )}>
//                     <Icon className="w-4 h-4" />
//                   </div>
//                   <div className="flex-1 text-left">
//                     <div className="font-medium text-sm leading-tight">{item.label}</div>
//                     <div className="text-xs opacity-60 leading-tight">{item.description}</div>
//                   </div>
//                   {isActive && (
//                     <ChevronRight className="w-4 h-4 opacity-40" />
//                   )}
//                 </button>
//               );
//             })}
//           </nav>

//           {/* Quick Add Section */}
//           <div className="p-4 border-t border-border bg-card">
//             <Button 
//               onClick={() => onNavigate('add-transaction')}
//               className={cn(
//                 "w-full gap-2 h-10 text-sm font-medium",
//                 "bg-primary text-primary-foreground hover:bg-primary/90",
//                 "shadow-sm"
//               )}
//             >
//               <Plus className="w-4 h-4" />
//               Add Transaction
//             </Button>
//           </div>

//           {/* User Profile */}
//           <div className={cn(
//             "p-4 border-t border-border bg-muted/20",
//             "flex items-center gap-3"
//           )}>
//             <Avatar className="w-8 h-8 ring-2 ring-border">
//               <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
//                 PS
//               </AvatarFallback>
//             </Avatar>
//             <div className="flex-1 min-w-0">
//               <p className="text-sm font-medium text-foreground truncate leading-tight">Priya Sharma</p>
//               <p className="text-xs text-muted-foreground truncate leading-tight">Family Admin</p>
//             </div>
//             <Badge variant="outline" className="text-xs px-2 py-0.5">
//               Pro
//             </Badge>
//           </div>
//         </div>
//       </aside>

//       {/* Main Content */}
//       <div className="lg:pl-72">
//         {/* Header */}
//         <header className={cn(
//           "sticky top-0 z-40 w-full bg-card/95 backdrop-blur",
//           "supports-[backdrop-filter]:bg-card/60 border-b border-border",
//           "shadow-sm"
//         )}>
//           <div className="flex h-14 items-center justify-between px-4 lg:px-6">
//             <div className="flex items-center gap-4">
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 className="lg:hidden h-8 w-8 p-0"
//                 onClick={() => setSidebarOpen(true)}
//               >
//                 <Menu className="w-4 h-4" />
//               </Button>
              
//               {/* Breadcrumb */}
//               <div className="hidden md:flex items-center gap-2 text-sm">
//                 <span className="text-muted-foreground">Dashboard</span>
//                 <ChevronRight className="w-3 h-3 text-muted-foreground" />
//                 <span className="font-medium text-foreground">{getPageTitle(currentPage)}</span>
//               </div>
              
//               {/* Global Search */}
//               <div className="relative w-80 hidden lg:block">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
//                 <Input 
//                   placeholder="Search transactions, members..." 
//                   className={cn(
//                     "pl-9 h-9 text-sm bg-background border-border",
//                     "focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-ring"
//                   )}
//                 />
//               </div>
//             </div>

//             <div className="flex items-center gap-2">
//               {/* View Toggle */}
//               <div className={cn(
//                 "hidden sm:flex items-center bg-muted rounded-lg p-1",
//                 "border border-border"
//               )}>
//                 <Button variant="ghost" size="sm" className={cn(
//                   "h-7 px-3 text-xs bg-background shadow-sm border border-border",
//                   "font-medium"
//                 )}>
//                   Personal
//                 </Button>
//                 <Button variant="ghost" size="sm" className={cn(
//                   "h-7 px-3 text-xs text-muted-foreground hover:text-foreground",
//                   "font-medium"
//                 )}>
//                   Family
//                 </Button>
//               </div>

//               {/* Search Button for Mobile */}
//               <Button variant="ghost" size="sm" className="lg:hidden h-8 w-8 p-0">
//                 <Search className="w-4 h-4" />
//               </Button>

//               {/* Notifications */}
//               <Button variant="ghost" size="sm" className="relative h-8 w-8 p-0">
//                 <Bell className="w-4 h-4" />
//                 <div className={cn(
//                   "absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full",
//                   "ring-2 ring-background"
//                 )}></div>
//               </Button>

//               {/* Profile Dropdown */}
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                   <Button variant="ghost" size="sm" className="flex items-center gap-2 h-8 px-2">
//                     <Avatar className="w-6 h-6">
//                       <AvatarFallback className="bg-primary text-primary-foreground text-xs">
//                         PS
//                       </AvatarFallback>
//                     </Avatar>
//                     <span className="hidden md:block text-sm font-medium">Priya</span>
//                     <ChevronRight className="w-3 h-3 rotate-90 text-muted-foreground" />
//                   </Button>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent align="end" className={cn(
//                   "w-56 bg-popover text-popover-foreground border border-border shadow-md rounded-md",
//                   "z-50"
//                 )}>
//                   <div className="px-3 py-2">
//                     <div className="flex items-center gap-2">
//                       <Avatar className="w-8 h-8">
//                         <AvatarFallback className="bg-primary text-primary-foreground text-xs">
//                           PS
//                         </AvatarFallback>
//                       </Avatar>
//                       <div className="flex-1">
//                         <p className="text-sm font-medium leading-tight">Priya Sharma</p>
//                         <p className="text-xs text-muted-foreground leading-tight">priya.sharma@example.com</p>
//                       </div>
//                     </div>
//                   </div>
//                   <DropdownMenuSeparator />
//                   <DropdownMenuItem 
//                     onClick={() => handleProfileMenuAction('account')}
//                     className="cursor-pointer text-sm font-normal"
//                   >
//                     <UserCircle className="w-4 h-4 mr-2" />
//                     Account Settings
//                   </DropdownMenuItem>
//                   <DropdownMenuSeparator />
//                   <DropdownMenuItem 
//                     onClick={() => handleProfileMenuAction('logout')}
//                     className="cursor-pointer text-destructive focus:text-destructive text-sm font-normal"
//                   >
//                     <LogOut className="w-4 h-4 mr-2" />
//                     Sign Out
//                   </DropdownMenuItem>
//                 </DropdownMenuContent>
//               </DropdownMenu>
//             </div>
//           </div>
//         </header>

//         {/* Page Content */}
//         <main className="flex-1 p-4 lg:p-6">
//           <div className="max-w-7xl mx-auto">
//             {children}
//           </div>
//         </main>
//       </div>

//       {/* Mobile Overlay */}
//       {sidebarOpen && (
//         <div 
//           className={cn(
//             "fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden",
//             "transition-opacity duration-300"
//           )}
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}
//     </div>
//   );
// }