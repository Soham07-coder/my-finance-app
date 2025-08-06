// import React from 'react';
// import { Users, UserPlus, Crown, Mail } from 'lucide-react';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
// import { Button } from './ui/button';
// import { Avatar, AvatarFallback } from './ui/avatar';
// import { Badge } from './ui/badge';
// import { formatCurrency } from '../lib/utils';

// const familyMembers = [
//   {
//     id: '1',
//     name: 'Priya Sharma',
//     email: 'priya.sharma@example.com',
//     role: 'admin' as const,
//     joinedAt: new Date('2023-01-15'),
//     monthlySpending: 15000,
//     status: 'active'
//   },
//   {
//     id: '2',
//     name: 'Rajesh Sharma',
//     email: 'rajesh.sharma@example.com',
//     role: 'member' as const,
//     joinedAt: new Date('2023-01-15'),
//     monthlySpending: 12000,
//     status: 'active'
//   },
//   {
//     id: '3',
//     name: 'Aarav Sharma',
//     email: 'aarav.sharma@example.com',
//     role: 'member' as const,
//     joinedAt: new Date('2023-02-01'),
//     monthlySpending: 5000,
//     status: 'active'
//   }
// ];

// export function MyFamilyPage() {
//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div>
//           <h1 className="text-2xl font-semibold text-foreground">My Family</h1>
//           <p className="text-muted-foreground">
//             Manage your family members and their financial access
//           </p>
//         </div>
//         <Button className="gap-2 w-fit">
//           <UserPlus className="w-4 h-4" />
//           Invite Member
//         </Button>
//       </div>

//       {/* Family Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <Card>
//           <CardContent className="p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-muted-foreground">Total Members</p>
//                 <p className="text-2xl font-bold text-foreground">{familyMembers.length}</p>
//               </div>
//               <div className="p-2 bg-blue-100 rounded-lg">
//                 <Users className="w-5 h-5 text-blue-600" />
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardContent className="p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-muted-foreground">Family ID</p>
//                 <p className="text-lg font-mono text-foreground">FAM-2024-001</p>
//               </div>
//               <Button variant="outline" size="sm">
//                 Copy
//               </Button>
//             </div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardContent className="p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-muted-foreground">Total Spending</p>
//                 <p className="text-2xl font-bold text-foreground">
//                   {formatCurrency(familyMembers.reduce((sum, member) => sum + member.monthlySpending, 0))}
//                 </p>
//               </div>
//               <div className="p-2 bg-red-100 rounded-lg">
//                 <Crown className="w-5 h-5 text-red-600" />
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Family Members */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Family Members</CardTitle>
//           <CardDescription>
//             Manage roles and permissions for your family members
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-4">
//             {familyMembers.map((member) => (
//               <div
//                 key={member.id}
//                 className="flex items-center justify-between p-4 rounded-lg border border-border"
//               >
//                 <div className="flex items-center gap-4">
//                   <Avatar className="w-10 h-10">
//                     <AvatarFallback>
//                       {member.name.split(' ').map(n => n[0]).join('')}
//                     </AvatarFallback>
//                   </Avatar>
//                   <div>
//                     <div className="flex items-center gap-2">
//                       <h4 className="font-medium text-foreground">{member.name}</h4>
//                       {member.role === 'admin' && (
//                         <Crown className="w-4 h-4 text-yellow-600" />
//                       )}
//                     </div>
//                     <div className="flex items-center gap-2 mt-1">
//                       <Mail className="w-3 h-3 text-muted-foreground" />
//                       <span className="text-sm text-muted-foreground">{member.email}</span>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="text-right">
//                   <div className="flex items-center gap-2 mb-1">
//                     <Badge variant={member.role === 'admin' ? 'default' : 'outline'}>
//                       {member.role === 'admin' ? 'Admin' : 'Member'}
//                     </Badge>
//                     <Badge variant="outline" className="text-green-600">
//                       Active
//                     </Badge>
//                   </div>
//                   <p className="text-sm text-muted-foreground">
//                     {formatCurrency(member.monthlySpending)} this month
//                   </p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }