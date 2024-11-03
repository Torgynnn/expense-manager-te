export interface Expense {
  id: string;
  amount: number;
  category: string;
  date: string;
  type: 'income' | 'expense';
  description?: string;
}

export interface ImportStatus {
  show: boolean;
  success: boolean;
  message: string;
}

export interface NewExpense {
  amount: string;
  category: string;
  date: string;
}

export interface MonthlyData {
  month: string;
  expenses: number;
  income: number;
  savings: number;
  categories: {
    [key: string]: number;
  };
}

export interface CategoryDistribution {
  category: string;
  amount: number;
  percentage: string;
}

export interface ForecastDetails {
  average: number;
  trend: number;
  lastThreeMonths: MonthlyData[];
}

export interface Forecast {
  amount: number;
  confidence: number;
  details: ForecastDetails;
}