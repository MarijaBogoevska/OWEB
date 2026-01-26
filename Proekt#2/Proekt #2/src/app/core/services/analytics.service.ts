import { Injectable } from '@angular/core';
import { Expense } from '../models/expense.model';
import { Category } from '../models/category.model';

export interface BudgetStatus {
  categoryId: string;
  categoryName: string;
  color: string;
  spent: number;
  budget: number | undefined;
  percent: number;
  status: 'ok' | 'warn' | 'over';
}

export interface DailyTotal {
  date: string;
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  totalSpent(expenses: Expense[], month: string): number {
    return expenses
      .filter(e => e.date.startsWith(month))
      .reduce((sum, e) => sum + e.amount, 0);
  }

  totalSpentByCategory(expenses: Expense[], month: string): Map<string, number> {
    const totals = new Map<string, number>();
    expenses
      .filter(e => e.date.startsWith(month))
      .forEach(e => {
        const current = totals.get(e.categoryId) || 0;
        totals.set(e.categoryId, current + e.amount);
      });
    return totals;
  }

  dailyTotals(expenses: Expense[], startDate: string, endDate: string): DailyTotal[] {
    const dailyMap = new Map<string, number>();
    
    expenses
      .filter(e => e.date >= startDate && e.date <= endDate)
      .forEach(e => {
        const current = dailyMap.get(e.date) || 0;
        dailyMap.set(e.date, current + e.amount);
      });

    return Array.from(dailyMap.entries())
      .map(([date, total]) => ({ date, total }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  compareMonthToPrevious(expenses: Expense[], month: string): number {
    const currentTotal = this.totalSpent(expenses, month);
    const [year, monthNum] = month.split('-').map(Number);
    const prevMonth = new Date(year, monthNum - 2, 1);
    const prevMonthStr = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}`;
    const prevTotal = this.totalSpent(expenses, prevMonthStr);

    if (prevTotal === 0) return 0;
    return ((currentTotal - prevTotal) / prevTotal) * 100;
  }

  budgetUsage(expenses: Expense[], categories: Category[], month: string): BudgetStatus[] {
    const spentByCategory = this.totalSpentByCategory(expenses, month);
    
    return categories
      .filter(c => spentByCategory.has(c.id) || c.monthlyBudget)
      .map(c => {
        const spent = spentByCategory.get(c.id) || 0;
        const budget = c.monthlyBudget;
        let percent = 0;
        let status: 'ok' | 'warn' | 'over' = 'ok';

        if (budget && budget > 0) {
          percent = (spent / budget) * 100;
          if (percent >= 100) {
            status = 'over';
          } else if (percent >= 80) {
            status = 'warn';
          }
        }

        return {
          categoryId: c.id,
          categoryName: c.name,
          color: c.color,
          spent,
          budget,
          percent,
          status
        };
      })
      .sort((a, b) => b.spent - a.spent);
  }

  getBiggestCategory(expenses: Expense[], categories: Category[], month: string): string {
    const spentByCategory = this.totalSpentByCategory(expenses, month);
    if (spentByCategory.size === 0) return 'N/A';

    let maxCategoryId = '';
    let maxAmount = 0;

    spentByCategory.forEach((amount, categoryId) => {
      if (amount > maxAmount) {
        maxAmount = amount;
        maxCategoryId = categoryId;
      }
    });

    const category = categories.find(c => c.id === maxCategoryId);
    return category ? category.name : 'N/A';
  }

  getAveragePerDay(expenses: Expense[], month: string): number {
    const total = this.totalSpent(expenses, month);
    const now = new Date();
    const [year, monthNum] = month.split('-').map(Number);
    const isCurrentMonth = now.getFullYear() === year && (now.getMonth() + 1) === monthNum;
    
    const daysElapsed = isCurrentMonth 
      ? now.getDate() 
      : new Date(year, monthNum, 0).getDate();

    return daysElapsed > 0 ? total / daysElapsed : 0;
  }
}
