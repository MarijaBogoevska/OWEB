import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatListModule } from '@angular/material/list';
import { RouterLink } from '@angular/router';
import { combineLatest, map, Observable } from 'rxjs';
import { ExpenseService } from '../../core/services/expense.service';
import { CategoryService } from '../../core/services/category.service';
import { AnalyticsService, BudgetStatus } from '../../core/services/analytics.service';
import { Expense } from '../../core/models/expense.model';
import { Category } from '../../core/models/category.model';

interface DashboardData {
  totalSpent: number;
  avgPerDay: number;
  biggestCategory: string;
  comparison: number;
  budgetStatuses: BudgetStatus[];
  recentExpenses: Array<Expense & { categoryName: string; categoryColor: string }>;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatSelectModule,
    MatListModule,
    RouterLink
  ],
  template: `
    <div class="dashboard-container">
      <div class="header">
        <h1>Dashboard</h1>
        <mat-form-field appearance="outline" class="month-selector">
          <mat-label>Month</mat-label>
          <mat-select [(value)]="selectedMonth" (selectionChange)="onMonthChange()">
            <mat-option *ngFor="let month of availableMonths" [value]="month.value">
              {{ month.label }}
            </mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <div class="summary-cards" *ngIf="dashboardData$ | async as data">
        <mat-card class="summary-card">
          <mat-card-header>
            <mat-icon class="card-icon primary">account_balance_wallet</mat-icon>
          </mat-card-header>
          <mat-card-content>
            <div class="card-value">{{ data.totalSpent | number:'1.2-2' }} MKD</div>
            <div class="card-label">Total Spent</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card">
          <mat-card-header>
            <mat-icon class="card-icon accent">calendar_today</mat-icon>
          </mat-card-header>
          <mat-card-content>
            <div class="card-value">{{ data.avgPerDay | number:'1.2-2' }} MKD</div>
            <div class="card-label">Avg per Day</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card">
          <mat-card-header>
            <mat-icon class="card-icon warn">trending_up</mat-icon>
          </mat-card-header>
          <mat-card-content>
            <div class="card-value">{{ data.biggestCategory }}</div>
            <div class="card-label">Biggest Category</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card">
          <mat-card-header>
            <mat-icon class="card-icon" [class.positive]="data.comparison < 0" [class.negative]="data.comparison > 0">
              {{ data.comparison < 0 ? 'arrow_downward' : 'arrow_upward' }}
            </mat-icon>
          </mat-card-header>
          <mat-card-content>
            <div class="card-value">{{ data.comparison > 0 ? '+' : '' }}{{ data.comparison | number:'1.1-1' }}%</div>
            <div class="card-label">vs Last Month</div>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="content-section" *ngIf="dashboardData$ | async as data">
        <mat-card class="budget-card">
          <mat-card-header>
            <mat-card-title>Budget Overview</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div *ngIf="data.budgetStatuses.length === 0" class="empty-state">
              <mat-icon>info</mat-icon>
              <p>No expenses or budgets for this month</p>
            </div>
            <div *ngFor="let budget of data.budgetStatuses" class="budget-item">
              <div class="budget-header">
                <div class="budget-name">
                  <span class="category-dot" [style.background-color]="budget.color"></span>
                  {{ budget.categoryName }}
                </div>
                <div class="budget-amount">
                  <span class="spent">{{ budget.spent | number:'1.2-2' }} MKD</span>
                  <span *ngIf="budget.budget" class="budget-total"> / {{ budget.budget | number:'1.2-2' }} MKD</span>
                </div>
              </div>
              <div *ngIf="budget.budget" class="budget-progress">
                <mat-progress-bar 
                  mode="determinate" 
                  [value]="budget.percent > 100 ? 100 : budget.percent"
                  [color]="budget.status === 'over' ? 'warn' : budget.status === 'warn' ? 'accent' : 'primary'">
                </mat-progress-bar>
                <span class="progress-text" [class.over-budget]="budget.status === 'over'">
                  {{ budget.percent | number:'1.0-0' }}%
                  <span *ngIf="budget.status === 'over'"> - Over budget</span>
                </span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="recent-card">
          <mat-card-header>
            <mat-card-title>Recent Expenses</mat-card-title>
            <button mat-button color="primary" routerLink="/expenses">View All</button>
          </mat-card-header>
          <mat-card-content>
            <div *ngIf="data.recentExpenses.length === 0" class="empty-state">
              <mat-icon>receipt_long</mat-icon>
              <p>No expenses yet</p>
              <button mat-raised-button color="primary" routerLink="/expenses">Add Expense</button>
            </div>
            <mat-list *ngIf="data.recentExpenses.length > 0">
              <mat-list-item *ngFor="let expense of data.recentExpenses">
                <span matListItemIcon class="category-dot" [style.background-color]="expense.categoryColor"></span>
                <div matListItemTitle>{{ expense.title }}</div>
                <div matListItemLine class="expense-meta">
                  {{ expense.categoryName }} · {{ formatDate(expense.date) }}
                </div>
                <span matListItemMeta class="expense-amount">{{ expense.amount | number:'1.2-2' }} MKD</span>
              </mat-list-item>
            </mat-list>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1400px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .header h1 {
      margin: 0;
      font-size: 2rem;
      font-weight: 400;
    }

    .month-selector {
      width: 200px;
    }

    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .summary-card {
      mat-card-header {
        padding: 16px 16px 0;
        margin: 0;
      }

      mat-card-content {
        padding: 8px 16px 16px;
      }
    }

    .card-icon {
      width: 48px;
      height: 48px;
      font-size: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;

      &.primary {
        background-color: #e3f2fd;
        color: #2196f3;
      }

      &.accent {
        background-color: #fce4ec;
        color: #e91e63;
      }

      &.warn {
        background-color: #fff3e0;
        color: #ff9800;
      }

      &.positive {
        background-color: #e8f5e9;
        color: #4caf50;
      }

      &.negative {
        background-color: #ffebee;
        color: #f44336;
      }
    }

    .card-value {
      font-size: 1.75rem;
      font-weight: 500;
      margin: 8px 0 4px;
    }

    .card-label {
      font-size: 0.875rem;
      color: rgba(0, 0, 0, 0.6);
    }

    .content-section {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 24px;
    }

    .budget-card, .recent-card {
      mat-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        mat-card-title {
          margin: 0;
          font-size: 1.25rem;
        }
      }
    }

    .budget-item {
      margin-bottom: 20px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .budget-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .budget-name {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
    }

    .category-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      display: inline-block;
    }

    .budget-amount {
      font-size: 0.875rem;

      .spent {
        font-weight: 500;
      }

      .budget-total {
        color: rgba(0, 0, 0, 0.6);
      }
    }

    .budget-progress {
      display: flex;
      align-items: center;
      gap: 12px;

      mat-progress-bar {
        flex: 1;
      }

      .progress-text {
        font-size: 0.875rem;
        color: rgba(0, 0, 0, 0.6);
        min-width: 80px;
        text-align: right;

        &.over-budget {
          color: #f44336;
          font-weight: 500;
        }
      }
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: rgba(0, 0, 0, 0.6);

      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: rgba(0, 0, 0, 0.3);
        margin-bottom: 8px;
      }

      p {
        margin: 8px 0 16px;
      }
    }

    .expense-meta {
      font-size: 0.875rem;
      color: rgba(0, 0, 0, 0.6);
    }

    .expense-amount {
      font-weight: 500;
      color: #2196f3;
    }

    @media (max-width: 1024px) {
      .content-section {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      .month-selector {
        width: 100%;
      }

      .summary-cards {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  selectedMonth: string;
  availableMonths: Array<{ label: string; value: string }> = [];
  dashboardData$!: Observable<DashboardData>;

  constructor(
    private expenseService: ExpenseService,
    private categoryService: CategoryService,
    private analyticsService: AnalyticsService
  ) {
    const now = new Date();
    this.selectedMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  ngOnInit(): void {
    this.generateAvailableMonths();
    this.loadDashboardData();
  }

  private generateAvailableMonths(): void {
    const months = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      months.push({ label, value });
    }
    this.availableMonths = months;
  }

  onMonthChange(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.dashboardData$ = combineLatest([
      this.expenseService.getAll(),
      this.categoryService.getAll()
    ]).pipe(
      map(([expenses, categories]) => {
        const totalSpent = this.analyticsService.totalSpent(expenses, this.selectedMonth);
        const avgPerDay = this.analyticsService.getAveragePerDay(expenses, this.selectedMonth);
        const biggestCategory = this.analyticsService.getBiggestCategory(expenses, categories, this.selectedMonth);
        const comparison = this.analyticsService.compareMonthToPrevious(expenses, this.selectedMonth);
        const budgetStatuses = this.analyticsService.budgetUsage(expenses, categories, this.selectedMonth);

        const monthExpenses = expenses
          .filter(e => e.date.startsWith(this.selectedMonth))
          .sort((a, b) => b.date.localeCompare(a.date))
          .slice(0, 5);

        const recentExpenses = monthExpenses.map(expense => {
          const category = categories.find(c => c.id === expense.categoryId);
          return {
            ...expense,
            categoryName: category?.name || 'Unknown',
            categoryColor: category?.color || '#9E9E9E'
          };
        });

        return {
          totalSpent,
          avgPerDay,
          biggestCategory,
          comparison,
          budgetStatuses,
          recentExpenses
        };
      })
    );
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
