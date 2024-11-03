import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, Send, Loader2, PiggyBank, Brain, SparkleIcon } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Expense } from '@/lib/types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AiManagerProps {
  expenses: Expense[];
  isPremium: boolean;
  monthlyTarget?: number;
}

export const AiManager: React.FC<AiManagerProps> = ({ 
  expenses, 
  isPremium,
  monthlyTarget 
}) => {
  const [messages, setMessages] = useState<Message[]>([{
    id: '1',
    role: 'assistant',
    content: "Hello! I'm your AI Financial Assistant. I can analyze your expenses, create personalized budgets, and help you reach your financial goals. What would you like to know?",
    timestamp: new Date()
  }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Scroll to bottom when new messages appear
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const analyzeExpenses = () => {
    const totalExpenses = expenses.filter(e => e.type === 'expense')
      .reduce((sum, e) => sum + e.amount, 0);
    const totalIncome = expenses.filter(e => e.type === 'income')
      .reduce((sum, e) => sum + e.amount, 0);
    
    const categoryTotals = expenses.reduce((acc, exp) => {
      if (exp.type === 'expense') {
        acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      }
      return acc;
    }, {} as Record<string, number>);

    const topCategories = Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    const monthlyData = expenses.reduce((acc, exp) => {
      const month = exp.date.substring(0, 7);
      if (!acc[month]) {
        acc[month] = { expenses: 0, income: 0 };
      }
      if (exp.type === 'expense') {
        acc[month].expenses += exp.amount;
      } else {
        acc[month].income += exp.amount;
      }
      return acc;
    }, {} as Record<string, { expenses: number; income: number }>);

    return {
      totalExpenses,
      totalIncome,
      savingsRate: ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1),
      topCategories,
      monthlyData
    };
  };

  const processMessage = async (userMessage: string) => {
    const analysis = analyzeExpenses();
    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
  
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setIsTyping(true);
  
    // Simulate AI response generation
    setTimeout(() => {
      let response = '';
      const lowerMessage = userMessage.toLowerCase();
      
      // Handle different types of queries
      if (lowerMessage.includes('hi') || lowerMessage.includes('hello')) {
        response = `Hello! I'm here to help you manage your finances better. I can:
  - Analyze your spending patterns
  - Suggest ways to save money
  - Create personalized budgets
  - Track your financial goals
  - Provide detailed expense breakdowns
  
  What would you like to know about?`;
      }
      else if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
        response = `I'm your AI Financial Assistant. Here's what I can help you with:
  
  1. 📊 Expense Analysis
     - Breakdown of spending by category
     - Monthly comparisons
     - Trend identification
  
  2. 💰 Savings Advice
     - Personalized saving strategies
     - Areas to reduce spending
     - Goal-based savings plans
  
  3. 📈 Budget Planning
     - Custom budget creation
     - Category-wise allocations
     - Spending limits suggestions
  
  4. 🎯 Financial Goals
     - Goal setting assistance
     - Progress tracking
     - Achievement strategies
  
  What specific area would you like to explore?`;
      }
      else if (lowerMessage.includes('saving') || lowerMessage.includes('save')) {
        const topSpendingCategory = analysis.topCategories[0];
        const potentialSavings = topSpendingCategory[1] * 0.2;
        const monthlyIncome = analysis.totalIncome / Object.keys(analysis.monthlyData).length;
  
        response = `Based on your spending patterns, here's a personalized savings plan:
  
  Current Status:
  - Savings Rate: ${analysis.savingsRate}%
  - Highest Expense: ${topSpendingCategory[0]} (₸${topSpendingCategory[1].toLocaleString()})
  - Monthly Income: ₸${monthlyIncome.toLocaleString()}
  
  Recommendations:
  1. Reduce ${topSpendingCategory[0]} expenses by 20%
     → Potential savings: ₸${potentialSavings.toLocaleString()} per month
     
  2. Set up automatic savings
     → Target: ₸${(monthlyIncome * 0.2).toLocaleString()} monthly
     
  3. Focus Areas for Savings:
     ${analysis.topCategories.slice(0, 3).map(([cat, amt]) => 
       `   • ${cat}: Current ₸${amt.toLocaleString()} → Target ₸${(amt * 0.8).toLocaleString()}`
     ).join('\n')}
  
  Would you like a detailed plan for any of these areas?`;
      }
      else if (lowerMessage.includes('analysis') || lowerMessage.includes('analyze')) {
        const monthlyAvg = analysis.totalExpenses / Object.keys(analysis.monthlyData).length;
        
        response = `Here's a comprehensive analysis of your finances:
  
  Overall Summary:
  - Total Income: ₸${analysis.totalIncome.toLocaleString()}
  - Total Expenses: ₸${analysis.totalExpenses.toLocaleString()}
  - Monthly Average: ₸${monthlyAvg.toLocaleString()}
  - Savings Rate: ${analysis.savingsRate}%
  
  Top Spending Categories:
  ${analysis.topCategories.map(([cat, amount], i) => 
    `${i + 1}. ${cat}
     Amount: ₸${amount.toLocaleString()}
     % of Total: ${((amount/analysis.totalExpenses) * 100).toFixed(1)}%
     Monthly Avg: ₸${(amount/Object.keys(analysis.monthlyData).length).toLocaleString()}`
  ).join('\n\n')}
  
  Would you like to:
  1. See monthly trends
  2. Get category-specific advice
  3. Review saving opportunities
  4. Create a budget plan
  
  Just let me know what interests you!`;
      }
      else if (lowerMessage.includes('budget') || lowerMessage.includes('plan')) {
        const monthlyAvgExpense = analysis.totalExpenses / Object.keys(analysis.monthlyData).length;
        const monthlyAvgIncome = analysis.totalIncome / Object.keys(analysis.monthlyData).length;
        
        response = `I've created a personalized budget plan based on your spending history:
  
  Monthly Income: ₸${monthlyAvgIncome.toLocaleString()}
  Recommended Allocations:
  
  ${analysis.topCategories.map(([cat, amount]) => {
    const monthlyAmount = amount / Object.keys(analysis.monthlyData).length;
    const recommendedAmount = monthlyAmount * 0.9; // 10% reduction target
    return `${cat}:
    • Current: ₸${monthlyAmount.toLocaleString()} (${((monthlyAmount/monthlyAvgExpense) * 100).toFixed(1)}%)
    • Recommended: ₸${recommendedAmount.toLocaleString()}
    • Potential Savings: ₸${(monthlyAmount - recommendedAmount).toLocaleString()}`;
  }).join('\n\n')}
  
  Savings Target: ₸${(monthlyAvgIncome * 0.2).toLocaleString()} (20% of income)
  
  Would you like to:
  1. Adjust these allocations
  2. Get specific category advice
  3. See how to achieve these targets
  4. Create a detailed savings plan`;
      }
      else if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest')) {
        response = `Based on your spending patterns, here are my top recommendations:
  
  1. High-Impact Savings Opportunities:
     ${analysis.topCategories.slice(0, 2).map(([cat, amt]) => 
       `• Optimize ${cat} spending (Current: ₸${amt.toLocaleString()})`
     ).join('\n   ')}
  
  2. Quick Wins:
     • Set up automatic savings transfers
     • Review subscriptions and recurring payments
     • Look for better deals on regular expenses
  
  3. Long-term Strategies:
     • Build an emergency fund
     • Set specific savings goals
     • Track expenses regularly
  
  Would you like me to elaborate on any of these points?`;
      }
      else if (lowerMessage.includes('trend') || lowerMessage.includes('pattern')) {
        const months = Object.entries(analysis.monthlyData)
          .sort(([a], [b]) => a.localeCompare(b));
        
        const trend = months.length >= 2 
          ? ((months[months.length-1][1].expenses - months[0][1].expenses) / months[0][1].expenses * 100)
          : 0;
  
        response = `Here's your spending trend analysis:
  
  Overall Trend: ${trend.toFixed(1)}% ${trend > 0 ? '📈 increase' : '📉 decrease'}
  
  Monthly Breakdown:
  ${months.map(([month, data]) => {
    const spendingRatio = ((data.expenses/data.income) * 100).toFixed(1);
    const icon = parseFloat(spendingRatio) > 80 ? '⚠️' : '✅';
    return `${month}: ${icon}
    • Expenses: ₸${data.expenses.toLocaleString()}
    • Income: ₸${data.income.toLocaleString()}
    • Ratio: ${spendingRatio}%`;
  }).join('\n\n')}
  
  Key Insights:
  - Highest spending: ${months.sort(([,a], [,b]) => b.expenses - a.expenses)[0][0]}
  - Most efficient: ${months.sort(([,a], [,b]) => (a.expenses/a.income) - (b.expenses/b.income))[0][0]}
  - Average monthly expense: ₸${(analysis.totalExpenses / months.length).toLocaleString()}
  
  Would you like to:
  1. See category-specific trends
  2. Get recommendations based on these patterns
  3. Create a plan to optimize spending?`;
      }
      else {
        response = `I understand you're asking about "${userMessage}". I can help you with:
  
  1. 💰 Financial Analysis
     • Expense breakdowns
     • Spending patterns
     • Category analysis
  
  2. 📊 Budgeting & Planning
     • Custom budgets
     • Saving strategies
     • Goal setting
  
  3. 📈 Trends & Insights
     • Monthly comparisons
     • Spending habits
     • Improvement areas
  
  What specific aspect would you like to explore?`;
      }
  
      const aiMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
  
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      processMessage(input.trim());
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          AI Financial Assistant
          {isPremium && <Badge variant="default" className="ml-2">Premium</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Features Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Card>
              <CardContent className="pt-4 flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <span className="text-sm">Smart Analysis</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 flex items-center gap-2">
                <PiggyBank className="h-5 w-5 text-primary" />
                <span className="text-sm">Custom Plans</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 flex items-center gap-2">
                <SparkleIcon className="h-5 w-5 text-primary" />
                <span className="text-sm">Smart Suggestions</span>
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="border rounded-lg">
            <ScrollArea className="h-[400px] p-4" ref={scrollAreaRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === 'assistant' ? 'items-start' : 'items-start flex-row-reverse'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <Avatar>
                        <AvatarFallback>AI</AvatarFallback>
                        <AvatarImage src="/bot-avatar.png" />
                      </Avatar>
                    )}
                    <div
                      className={`rounded-lg px-4 py-2 max-w-[80%] space-y-1 ${
                        message.role === 'assistant' 
                          ? 'bg-secondary' 
                          : 'bg-primary text-primary-foreground'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-line">{message.content}</p>
                      <p className="text-xs opacity-60">
                        {formatTimestamp(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex gap-3 items-center">
                    <Avatar>
                      <AvatarFallback>AI</AvatarFallback>
                      <AvatarImage src="/bot-avatar.png" />
                    </Avatar>
                    <div className="bg-secondary rounded-lg px-4 py-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-4 border-t flex gap-4">
              <Input
                ref={inputRef}
                placeholder="Ask about your finances..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={isTyping}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};