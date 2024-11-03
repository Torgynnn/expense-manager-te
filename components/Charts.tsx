import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp } from 'lucide-react';
import { Expense, MonthlyData, CategoryDistribution } from '@/lib/types';
import { CHART_COLORS } from '@/lib/constants';
import { getMonthlyData, getCategoryDistribution, getSavingsRate } from '@/lib/utils';

interface ChartsProps {
  expenses: Expense[];
}

export const Charts: React.FC<ChartsProps> = ({ expenses }) => {
  const monthlyData = getMonthlyData(expenses);
  const categoryData = getCategoryDistribution(expenses);
  const savingsData = getSavingsRate(monthlyData);

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Financial Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="trends" className="space-y-4">
          <TabsList>
            <TabsTrigger value="trends">Monthly Trends</TabsTrigger>
            <TabsTrigger value="categories">Category Distribution</TabsTrigger>
            <TabsTrigger value="savings">Savings Analysis</TabsTrigger>
            <TabsTrigger value="stacked">Stacked Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="trends">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="expenses" stroke="#ff4444" name="Expenses" />
                <Line type="monotone" dataKey="income" stroke="#44aa44" name="Income" />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="categories">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ category, percentage }) => `${category} (${percentage}%)`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={entry.category} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₸${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip formatter={(value) => `₸${value.toLocaleString()}`} />
                  <Bar dataKey="amount" fill="#8884d8">
                    {categoryData.map((entry, index) => (
                      <Cell key={entry.category} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="savings">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="savings" 
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  name="Monthly Savings"
                />
              </AreaChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="text-lg font-semibold text-green-700">Average Monthly Savings</h3>
                <p className="text-2xl font-bold text-green-800">
                  ₸{(monthlyData.reduce((acc, month) => acc + month.savings, 0) / 
                    Math.max(monthlyData.length, 1)).toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-700">Highest Savings</h3>
                <p className="text-2xl font-bold text-blue-800">
                  ₸{Math.max(...monthlyData.map(m => m.savings)).toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-700">Average Savings Rate</h3>
                <p className="text-2xl font-bold text-purple-800">
                  {(savingsData.reduce((acc, month) => acc + parseFloat(month.savingsRate), 0) / 
                    Math.max(savingsData.length, 1)).toFixed(1)}%
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="stacked">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="income" stackId="a" fill="#44aa44" name="Income" />
                <Bar dataKey="expenses" stackId="a" fill="#ff4444" name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};