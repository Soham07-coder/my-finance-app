import React from 'react';
import { TrendingUp, PieChart, BarChart3, Calendar, Target, DollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.jsx';
import { cn } from '../lib/utils.js';

const upcomingFeatures = [
    {
        icon: PieChart,
        title: 'Spending by Category',
        description: 'Visual breakdown of expenses across different categories',
        color: 'from-blue-500 to-indigo-500'
    },
    {
        icon: TrendingUp,
        title: 'Monthly Trends',
        description: 'Track your financial patterns over time',
        color: 'from-emerald-500 to-green-500'
    },
    {
        icon: Calendar,
        title: 'Budget vs Actual',
        description: 'Compare planned budgets with actual spending',
        color: 'from-purple-500 to-pink-500'
    },
    {
        icon: Target,
        title: 'Savings Goals',
        description: 'Monitor progress towards your financial objectives',
        color: 'from-orange-500 to-red-500'
    },
    {
        icon: BarChart3,
        title: 'Family Insights',
        description: 'Analyze spending patterns across family members',
        color: 'from-teal-500 to-cyan-500'
    },
    {
        icon: DollarSign,
        title: 'Cash Flow Analysis',
        description: 'Understand your income and expense flows',
        color: 'from-amber-500 to-yellow-500'
    }
];

export function AnalyticsPage({ viewMode = 'family' }) {
    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="space-y-2">
                <h1 style={{ fontSize: '28px', fontWeight: '700', lineHeight: '1.2' }} className="text-foreground">
                    Analytics
                </h1>
                <p style={{ fontSize: '14px', lineHeight: '1.5' }} className="text-muted-foreground">
                    Powerful insights and trends for your {viewMode} finances coming soon
                </p>
            </div>

            {/* Coming Soon Banner */}
            <Card className={cn(
                "relative overflow-hidden border-0",
                "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50",
                "dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20"
            )}>
                <CardContent className="p-8 text-center">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                        <BarChart3 className="w-8 h-8 text-white" />
                    </div>
                    
                    <h2 style={{ fontSize: '24px', fontWeight: '700', lineHeight: '1.3' }} className="text-foreground mb-3">
                        Advanced Analytics Coming Soon
                    </h2>
                    
                    <p style={{ fontSize: '14px', lineHeight: '1.5' }} className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                        We're building powerful analytics features to help you understand your spending patterns, 
                        track financial trends, and make smarter money decisions for your family.
                    </p>
                    
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span style={{ fontSize: '12px', fontWeight: '500' }} className="text-blue-700 dark:text-blue-300">
                            In Development
                        </span>
                    </div>
                </CardContent>
                
                {/* Background decoration */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-200/20 dark:bg-blue-800/20 rounded-full"></div>
                <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-purple-200/20 dark:bg-purple-800/20 rounded-full"></div>
            </Card>

            {/* Feature Preview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingFeatures.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                        <Card 
                            key={feature.title}
                            className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-0 bg-card/50"
                            style={{ 
                                animationDelay: `${index * 100}ms`,
                                animation: 'fadeIn 0.6s ease-out forwards'
                            }}
                        >
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className={cn(
                                        "p-3 rounded-xl bg-gradient-to-br shadow-md",
                                        feature.color
                                    )}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    
                                    <div className="flex-1 space-y-2">
                                        <h3 style={{ fontSize: '14px', fontWeight: '600', lineHeight: '1.3' }} className="text-foreground">
                                            {feature.title}
                                        </h3>
                                        <p style={{ fontSize: '12px', lineHeight: '1.5' }} className="text-muted-foreground">
                                            {feature.description}
                                        </p>
                                        
                                        <div className="flex items-center gap-2 pt-2">
                                            <div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-pulse"></div>
                                            <span style={{ fontSize: '11px' }} className="text-muted-foreground">
                                                Coming soon
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Newsletter Signup */}
            <Card className="border-2 border-dashed border-border hover:border-primary/50 transition-colors duration-300">
                <CardContent className="p-6 text-center">
                    <h3 style={{ fontSize: '16px', fontWeight: '600', lineHeight: '1.3' }} className="text-foreground mb-2">
                        Get Notified When Analytics Launch
                    </h3>
                    <p style={{ fontSize: '12px', lineHeight: '1.5' }} className="text-muted-foreground mb-4">
                        Be the first to know when our powerful analytics features are ready
                    </p>
                    
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <div className="w-2 h-2 bg-muted-foreground/60 rounded-full"></div>
                        <span style={{ fontSize: '11px' }}>Updates coming to your notification center</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}