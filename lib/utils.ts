import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Expense, MonthlyData, CategoryDistribution } from './types';
import { KASPI_CATEGORIES } from './constants';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const parseKaspiData = (text: string): Expense[] => {
  try {
    // Split into lines and find where transactions start
    const lines = text.split('\n');
    const transactionsStartIndex = lines.findIndex(line => 
      line.trim().includes('Дата') && 
      line.includes('Сумма') && 
      line.includes('Операция') && 
      line.includes('Детали')
    );

    if (transactionsStartIndex === -1) return [];

    // Only process lines after the header
    const transactionLines = lines.slice(transactionsStartIndex + 1);
    const parsedExpenses: Expense[] = [];

    transactionLines.forEach(line => {
      const dateMatch = line.match(/(\d{2}\.\d{2}\.\d{2})/);
      const amountMatch = line.match(/([+-]?\s*[\d\s]+,\d{2})\s*₸/);
      
      if (dateMatch && amountMatch) {
        const date = dateMatch[1];
        const amountStr = amountMatch[1];
        const description = line.split('₸')[1]?.trim() || '';

        if (date && amountStr && description) {
          const [day, month, year] = date.split('.');
          const formattedDate = `20${year}-${month}-${day}`;
          
          // Parse amount correctly
          const amount = parseFloat(
            amountStr
              .replace(/\s+/g, '') // Remove spaces
              .replace(',', '.') // Replace comma with decimal point
          );

          // Determine if it's income based on the operation type
          const isIncome = line.includes('Пополнение');
          
          // Determine category
          let category = 'Other';
          for (const [key, value] of Object.entries(KASPI_CATEGORIES)) {
            if (description.toUpperCase().includes(key.toUpperCase())) {
              category = value;
              break;
            }
          }

          if (!isNaN(amount) && description !== '') {
            parsedExpenses.push({
              id: `${formattedDate}-${Math.random().toString(36).substr(2, 9)}`,
              date: formattedDate,
              amount: Math.abs(amount),
              type: isIncome ? 'income' : 'expense',
              category,
              description
            });
          }
        }
      }
    });

    return parsedExpenses;
  } catch (error) {
    console.error('Parsing error:', error);
    return [];
  }
};
export const getMonthlyData = (expenses: Expense[]): MonthlyData[] => {
  const monthlyData: Record<string, MonthlyData> = {};
  
  expenses.forEach(expense => {
    const monthYear = expense.date.substring(0, 7);
    if (!monthlyData[monthYear]) {
      monthlyData[monthYear] = {
        month: monthYear,
        expenses: 0,
        income: 0,
        savings: 0,
        categories: {}
      };
    }
    
    if (expense.type === 'expense') {
      monthlyData[monthYear].expenses += expense.amount;
      if (!monthlyData[monthYear].categories[expense.category]) {
        monthlyData[monthYear].categories[expense.category] = 0;
      }
      monthlyData[monthYear].categories[expense.category] += expense.amount;
    } else {
      monthlyData[monthYear].income += expense.amount;
    }
    
    monthlyData[monthYear].savings = 
      monthlyData[monthYear].income - monthlyData[monthYear].expenses;
  });

  return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
};

export const getCategoryDistribution = (expenses: Expense[]): CategoryDistribution[] => {
  const distribution: Record<string, number> = {};
  const totalExpenses = expenses.reduce((sum, exp) => 
    exp.type === 'expense' ? sum + exp.amount : sum, 0);

  expenses.forEach(expense => {
    if (expense.type === 'expense') {
      if (!distribution[expense.category]) {
        distribution[expense.category] = 0;
      }
      distribution[expense.category] += expense.amount;
    }
  });

  return Object.entries(distribution)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: ((amount / totalExpenses) * 100).toFixed(1)
    }))
    .sort((a, b) => b.amount - a.amount);
};

export const getSavingsRate = (monthlyData: MonthlyData[]): Array<{ month: string; savingsRate: string }> => {
  return monthlyData.map(month => ({
    month: month.month,
    savingsRate: month.income > 0 
      ? ((month.income - month.expenses) / month.income * 100).toFixed(1)
      : '0'
  }));
};