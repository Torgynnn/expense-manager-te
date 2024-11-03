"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BadgeDollarSign, TrendingUp, Wallet, Upload, Table } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Charts } from './Charts';
import { CATEGORIES, CHART_COLORS } from '@/lib/constants';
import { getMonthlyData, parseKaspiData } from '@/lib/utils';
import type { Expense, ImportStatus, NewExpense, Forecast } from '@/lib/types';
import { AiManager } from './AiManager';
import { EnterpriseManager } from './EnterpriseFeatures';
import { Calendar } from 'lucide-react';
import { 
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow, } from './ui/table';
import { Badge } from './ui/badge';


const ExpenseManager = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);const [editExpense, setEditExpense] = useState<NewExpense>({ 
  amount: '', 
  category: '', 
  date: '' 
});
  const [documents, setDocuments] = useState<{
    id: string;
    month: string;
    expenses: Expense[];
  }[]>([]);
  const [isEnterprise, setIsEnterprise] = useState(false);
  const [newExpense, setNewExpense] = useState<NewExpense>({ 
    amount: '', 
    category: '', 
    date: '' 
  });
  const [isPremium, setIsPremium] = useState(false);
  const [importStatus, setImportStatus] = useState<ImportStatus>({ 
    show: false, 
    success: false, 
    message: '' 
  });
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [monthlyData, setMonthlyData] = useState<Record<string, Expense[]>>({});
const [selectedMonth, setSelectedMonth] = useState('');

const handleImportClick = () => {
  fileInputRef.current?.click();
};

const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    const text = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });

    const parsedExpenses = parseKaspiData(text);

    if (parsedExpenses.length > 0) {
      const monthKey = parsedExpenses[0].date.substring(0, 7);
      const monthName = new Date(monthKey + '-01').toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      });

      setDocuments(prevDocuments => {
        const existingDocIndex = prevDocuments.findIndex(doc => {
          const [docMonth, docYear] = doc.month.split(' ');
          const docDate = new Date(`${docMonth} 1, ${docYear}`);
          const importDate = new Date(monthKey + '-01');
          return docDate.getMonth() === importDate.getMonth() && 
                 docDate.getFullYear() === importDate.getFullYear();
        });

        if (existingDocIndex >= 0) {
          // Combine with existing expenses
          const updatedDocuments = [...prevDocuments];
          const combinedExpenses = [
            ...updatedDocuments[existingDocIndex].expenses,
            ...parsedExpenses
          ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

          updatedDocuments[existingDocIndex] = {
            ...updatedDocuments[existingDocIndex],
            expenses: combinedExpenses
          };
          return updatedDocuments;
        } else {
          // Create new document
          return [...prevDocuments, {
            id: Math.random().toString(36).substr(2, 9),
            month: monthName,
            expenses: parsedExpenses
          }].sort((a, b) => {
            const [aMonth, aYear] = a.month.split(' ');
            const [bMonth, bYear] = b.month.split(' ');
            const dateA = new Date(`${aMonth} 1, ${aYear}`);
            const dateB = new Date(`${bMonth} 1, ${bYear}`);
            return dateB.getTime() - dateA.getTime();
          });
        }
      });

      // Update main expenses array
      setExpenses(prev => [...prev, ...parsedExpenses]);
      setImportStatus({
        show: true,
        success: true,
        message: `Successfully imported transactions for ${monthName}`
      });
    }
  } catch (error) {
    console.error('File upload error:', error);
    setImportStatus({
      show: true,
      success: false,
      message: 'Error reading file. Please make sure this is a text file from Kaspi.kz'
    });
  }

  if (fileInputRef.current) {
    fileInputRef.current.value = '';
  }
};
  
const addExpense = () => {
  if (!newExpense.amount || !newExpense.category || !newExpense.date) {
    setImportStatus({
      show: true,
      success: false,
      message: 'Please fill in all fields'
    });
    return;
  }

  const amount = parseFloat(newExpense.amount);
  if (isNaN(amount) || amount <= 0) {
    setImportStatus({
      show: true,
      success: false,
      message: 'Please enter a valid amount'
    });
    return;
  }

  // Create the new expense object
  const newExpenseItem = {
    id: `${newExpense.date}-${Math.random().toString(36).substr(2, 9)}`,
    ...newExpense,
    amount,
    type: 'expense',
  };

  // Get the month from the date
  const expenseDate = new Date(newExpense.date);
  const expenseMonthKey = expenseDate.toLocaleString('en-US', { 
    month: 'long',
    year: 'numeric'
  });

  // Update documents state
  setDocuments(prevDocuments => {
    // Find if we have a document for this month
    const existingDocIndex = prevDocuments.findIndex(doc => {
      const [monthName, yearStr] = doc.month.split(' ');
      const docMonth = new Date(`${monthName} 1, ${yearStr}`).getMonth();
      const docYear = parseInt(yearStr);
      
      return docMonth === expenseDate.getMonth() && 
             docYear === expenseDate.getFullYear();
    });

    if (existingDocIndex >= 0) {
      // Add to existing month
      const updatedDocuments = [...prevDocuments];
      updatedDocuments[existingDocIndex] = {
        ...updatedDocuments[existingDocIndex],
        expenses: [
          ...updatedDocuments[existingDocIndex].expenses,
          newExpenseItem
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      };
      return updatedDocuments;
    } else {
      // Create new month document
      return [...prevDocuments, {
        id: Math.random().toString(36).substr(2, 9),
        month: expenseMonthKey,
        expenses: [newExpenseItem]
      }].sort((a, b) => {
        const [aMonth, aYear] = a.month.split(' ');
        const [bMonth, bYear] = b.month.split(' ');
        const dateA = new Date(`${aMonth} 1, ${aYear}`);
        const dateB = new Date(`${bMonth} 1, ${bYear}`);
        return dateB.getTime() - dateA.getTime();
      });
    }
  });

  setExpenses(prev => [...prev, newExpenseItem]);

  setNewExpense({ amount: '', category: '', date: '' });
  setImportStatus({
    show: true,
    success: true,
    message: `Expense added successfully to ${expenseMonthKey}`
  });
};
const getCategoryTotal = (category: string, expenses: Expense[]): number => {
  return expenses
    .filter(exp => exp.category === category && exp.type === 'expense')
    .reduce((sum, exp) => sum + exp.amount, 0);
};

const getDocumentTotals = (expenses: Expense[]) => {
  return expenses.reduce(
    (acc, exp) => {
      if (exp.type === 'expense') {
        acc.totalExpenses += exp.amount;
      } else {
        acc.totalIncome += exp.amount;
      }
      return acc;
    },
    { totalExpenses: 0, totalIncome: 0 }
  );
};

const calculateTotals = (expenses: Expense[]) => {
  return expenses.reduce(
    (acc, exp) => {
      if (exp.type === 'expense') {
        acc.totalExpenses += exp.amount;
      } else {
        acc.totalIncome += exp.amount;
      }
      return acc;
    },
    { totalExpenses: 0, totalIncome: 0 }
  );
};

  const calculateForecast = () => {
    const monthlyData = getMonthlyData(expenses);
    if (monthlyData.length >= 3) {
      const lastThreeMonths = monthlyData.slice(-3);
      const average = lastThreeMonths.reduce((sum, month) => sum + month.expenses, 0) / 3;
      const trend = (lastThreeMonths[2].expenses - lastThreeMonths[0].expenses) / 2;
      
      const forecastAmount = Math.max(0, average + trend);
      
      setForecast({
        amount: forecastAmount,
        confidence: calculateConfidence(lastThreeMonths),
        details: {
          average,
          trend,
          lastThreeMonths
        }
      });
    } else {
      setForecast(null);
    }
  };

  const calculateConfidence = (months: any[]): number => {
    if (!months || months.length < 3) return 0;
    
    const variance = Math.abs(
      (months[2].expenses - months[1].expenses) - 
      (months[1].expenses - months[0].expenses)
    );
    const maxVariance = Math.max(months[0].expenses, 0.01); // Prevent division by zero
    const confidence = Math.max(0, Math.min(100, 100 - (variance / maxVariance * 100)));
    return Math.round(confidence);
  };

  useEffect(() => {
    if (isPremium) {
      calculateForecast();
    }
  }, [expenses, isPremium]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (importStatus.show) {
      timer = setTimeout(() => {
        setImportStatus(prev => ({ ...prev, show: false }));
      }, 5000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [importStatus.show]);

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold">Expense Manager</h1>
        <div className="flex gap-4">
  <Input 
    type="file"
    ref={fileInputRef}
    className="hidden"
    accept=".txt"
    onChange={handleFileUpload}
  />
  <Button 
    onClick={handleImportClick}
    variant="outline" 
    className="flex gap-2"
  >
    <Upload className="h-4 w-4" />
    Import Kaspi.kz Data
  </Button>
  <Button 
    onClick={() => {
      if (!isPremium) {
        setIsPremium(true);
      } else if (!isEnterprise) {
        setIsEnterprise(true);
      }
    }}
    variant={isEnterprise ? "default" : isPremium ? "secondary" : "outline"}
  >
    {isEnterprise ? "Enterprise Active" : isPremium ? "Upgrade to Enterprise" : "Upgrade to Premium"}
  </Button>
</div>
      </div>

      {/* Status Alert */}
      {importStatus.show && (
        <Alert variant={importStatus.success ? "default" : "destructive"}>
          <AlertDescription>
            {importStatus.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Add New Expense */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Expense</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              type="number"
              placeholder="Amount"
              value={newExpense.amount}
              onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
              className="w-full sm:w-32"
              min="0"
              step="0.01"
            />
            <Select 
              value={newExpense.category}
              onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={newExpense.date}
              onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
              className="w-full sm:w-auto"
            />
            <Button onClick={addExpense} className="w-full sm:w-auto">Add Expense</Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
<div className="grid grid-cols-1 gap-6">
  {/* Category Summaries */}
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
    {documents.map((doc) => (
      <Card key={doc.id}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Category Summary - {doc.month}
          </CardTitle>
        </CardHeader>
        <CardContent>
        <div className="space-y-2">
  {CATEGORIES
    .filter(category => getCategoryTotal(category, doc.expenses) > 0)
    .sort((a, b) => getCategoryTotal(b, doc.expenses) - getCategoryTotal(a, doc.expenses))
    .map(category => (
      <div key={category} className="flex justify-between items-center p-2 bg-gray-50 rounded">
        <span className="font-medium">{category}</span>
        <span className="font-bold">₸{getCategoryTotal(category, doc.expenses).toLocaleString()}</span>
      </div>
    ))}
</div>
          {/* In the Category Summary card */}
<div className="mt-4 pt-4 border-t">
  <div className="flex justify-between items-center text-sm text-muted-foreground">
    <span>Total Expenses:</span>
    <span className="font-bold text-foreground">
      ₸{doc.expenses
        .filter(e => e.type === 'expense')
        .reduce((sum, e) => sum + e.amount, 0)
        .toLocaleString()}
    </span>
  </div>
  {/* Add income total if needed */}
  <div className="flex justify-between items-center text-sm text-muted-foreground mt-2">
    <span>Total Income:</span>
    <span className="font-bold text-green-600">
      ₸{doc.expenses
        .filter(e => e.type === 'income')
        .reduce((sum, e) => sum + e.amount, 0)
        .toLocaleString()}
    </span>
  </div>
</div>
        </CardContent>
      </Card>
    ))}
  </div>

  {/* Charts Component */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <Charts expenses={expenses} />
  </div>
</div>

      {/* Premium Forecast */}
      {isPremium && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BadgeDollarSign className="h-5 w-5" />
              Premium Feature: Next Month Forecast
            </CardTitle>
          </CardHeader>
          <CardContent>
            {forecast ? (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-lg text-gray-600">Forecasted Expenses for Next Month</p>
                  <p className="text-3xl font-bold text-primary">₸{forecast.amount.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Forecast Confidence: {forecast.confidence}%
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-500">Average Monthly Expense</p>
                    <p className="font-bold">₸{forecast.details.average.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-500">Monthly Trend</p>
                    <p className={`font-bold ${forecast.details.trend >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {forecast.details.trend >= 0 ? '+' : ''}
                      ₸{forecast.details.trend.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <h3 className="font-semibold text-lg">Last 3 Months</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {forecast.details.lastThreeMonths.map((month, index) => (
                      <div key={month.month} className="p-3 bg-gray-50 rounded">
                        <p className="text-sm text-gray-500">{month.month}</p>
                        <p className="font-bold">₸{month.expenses.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-sm text-gray-500 mt-4 p-4 bg-gray-50 rounded">
                  <h4 className="font-semibold mb-2">How this forecast works:</h4>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Based on your spending patterns from the last three months</li>
                    <li>Takes into account both average spending and monthly trends</li>
                    <li>Confidence score reflects the stability of your spending patterns</li>
                    <li>Higher confidence means more predictable spending habits</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-500">
                  <p className="text-lg font-medium mb-2">Not Enough Data</p>
                  <p className="text-sm">Add expenses for at least three months to see your forecast.</p>
                  <p className="text-sm mt-4 max-w-md mx-auto">
                    The forecast uses your historical spending patterns to predict future expenses and help you plan better.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

{Object.entries(monthlyData)
  .sort(([a], [b]) => b.localeCompare(a)) // Sort months in descending order
  .map(([month, transactions]) => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const monthName = new Date(month + '-01').toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });

    return (
      <Card key={month} className="col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {monthName} Statement
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="text-muted-foreground">Income:</span>{' '}
                <span className="font-medium text-green-600">₸{totalIncome.toLocaleString()}</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Expenses:</span>{' '}
                <span className="font-medium text-red-600">₸{totalExpenses.toLocaleString()}</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Balance:</span>{' '}
                <span className={`font-medium ${totalIncome - totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₸{(totalIncome - totalExpenses).toLocaleString()}
                </span>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {new Date(transaction.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {transaction.category}
                        </Badge>
                      </TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell className="text-right">
                        <span className={
                          transaction.type === 'income' 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }>
                          {transaction.type === 'income' ? '+' : '-'}
                          ₸{transaction.amount.toLocaleString()}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  })}

      <AiManager 
  expenses={expenses} 
  isPremium={isPremium}/>
  {isEnterprise && (
  <EnterpriseManager 
    expenses={expenses}
    isEnterprise={isEnterprise}
  />
)}
    </div>
  );
};

export default ExpenseManager;